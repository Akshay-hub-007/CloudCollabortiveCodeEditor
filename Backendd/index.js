// Importing necessary modules
const startercode = require("./Startercode"); // Assign variable name to import
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
require('dotenv').config();
const express = require("express");
const cors = require('cors');
const Joi = require('joi');
const path=require("path")
const app = express();
const { v4: uuidv4 } = require('uuid');
const { colors } = require("./colours");

const { Liveblocks } = require("@liveblocks/node");
const { URL } = require("url");

app.use(express.json());
app.use(cors(
    {
     origin:['https://cloud-collabortive-code-editor.vercel.app','http://localhost:4173','https://cloudcollabortivecodeeditor-1-to4i.onrender.com'],
     credentials:true
    }
));
const liveblocks = new Liveblocks({
    secret: "sk_prod_MrS7ULPtVykBJJnYQ83Y9gLeMK7ykLh82SOHz3wtAKdZYK0uUn5_lDSS2vLsex6T",
  })
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Schema Definitions
const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
  generations: { type: Number, default: 0 },
});

const virtualboxSchema = new Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['react', 'node'], required: true },
    visibility: { type: String, enum: ['public', 'private'] },
    userId: { type: String, required: true, ref: 'User' },
});

const bucketSchema = new Schema({
    virtualboxId: { type: String},
    fileId: { type: String, required: true },
    data: { type: String, required: true },
});
const usersToVirtualboxesSchema = new Schema({
    userId: { type: String, required: true, ref: 'User' },
    virtualboxId: { type: String, required: true, ref: 'Virtualbox' },
    permission:{type:String,default:"write"},
    sharedOn: { type: Date, default: Date.now },
  });
  // Model Definitions
const User = mongoose.model('User', userSchema);
const Virtualbox = mongoose.model('Virtualbox', virtualboxSchema);
const Bucket = mongoose.model('Bucket', bucketSchema);
const UsersToVirtualboxes = mongoose.model('UsersToVirtualboxes', usersToVirtualboxesSchema);

