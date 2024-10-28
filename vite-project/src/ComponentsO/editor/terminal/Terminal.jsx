import { Socket } from "socket.io-client";
import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from "@xterm/xterm";
import { decodeTerminalResponse } from "../../../lib/utils";
import { FitAddon } from "@xterm/addon-fit";
import "./xterm.css"
import { Loader, Loader2 } from "lucide-react";
export default function EditorTerminal({ socket }) {
  const terminalRef = useRef(null);
  const [term, setTerm] = useState(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      theme:{
        background:"#262626"
      },
      fontSize:14,
      fontFamily:"var(--font-geist-mono)",
   
    });

    setTerm(terminal);

    return () => {
      if (terminal) terminal.dispose();
    };
  }, []);

  useEffect(() => {
    if (!term) return;

    const terminalId = "testId";  // Replace with dynamic ID if needed

    const onConnect = () => {
      setTimeout(() => {
        socket.emit("createTerminal", terminalId);
      }, 500);
    };

    const onTerminalResponse = (response) => {
        const res=response.data
        console.log("terminal Response",response)
        term.write(res)
    };

    socket.on("connect", onConnect);
    socket.on("terminalResponse", onTerminalResponse);

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    const disposable = term.onData((data) => {
      socket.emit("terminalData", 
        "testId", // Pass terminal ID
        data,
      );
    });

    socket.emit("terminalData", "\n");

    return () => {
      socket.off("connect", onConnect);
      socket.off("terminalResponse", onTerminalResponse);
      disposable.dispose();
    };

  }, [term, socket]);

  return (
    <div ref={terminalRef} className="w-full h-full  text-sm text-left">
      {term===null? (
        <div className="flex items-center text-muted-foreground p-2">
        <Loader2 className="animate-spin mr-2 w-4 h-4"/>
        <span>Connecting to terminal....</span>
      </div>):null}
    </div>
  );
}
