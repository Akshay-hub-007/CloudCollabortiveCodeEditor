const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const Joi = require("joi");
const getVirtualBoxFiles = require("./src/getVirtualboxFiles");
const { renamedFile, saveFile, createFile, deleteFile, generateCode, getProjectSize, getfolder } = require("./src/utils");
const path = require("path");
const fs = require("fs");
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4000;
const Pty = require("./src/terminal");
const {IPty,spawn}=require("node-pty")
const os=require("os");
const { log } = require("console");
const { saveFileRL, createFileRL, deleteFileRL, renameFileRL, MAX_BODY_SIZE } = require("./src/ratelimiter");
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173','https://cloud-collabortive-code-editor.vercel.app/'],
    methods:['GET','POST'],
    credentials:true
  },
});
let isOwnerConnected=false
let inactivityTimeout=null
const dirName = path.join(__dirname, "..");
const terminals = {};

const handshakeSchema = Joi.object({
  userId: Joi.string().required(),
  virtualboxId: Joi.string().required(),
  EIO: Joi.string(),
  transport: Joi.string(),
  t: Joi.string(),
});

io.use(async (socket, next) => {
  const query = socket.handshake.query;
  const { error, value } = handshakeSchema.validate(query);
  if (error) {
    console.error("Schema validation failed:", error.details);
    return next(new Error("Invalid connection parameters"));
  }

  const { userId, virtualboxId } = value;
  console.log("hello", userId, virtualboxId)
  try {
    const response = await fetch(`https://cloudcollabortivecodeeditor-2xts.onrender.com/api/user/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user data");

    const userData = await response.json();
    const virtualbox = userData.virtualBoxes.find((v) => v.id === virtualboxId);

    if (!virtualboxId) {
      return next(new Error("Invalid virtualbox ID"));
    }

    socket.data = {
     virtualboxId,
      userId,
      isOwner: virtualbox !== undefined,
    };
    next();
  } catch (error) {
    console.error("API request failed:", error.message);
    next(new Error("API request failed"));
  }
});

io.on("connection", async (socket) => {
  console.log(`Client connected with ID: ${socket.id}`);
  const { userId,virtualboxId ,isOwner} = socket.data;
 console.log(virtualboxId,userId)
//  if(isOwner)
//  {
//   isOwnerConnected=true
//  }else{
//   socket.emit("disabledAccess","the virtualbox owner is not connected")
//   return;
//  }
  // Load virtual box files when client connects
  const virtualboxFiles = await getVirtualBoxFiles(virtualboxId);
 console.log(virtualboxFiles,"VEFv")
  console.log("Loading files for virtualbox:", virtualboxFiles);

  // Ensure all files are written before proceeding
  try {
    await Promise.all(
      virtualboxFiles.fileData.map((file) => {
        return new Promise((resolve, reject) => {
          const filePath = path.join(dirName, file.id);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFile(filePath, file.data, function (err) {
            if (err) {
              console.error("Error writing file:", err.message);
              socket.emit("fileWriteError", err.message);
              return reject(err); // Reject if any error occurs
            }
            resolve(); // Resolve once the file is written
          });
        });
      })
    );
    // Emit success once all files are loaded
    console.log(virtualboxFiles.files,"yuvuyvyguuigi")
    socket.emit("loaded", virtualboxFiles.files);
    console.log("All files successfully loaded.");
  } catch (error) {
    console.error("Error while loading files:", error.message);
    socket.emit("fileLoadError", "Failed to load files.");
    return;
  }

  // File handling
  socket.on("getFile", (fileId, callback) => {
    const file = virtualboxFiles.fileData.find((f) => f.id === fileId);
    if (!file) return callback({ error: "File not found" });
    callback(file.data);
  });

  socket.on("saveFile", async (fileId, body) => {
    try{
      if(Buffer.byteLength(body,"utf-8")>MAX_BODY_SIZE)
      {
        socket.emit("rateLimit","Rate Limited:the file size is too large.Please reduce")
        return 
      }
      await saveFileRL.consume(userId,1)
      const file = virtualboxFiles.fileData.find((f) => f.id === fileId);
      if (!file) return;
  
      file.data = body;
      fs.writeFile(path.join(dirName, file.id), body, function (err) {
        if (err) {
          console.error("Error saving file:", err.message);
          socket.emit("saveFileError", err.message);
          return;
        }
      })
      await saveFile(fileId, body); 

        }catch(err)
        {
          io.emit("rateLimit","Rate limited:file saving:please slow down")
        }
      });


  socket.on("createFile", async (name,callback) => {
    try{
      // const size= await getProjectSize(virtualboxId)
      // if(size>200*1024*1024)
      // {
      //   socket.emit("rateLimit","Rate limit project size exceeded")
      // }
      // callback({success:false})
      // await createFileRL.consume(userId,1);
      const id = `projects/${virtualboxId}/${name}`;
      fs.writeFile(path.join(dirName, id), "", function (err) {
        if (err) {
          console.error("Error creating file:", err.message);
          socket.emit("createFileError", err.message);
          return;
        }
      });
  
      virtualboxFiles.files.push({
        id,
        name,
        type: "file",
      });
      console.log(id)
      await createFile(id);
      callback({success:true})

    }catch(e)
    { 
      io.emit("rateLimit","Rate limited:file saving:please slow down")

    }
  
  });
  socket.on("moveFile",async(fileId,folderId,callback)=>{
    const file=virtualboxFiles.fileData.find((f)=>f.id===fileId)
    if(!file) return 
    const parts=fileId.split("/")
    const newFileId=folderId+"/"+parts.pop()
    fs.rename(
      path.join(dirName,fileId),
      path.join(dirName,newFileId),
       function(err)
       {
        if(err) throw err;
       }
    )
    file.id=newFileId

    await renamedFile(fileId,newFileId,file.data)

    const newFiles=await getVirtualBoxFiles(virtualboxId)

    callback(newFiles.files)
  })
socket.on("deleteFile",async(fileId,callback)=>{
 try{
  await deleteFileRL.consume(virtualboxId,1)
  const file = virtualboxFiles.fileData.find((f) => f.id == fileId);
  fs.unlink(path.join(dirName,fileId),function(err){
    if(err) throw err
  })
  virtualboxFiles.fileData=virtualboxFiles.fileData.filter((f)=> f.id!==fileId)
  await deleteFile(fileId);

  const newFiles=await getVirtualBoxFiles(virtualboxId)
   callback(newFiles.files)
 }catch(err)
{
  io.emit("rateLimit","Rate limited:file saving:please slow down")
}
 
})

socket.on("resizeTerminal",(dimensions)=>
{
  Object.values(terminals.forEach((t)=>{
    t.terminal.resize(dimensions.cols,dimensions.rows);

  }
  ))
})
  socket.on("renameFile", async (fileId, newName) => {
   try{
      renameFileRL.consume(virtualboxId,1);
      const file = virtualboxFiles.fileData.find((f) => f.id === fileId);
      if (file) {
        try {
          file.id = newName;
          const parts = fileId.split("/");
          if (!parts || parts.length === 0) {
            socket.emit("renameError", "Invalid file ID format");
            return;
          }
          const newFileId = parts.slice(0, parts.length - 1).join("/") + "/" + newName;
  
          fs.rename(path.join(dirName, fileId), path.join(dirName, newFileId), function (err) {
            if (err) {
              console.error("Error renaming file:", err.message);
              socket.emit("renameError", err.message);
              return;
            }
          });
  
          await renamedFile(fileId, newFileId, file.data);
  
          socket.emit("renameSuccess", { fileId, newName });
        } catch (error) {
          console.error("Error renaming file:", error.message);
          socket.emit("renameError", error.message);
        }
      } else {
        socket.emit("renameError", "File not found");
      }
   }catch(e)
   {
    io.emit("rateLimit","Rate limited:file saving:please slow down")

   }
    
  });

  socket.on("getFolder",async(folderId,callback)=>{
    const files=await getfolder(folderId)
    callback(files);
  })
  socket.on("deleteFolder",async(folderId,callback)=>{
    const files=await getfolder(folderId)
    await Promise.all(files.map(async(file)=>{
      fs.unlink(path.join(dirName,file),function(err)
    {
      if(err) throw err
    })
    virtualboxFiles.fileData=virtualboxFiles.fileData.filter(
      (f)=>f.id !== file
    )
    await deleteFile(file)
    }))
    const newFiles=await getVirtualBoxFiles(virtualboxId);

    callback(newFiles.files)
  })
  socket.on("renamefolder",async(folderId,callback)=>{

  })

  socket.on("createFolder",async(name,callback)=>{
    try{
          const id=`project/${data.id}/${name}`
          fs.mkdir(path.join(dirName,id),{recursive:true},function(err)
        {
          if(err)
          {
             throw err;
          }
        })
        callback();
    }catch(e)
    {

    }
  })
  socket.on(
    "generateCode",
    async (fileName, code, line, instructions, callback) => {
        try {
            const fetchPromise = fetch(
                `https://cloudcollabortivecodeeditor-2xts.onrender.com/api/virtualbox/generate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: userId,
                    }),
                }
            );

            const generateCodePromise = generateCode({
                fileName,
                code,
                line,
                instructions,
            });
             await generateCodePromise.then((res)=>{
              console.log(res)
             }).catch((e)=>{
              console.log(e)
             })
            const result = await generateCodePromise;

            callback({ success: true, response: result });
        } catch (error) {
            console.error("Error during code generation:", error);
            callback({ success: false, error: "Code generation failed." });
        }
    }
);
  // Terminal handling