// Fetch all users
app.get("/api/user", async (req, res) => {
    try {
        const userData = await User.find();
        if (userData.length === 0) {
            return res.status(404).send("User data not found");
        }
        res.send(userData);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

// Fetch user by ID with virtual box data
app.get("/api/user/:id", async (req, res) => {
    const id = req.params.id;
    console.log(id, "gh");
    try {
        if (id) {
            const user = await User.findOne({ id: id });
            console.log(user, "gf");

            // if (!user) {
            //     return res.status(404).send({ message: 'User not found' });
            // }

            // Ensure empty arrays if no data is found
            const virtualBoxData = await Virtualbox.find({ userId: user.id }) || [];
            const userTovirtualboxData = await UsersToVirtualboxes.find({ userId: user.id }) || [];

            const combinedUserData = {
                ...user.toObject(),
                virtualBoxes: virtualBoxData,
                userTovirtualboxData: userTovirtualboxData
            };

            res.send(combinedUserData);
        } else {
            res.status(400).send({ message: 'Invalid user ID' });
        }
    } catch (err) {
        console.error('Error fetching user and virtual boxes:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Fetch virtual boxes by userId
app.get("/api/user/virtualbox/:userId", async (req, res) => {
    const userId = String(req.params.userId); 
    try {
        const virtualBoxData = await Virtualbox.find({ userId });

        const userTovirtualboxData = await UsersToVirtualboxes.find({ userId });

        const combinedUserData = {
            virtualBoxes: virtualBoxData.length > 0 ? virtualBoxData : [], // Will be an empty array if no data
            userTovirtualboxData: userTovirtualboxData.length > 0 ? userTovirtualboxData : [] // Will be an empty array if no data
        };

        res.send(combinedUserData);
    } catch (err) {
        console.error('Error fetching virtual box:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Rename file in bucket
app.post('/api/rename', async (req, res) => {
    const renameSchema = Joi.object({
        fileId: Joi.string().required(),
        newFileId: Joi.string().required(),
        data: Joi.string().required(),
    });

    try {
        const { fileId, newFileId, data } = await renameSchema.validateAsync(req.body);

        const result = await Bucket.updateOne(
            { fileId },  // Find the document by fileId
            { $set: { fileId: newFileId, data } }  // Update fileId and data
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: "File not found" });
        }

        res.status(200).json({ success: true, message: "File renamed and updated" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});
app.post("/api/save", async (req, res) => {
    try {
        const { fileId, data } = req.body;
        if (!fileId || !data) {
            return res.status(400).json({ success: false, message: 'fileId and data are required' });
        }
        const existingBucketEntry = await Bucket.findOne({ fileId });
        console.log(existingBucketEntry)
        const updatedBucketEntry = await Bucket.findOneAndUpdate(
            { fileId }, 
            { data:data }, 
            { new: true, upsert: true } // Create if not found, otherwise update
        );
        console.log(updatedBucketEntry,"hello")
        const status = updatedBucketEntry.isNew ? 201 : 200;
        res.status(status).json({ success: true, message: 'File saved successfully' });
    } catch (error) {
        console.error('Error saving file:', error);
        res.status(500).json({ success: false, message: 'Error saving file', error: error.message });
    }
});
app.delete("/api/virtualbox/:id", async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
  
      await UsersToVirtualboxes.deleteMany({ virtualboxId: id });
  
      const deletedVirtualbox = await Virtualbox.findOneAndDelete({ id: id });
      
      if (!deletedVirtualbox) {
        return res.status(404).json({ message: "Virtualbox not found" });
      }
  
      console.log(deletedVirtualbox);
      return res.status(200).json({ message: "success" });
    } catch (err) {
      console.log("Error in deleting file", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
  app.get('/api/virtualbox/share', async (req, res) => {
    try {
        const { id } = req.query; 
        if (!id) {
          return res.status(400).json({ error: 'Invalid request, missing user id' });
        }
        const sharedBoxes = await UsersToVirtualboxes.find({ userId:id });
        const owners = await Promise.all(
          sharedBoxes.map(async (sharedBox) => {
            const vb = await Virtualbox.findOne({ id: sharedBox.virtualboxId});
            if (!vb) return null;
  
            const author = await User.findOne({ id: vb.userId });
            return {
              id: vb.id,
              name: vb.name,
              type: vb.type,
              author: {
                id: author.id,
                name: author.name,
                email: author.email,
              },
              sharedOn: sharedBox.sharedOn,
            };
          })
        );
    
        return res.json(owners.filter(Boolean)); 
      } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
app.post("/api/virtualbox/share", async (req, res) => {
    const { virtualboxId, email,permission } = req.body;
  console.log( virtualboxId, email,permission,"this virtual box sharing")
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const virtualbox = await Virtualbox.findOne({id:virtualboxId});
        if (!virtualbox) {
            return res.status(404).json({ error: "Virtualbox not found" });
        }
        await UsersToVirtualboxes.create({
            userId: user.id,
            virtualboxId: virtualboxId,
            permission,
            sharedOn: Date.now(),
            
        });
        return res.status(200).json({ message: "Virtualbox shared successfully" });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
});
app.delete("/api/virtualbox/share", async (req, res) => {
   
    const { virtualboxId, userId } = req.body;
    console.log( virtualboxId, userId,"deleting of virtualboxes");
    try {
        await UsersToVirtualboxes.deleteMany({ userId: userId, virtualboxId: virtualboxId });
        return res.status(200).send("success");
    } catch (err) {
        console.log("Error in deleting shared data", err);
        return res.status(500).send("Error in deleting shared data");
    }
});


app.post("/api/virtualbox", async (req, res) => {
    try {
      const { id} = req.body;
    //   console.log(id,name,visibility);
      const updatedBox = await Virtualbox.findOneAndUpdate(
        { id: id.id },
        {name:id.name,visibility:id.visibility },
        // { new: true } // Return the updated document
      );
  
      if (!updatedBox) {
        return res.status(404).json({ message: "Virtualbox not found" });
      }
  
      res.status(200).json({ message: "Update successful", data: updatedBox });
    } catch (err) {
      console.error("Error in updating:", err);
      res.status(500).json({ message: "Error in updating virtual box", error: err });
    }
  });
  
  
// Fetch virtual box by ID
app.get("/api/virtualbox/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const virtualboxData = await Virtualbox.findOne({ id });
        if (!virtualboxData) {
            return res.status(404).send("No virtual box data found");
        }
        const usersToVirtualboxes = await UsersToVirtualboxes.find({
            virtualboxId:id})
     
      // Return the virtualbox along with its related `usersToVirtualboxes`
      return res.json({ virtualboxData, usersToVirtualboxes });
        // res.send(virtualboxData);
    } catch (err) {
        res.status(500).send("Internal server error");
    }
});
app.get('/api', async (req, res) => {
    const virtualboxId = req.query.virtualboxId;
    const fileId = req.query.fileId;
    const folderId = req.query.folderId;

    try {
        if (fileId) {
            const result = await Bucket.findOne({ fileId });
            if (!result) {
                res.status(404).send(`${fileId} not found`);
            } else {
                res.status(200).send(result.data); // Assuming `data` contains the file content
            }
        } else if (folderId) {
            const result = await Bucket.find({ virtualboxId: folderId });
            res.status(200).json(result);
        } else 
        if (virtualboxId) {
            const result = await Bucket.find({ fileId: { $regex: `^projects/${virtualboxId}` } })
            res.status(200).json(result);
        } else {
            res.status(400).send('Invalid parameters');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.post("/api", async (req, res) => {
    try {
      const { fileId } = req.body;
      console.log(fileId);
  
      // Make sure fileId is provided
      if (!fileId) {
        return res.status(400).json({ error: "fileId is required" });
      }
  
      // Insert the fileId into the Bucket collection
      await Bucket.create({ fileId, data: " " }); // Corrected to use create
  
      res.status(200).json({ message: "File ID saved successfully!" });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "An error occurred while saving the file ID" });
    }
});
app.delete("/api", async (req, res) => {
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(400).json({ message: "fileId is required" });
        }

        const deletedFile = await Bucket.findOneAndDelete({ fileId: fileId });

        if (!deletedFile) {
            return res.status(404).json({ message: "File not found" });
        }

        res.status(200).json({ message: "File deleted successfully" });
    } catch (err) {
        console.error("Error in deleting file", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
app.get('/api/size', async (req, res) => {
	try {
		const { virtualboxId } = req.query;

		if (!virtualboxId) {
			return res.status(400).json({ error: 'Invalid request: missing virtualboxId parameter' });
		}

		// Use regex to match documents where a field starts with the given prefix
		const result = await Bucket.find({ fileId: { $regex: `^projects/${virtualboxId}` } });

		let size = 0;
		for (const file of result) {
			size += file.size;
		}

		return res.status(200).json({ size });
	} catch (error) {
		console.error('Error calculating size:', error);
		return res.status(500).json({ error: 'Server error' });
	}
});


app.put('/api/virtualbox', async (req, res) => {
    try {
        console.log(req.body)
        const virtualboxCount = await Virtualbox.countDocuments();
        const vb = new Virtualbox({
            id: uuidv4(),
            type: req.body.type,
            name: req.body.name,
            userId: req.body.userId,
            visibility: req.body.visibility,
        });

        const savedVirtualbox = await vb.save();

        // External API call
        const response = await fetch('https://cloudcollabortivecodeeditor-2xts.onrender.com/api/init', {
            method: 'POST',
            body: JSON.stringify({ virtualboxId: savedVirtualbox.id, type: vb.type }),
            headers: {
                'Content-Type': 'application/json',

            },
        });
        console.log("hello")
        if (!response.ok) {
            console.error('Error initializing virtual box');
            return res.status(500).json({ success: false, message: 'Failed to initialize virtual box' });
        }

        return res.status(200).json({ success: true, virtualboxId: savedVirtualbox.id });
    } catch (error) {
        console.error('Error creating virtual box:', error);
        return res.status(400).json({ success: false, message: error.message });
    }
});

app.post('/api/init', async (req, res) => {
    try {
        const { virtualboxId, type } = req.body;

        if (!virtualboxId || !type) {
            return res.status(400).json({ success: false, message: 'Invalid Request' });
        }

        if (!startercode[type] || !Array.isArray(startercode[type])) {

            return res.status(400).json({ success: false, message: 'Invalid type for starter code' });
        }

        await Promise.all(
    startercode[type].map(async (file) => {
        try {
            const bucketEntry = await Bucket.create({
                virtualboxId,
                fileId: `projects/${virtualboxId}/${file.name}`,
                data: file.body,
            });
            console.log('Bucket entry created:', bucketEntry);
        } catch (err) {
            console.error('Error saving to Bucket:', err);
        }
    })
);

        return res.status(201).json({ success: true, message: 'Virtual box initialized successfully' });
    } catch (error) {
        console.error('Error initializing virtual box:', error);
        return res.status(500).json({ success: false, message: 'Failed to initialize virtual box' });
    }
});

// app.post("/api/generate", async (req, res) => {
//     try {
//         const { userId } = req.body;

//         const dbUser = await User.findOne({ id: userId });
//         console.log(dbUser);
        
//         if (!dbUser) {
//             return res.status(404).send("User not found");
//         }

//         if (dbUser.generations == null) {
//             await User.findOneAndUpdate({ id: userId }, { generations: true });
//             return res.status(200).send("Generations set to true");
//         }

//         if (dbUser.generations !== null && dbUser.generations >= 30) {
//             return res.status(400).send("You reached the maximum # of generations.");
//         }

//         await User.findOneAndUpdate({ id: userId }, { generations: dbUser.generations + 1 });
//         res.status(200).send("Generation updated successfully");
        
//     } catch (err) {
//         console.log("Unable to generate:", err);
//         res.status(500).send("Internal Server Error");
//     }
// });
app.post('/api/virtualbox/generate', async (req, res) => {
    try {
      const { userId } = req.body;
  
      const dbUser = await User.findOne({ id: userId });
  
      if (!dbUser) {
        return res.status(400).send('User not found');
      }
  
      const generations = dbUser.generations ?? 0;
  
      if (generations >= 30) {
        return res.status(400).send('You reached the maximum # of generations.');
      }
  
      await User.findOneAndUpdate(
        { id: userId },
        { $inc: { generations: 1 } }
      );
  
      res.send({ success: true });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
  
// // const MAX_ROOMS_PER_TOKEN = 10;

// app.post("/api/liveblocks/:id", async (req, res) => {
//   const userId = req.params.id;
//   if (!userId) {
//     return res.status(401).send("Unauthorized");
//   }

//   try {
//     // Fetch user data
//     const userResponse = await fetch(`http://localhost:3000/api/user/${userId}`, {
//       method: "GET"
//     });
//     const user = await userResponse.json();

//     const colorNames = Object.keys(colors);
//     const randomColor = colorNames[Math.floor(Math.random() * colorNames.length)];

//     // Prepare the list of rooms
//     const rooms = [...user.virtualBoxes.map(vb => vb.id), ...user.userTovirtualboxData.map(utv => utv.virtualboxId)];

//     // Split rooms into batches
//     for (let i = 0; i < rooms.length; i += MAX_ROOMS_PER_TOKEN) {
//       const roomBatch = rooms.slice(i, i + MAX_ROOMS_PER_TOKEN);

//       // Create a new session for each batch
//       const session = liveblocks.prepareSession(user.id, {
//         userInfo: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           color: randomColor,
//         },
//       });

//       // Set permissions for each room in the batch
//       roomBatch.forEach((roomId) => {
//         session.allow(`${roomId}`, session.FULL_ACCESS);
//       });

//       // Authorize the session
//       const { body, status } = await session.authorize();
      
//       // Check if authorization failed for this batch
//       if (status !== 200) {
//         console.error("Authorization failed for batch:", roomBatch);
//         return res.status(status).send(body);
//       }

//       // Send the response for the last authorized batch
//       if (i + MAX_ROOMS_PER_TOKEN >= rooms.length) {
//         res.status(status).send(body);
//       }
//     }
//   } catch (error) {
//     console.error("Error authorizing session:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });
//orginal
app.post("/api/liveblocks/:id", async (req, res) => {

  const userId=req.params.id
    if (!userId) {
      return res.status(401).send("Unauthorized");
    }
  
    try {

        const userResponse = await fetch(
            `https://cloudcollabortivecodeeditor-2xts.onrender.com/api/user/${userId}`,
            {
              method: "GET" 
            }
          );
       console.log("hell",userResponse)
      const user = await userResponse.json();
      console.log(user)
      const colorNames = Object.keys(colors);
      const randomColor = colorNames[Math.floor(Math.random() * colorNames.length)];
      const code = colors[randomColor];
  
      const session = liveblocks.prepareSession(user.id, {
        userInfo: {
          id: user.id,
          name: user.name,
          email: user.email,
          color: randomColor,
        },
      });
  
      // Set permissions for each virtualbox
      user.virtualBoxes.forEach((virtualbox) => {
        session.allow(`${virtualbox.id}`, session.FULL_ACCESS);
      });
  
      user.userTovirtualboxData.forEach((userToVirtualbox) => {
        session.allow(`${userToVirtualbox.virtualboxId}`, session.FULL_ACCESS);
      });
  
      const { body, status } = await session.authorize();
      res.status(status).send(body);
    } catch (error) {
      console.error("Error authorizing session:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  app.post('/api/user', async (req, res) => {
    try {
      
        console.log(req.body);
        const { id, name, email } =  req.body;

        const result = await User.create({ id, name, email });

        res.status(201).send(result);
    } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
    }
});
// Start the server

const MAX_ROOMS_PER_TOKEN = 20;

// app.post("/api/liveblocks/:id", async (req, res) => {
//   const userId = req.params.id;
//   if (!userId) {
//     return res.status(401).send("Unauthorized");
//   }

//   try {
//     // Fetch user data
//     const userResponse = await fetch(`http://localhost:3000/api/user/${userId}`, {
//       method: "GET"
//     });
//     const user = await userResponse.json();

//     const colorNames = Object.keys(colors);
//     const randomColor = colorNames[Math.floor(Math.random() * colorNames.length)];

//     // Gather room IDs
//     const rooms = [
//       ...user.virtualBoxes.map(vb => vb.id),
//       ...user.userTovirtualboxData.map(utv => utv.virtualboxId)
//     ];

//     // Process rooms in batches of up to 10
//     for (let i = 0; i < rooms.length; i += MAX_ROOMS_PER_TOKEN) {
//       const roomBatch = rooms.slice(i, i + MAX_ROOMS_PER_TOKEN);

//       // Create a new session for each batch
//       const session = liveblocks.prepareSession(user.id, {
//         userInfo: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           color: randomColor,
//         },
//       });

//       // Set permissions for each room in the batch
//       roomBatch.forEach((roomId) => {
//         session.allow(roomId, session.FULL_ACCESS);
//       });

//       // Authorize session and handle response
//       const { body, status } = await session.authorize();
      
//       // Send response for last batch only
//       if (i + MAX_ROOMS_PER_TOKEN >= rooms.length) {
//         return res.status(status).send(body);
//       }
//     }
//   } catch (error) {
//     console.error("Error authorizing session:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.listen(3000, () => {
    console.log(`Server running on port ${port}`);
});
