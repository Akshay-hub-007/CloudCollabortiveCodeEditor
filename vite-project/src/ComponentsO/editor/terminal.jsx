import { Socket } from "socket.io-client";
import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from "@xterm/xterm";
import { decodeTerminalResponse } from "../../lib/utils";
import { FitAddon } from "@xterm/addon-fit";

export default function EditorTerminal({ socket }) {
  const terminalRef = useRef(null);
  const [term, setTerm] = useState(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new Terminal({
      cursorBlink: false,
      theme:{
        background:"#262626",
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

    const terminalId = "testId";  
    const onConnect = () => {
      setTimeout(() => {
        socket.emit("createTerminal", terminalId);
      }, 2000);
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
    <div ref={terminalRef} className="w-full h-1/2 text-left"></div>
  );
}
