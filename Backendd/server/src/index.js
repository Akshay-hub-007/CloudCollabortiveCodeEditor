const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");
const Joi = require("joi");
const getVirtualBoxFiles = require("./getVirtualboxFiles");
const { renamedFile, saveFile, createFile, deleteFile, generateCode } = require("./utils");
const path = require("path");
const fs = require("fs");
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4000;
const Pty = require("./terminal");
const {IPty,spawn}=require("node-pty")
const os=require("os")
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

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
  try {
    const response = await fetch(`http://localhost:3000/api/user/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user data");

    const userData = await response.json();
    const virtualbox = userData.virtualBoxes.find((v) => v.id === virtualboxId);

    if (!virtualbox) {
      return next(new Error("Invalid virtualbox ID"));
    }

    socket.data = { userId, virtualboxId };
    next();
  } catch (error) {
    console.error("API request failed:", error.message);
    next(new Error("API request failed"));
  }
});
io.on("connection", async (socket) => {
  console.log(`Client connected with ID: ${socket.id}`);
  const { userId,virtualboxId } = socket.data;

  // Load virtual box files when client connects
  const virtualboxFiles = await getVirtualBoxFiles(virtualboxId);

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
    const file = virtualboxFiles.fileData.find((f) => f.id === fileId);
    if (!file) return;

    file.data = body;
    fs.writeFile(path.join(dirName, file.id), body, function (err) {
      if (err) {
        console.error("Error saving file:", err.message);
        socket.emit("saveFileError", err.message);
        return;
      }
    });

    await saveFile(fileId, body); // Save file to the server
  });

  socket.on("createFile", async (name) => {
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
  });
socket.on("deleteFile",async(fileId,callback)=>{

  const file = virtualboxFiles.fileData.find((f) => f.id == fileId);
  fs.unlink(path.join(dirName,fileId),function(err){
    if(err) throw err
  })
  virtualboxFiles.fileData=virtualboxFiles.fileData.filter((f)=> f.id!==fileId)
  await deleteFile(fileId);

  const newFiles=await getVirtualBoxFiles(virtualboxId)
   callback(newFiles.files)
})
  socket.on("renameFile", async (fileId, newName) => {
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
  });
  socket.on(
    "generateCode",
    async (fileName, code, line, instructions, callback) => {
        try {
            const fetchPromise = fetch(
                `http://localhost:3000/api/generate`,
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
  socket.on("createTerminal", (id) => {
    const pty=spawn(os.platform()==="win32"?"cmd.exe":"bash",[],{
      name:"xterm",
      cols:100,
      cwd:path.join(dirName,"projects",virtualboxId)
    })
    const onData=pty.onData((data)=>{
      socket.emit("terminalResponse",{
        data
      })
    })
    const onExit=pty.onExit((code)=>console.log("exit:",code))
    pty.write("clear\r")
    terminals[id] ={
      terminal:pty,onData,onExit
    }
    console.log(`Terminal created with ID: ${id}`);
  });

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
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    Object.entries(terminals).forEach((t) => {
      const {terminal ,onData ,onExit}=t[1];
    if(os.platform() !=="win32") terminal.kill();
    delete terminals[t[0]]
    });
  });
});

httpServer.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
});
