import React, { useEffect, useRef, useState } from 'react';
import { getIconForFolder, getIconForOpenFolder } from 'vscode-icons-js';
import SidebarFile from './File';

function SidebarFolder({ data, selectFile ,handleRename,handleDeleteFile,handleDeleteFolder}) {
  const [isOpen, setIsOpen] = useState(false);
  const folderIcon = isOpen ? getIconForOpenFolder(data.name) : getIconForFolder(data.name);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const renameFolder=()=>{
    const renamed=handleRename(
     data.id,
     inputRef.current?.value??data.name,
     data.name,
     "file"
    )
    if(!renamed && inputRef.current)
    {
     inputRef.current.name=data.name;
    }
    setEditing(false);
   }
   useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]); 

  return (
    <>
      <div 
      onDoubleClick={()=>setEditing(true)}
        className='w-full flex items-center h-7 px-1 transition-colors hover:text-muted-foreground cursor-pointer rounded-sm'
        onClick={() => setIsOpen(!isOpen)} 
      >
        <img src={`icons/${folderIcon}`} className="h-4 w-4 mr-2" alt="" />
        
      <form onSubmit={(e) => {
        e.preventDefault();
        setEditing(false);
}}>
        <input
          className={`bg-transparent w-full  ${editing ? "" : "pointer-events-none"}`} // Fix space issue
          type="text"
          ref={inputRef}
          disabled={!editing}
          defaultValue={data.name}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setEditing(false); // Allow exiting editing mode on Enter key
            }
          }}
        />
      </form>
      </div>
      {isOpen && (
        <div className="flex w-full items-stretch">
          <div className="w-[1px] bg-border mx-2 h-full"></div>
          <div className='flex flex-col grow'>
            {data.children.map((child) => 
              child.type === "file" ? (
                <SidebarFile key={child.id} data={child} selectFile={selectFile}  handleRename={handleRename} handleDeleteFile={handleDeleteFile} handleDeleteFolder={handleDeleteFolder}/>
              ) : (
                <SidebarFolder key={child.id} data={child} selectFile={selectFile}   handleRename={handleRename} handleDeleteFile={handleDeleteFile} handleDeleteFolder={handleDeleteFolder}/>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default SidebarFolder;
