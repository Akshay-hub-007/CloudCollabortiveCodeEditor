const { IPty, spawn } = require('node-pty');
const os = require('os');
const fs = require('fs'); // To check if cwd exists

class Pty {
    constructor(socket, id, cwd) {
        this.socket = socket;
        this.id = id
      

        // Validate cwd (current working directory) before spawning
        if (!fs.existsSync(cwd)) {
            console.error(`Invalid cwd: ${cwd}`);
            socket.emit("error", { message: `Invalid working directory: ${cwd}` });
            return;
        }

        try {
            // Spawn the pty process
            this.ptyProcess = spawn(os.platform==="win32"?"cmd.exe":"bash", [], {
                name: "xterm",
                cols: 100,
                cwd: cwd, // Valid directory must be provided
            });

            // Listen to "data" event from ptyProcess
            this.ptyProcess.on("data", (data) => {
                this.send(data);
            });

            // Handle process exit (optional but recommended)
            this.ptyProcess.on("exit", (code) => {
                console.log(`Pty process exited with code ${code}`);
                this.socket.emit("terminalExit", { id: this.id, code });
            });
        } catch (error) {
            console.error("Failed to spawn pty process:", error);
            this.socket.emit("error", { message: "Failed to spawn terminal process." });
        }
    }

    write(data) {
        // Writing data to the terminal process
        if (this.ptyProcess) {
            this.ptyProcess.write(data);
        }
    }

    send(data) {
        // Send data to the client
        this.socket.emit("terminalResponse", {
            data: Buffer.from(data, "utf-8").toString(),
        });
    }

    // Clean up when socket disconnects
    destroy() {
        if (this.ptyProcess) {
            this.ptyProcess.kill();
        }
    }
}

module.exports = Pty;