socket.on("createTerminal", (id,callback) => {
  if(terminals[id] || Object.keys(terminals).length>=4)
  { 
    return;
  }
    if(terminals[id])
    {
      console.log("Terminal already exists")
      return
    }  
    if(Object.keys(terminals).length>=4)
    {
      console.log("Too many terminals");
      return
    }
    const pty=spawn(os.platform()==="win32"?"cmd.exe":"bash",[],{
      name:"xterm", 
      cols:100,
      cwd:path.join(dirName,"projects",virtualboxId)
    })
    const onData=pty.onData((data)=>{
      io.emit("terminalResponse",{
        id,
        data
      })
    })
    const onExit=pty.onExit((code)=>console.log("exit:",code))
    pty.write("clear\r")
    terminals[id] ={
      terminal:pty,onData,onExit
    }
    

    console.log(`Terminal created with ID: ${id}`);
    callback()
  });
socket.on("closeTerminal",(id,callback)=>{
  // console.log(callback)
 if(!terminals[id])
 {
  console.log("tried to close ,but term does not exist")
  return;
}
terminals[id].onData.dispose()
terminals[id].onExit.dispose()

 delete terminals[id]
 callback()
})
  socket.on("terminalData", (id, data) => {
    console.log(`Received terminal data for ${id}: ${data}`);
     try{
      if (terminals[id]) {
        terminals[id].terminal.write(data);
      } 
     }catch(err)
     {
      console.log("Error in the writing terminal",err)
     }
   
    
  });

  // Clean up on disconnect
  socket.on("disconnect", async () => {
    if (isOwner) {
      Object.entries(terminals).forEach((t) => {
        const { terminal, onData, onExit } = t[1];
        if (os.platform() !== "win32") terminal.kill();
        onData.dispose();
        onExit.dispose();
        delete terminals[t[0]];
      });

      console.log("The owner disconnected");
      socket.broadcast.emit("ownerDisconnected");
    } else {
      console.log("A shared user disconnected.");
      socket.broadcast.emit(
        "disableAccess",
        "The virtualbox owner has disconnected."
      );
    }

    const sockets = await io.fetchSockets();
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
    if (sockets.length === 0) {
      inactivityTimeout = setTimeout(() => {
        io.fetchSockets().then((sockets) => {
          if (sockets.length === 0) {
            console.log("No users have been connected for 15 seconds");
          }
        });
      }, 15000);
    }
  });
});


httpServer.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});
