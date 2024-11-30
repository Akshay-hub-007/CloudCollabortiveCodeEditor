import { Socket } from "socket.io-client";
import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from "@xterm/xterm";
import { decodeTerminalResponse } from "../../../lib/utils";
import { FitAddon } from "@xterm/addon-fit";
import "./xterm.css"
import { Loader, Loader2 } from "lucide-react";
export default function EditorTerminal({id, socket,term,setTerm,visible }) {
  const terminalRef = useRef(null);
  // const [term, setTerm] = useState(null);

  useEffect(() => {
    if (!terminalRef.current) return;

     if(term) return;
    const terminal = new Terminal({
      cursorBlink: true,
      theme:{
        background:"#262626"
      },
      fontSize:14,
      fontFamily:"var(--font-geist-mono)",
      lineHeight:1.5,
      letterSpacing:0,

    });

    setTerm(terminal);

    return () => {
      if (terminal) terminal.dispose();
    };
  }, [terminalRef.current]);

useEffect(() => {
  if (!term || !terminalRef.current) return;

  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.open(terminalRef.current);
  fitAddon.fit();

  const disposableOnData = term.onData((data) => {
    term.write(data)
    socket.emit("terminalData", id, data);
  });

  const disposableOnResize = term.onResize((dimensions) => {
    fitAddon.fit();
    socket.emit("terminalResize", dimensions);
  });

  return () => {
    disposableOnData.dispose();
    disposableOnResize.dispose();
  };
}, [term, socket, id]);

return (
  <div 
    ref={terminalRef}  
    style={{display: visible ? "block" : "none"}} 
    className="w-full h-full text-left"
  >
    {term === null ? (
      <div className="flex items-center text-muted-foreground p-2">
        <Loader2 className="animate-spin mr-2 w-4 h-4"/>
        <span>Connecting to terminal....</span>
      </div>
    ) : null}
  </div>
);
}
