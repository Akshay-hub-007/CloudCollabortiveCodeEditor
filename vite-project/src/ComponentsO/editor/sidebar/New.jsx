import React, { useState, useEffect, useRef } from 'react';
import { getIconForFile } from 'vscode-icons-js';
import { Socket } from 'socket.io-client';
import { validateName } from '../../../lib/utils';

function New({ socket, type, stopEditing, addNew }) {
  const inputRef = useRef(null);

  const createNew = () => {
    const name = inputRef.current?.value;
    
    // Validate the name before proceeding
    if (name && validateName(name,"", type)) {
      if (type === 'file') {
        socket.emit("createFile", name);
      }
      addNew(name, type);
    }
    stopEditing();
  };

  useEffect(() => {
    // Focus the input field when the component mounts
    inputRef.current?.focus();
  }, []);

  return (
    <div className="w-full flex items-center h-7 px-1 hover: rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
      <img
        src={type === 'file' ? '/icons/default_file.svg' : '/icons/default_folder.svg'}
        width={18}
        height={18}
        className="mr-2"
        alt={type === 'file' ? 'File Icon' : 'Folder Icon'}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createNew();
        }}
      >
        <input
          className="bg-transparent border-white w-full rounded-sm transition-all focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          type="text"
          ref={inputRef}
          onBlur={() => createNew()}
        />
      </form>
    </div>
  );
}

export default New;
