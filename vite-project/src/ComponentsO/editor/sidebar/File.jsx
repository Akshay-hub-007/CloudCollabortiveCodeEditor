import { Ghost, Loader2, Pencil, Trash2 } from 'lucide-react'; // Ensure you import necessary icons
import React, { useState, useEffect, useRef } from 'react';
import { getIconForFile } from 'vscode-icons-js';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "../../../components/ui/context-menu";

function SidebarFile({ data, selectFile, handleRename, handleDeleteFile }) {
  const iconPath = getIconForFile(data.name);
  const [imgSrc, setImageSrc] = useState(iconPath ? `/icons/${iconPath}` : null);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  const handleError = () => {
    setImageSrc('/icons/default_file.svg'); // Updated default file path
  };

  useEffect(() => {
    if (editing) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    if (!inputRef.current) console.log("no input ref");
  }, [editing]);

  const renameFile = () => {
    const renamed = handleRename(
      data.id,
      inputRef.current?.value ?? data.name,
      data.name,
      "file"
    );
    if (!renamed && inputRef.current) {
      inputRef.current.value = data.name;
    }
    setEditing(false);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          disabled={pendingDelete}
          onClick={() => {
            if (!editing && !pendingDelete) {
              selectFile({ ...data, saved: true });
            }
          }}
          className="data-[state=open]:bg-secondary/50 w-full flex items-center h-7 px-1 hover:bg-ghost rounded-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-ring"
        >
          <img src={imgSrc} alt="" width={18} height={18} className='mr-2' onError={handleError} />
          {pendingDelete ? (
            <>
              <Loader2 className="text-muted-foreground w-4 h-4 animated-spin mr-2" />
              <div className='text-muted-foreground'></div>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                renameFile();
              }}
            >
              <input
                className={`bg-transparent w-full ${editing ? "" : "pointer-events-none"}`}
                type="text"
                ref={inputRef}
                disabled={!editing}
                defaultValue={data.name}
                onBlur={() => {
                  renameFile();
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    renameFile();
                    setEditing(false);
                  }
                }}
              />
            </form>
          )}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem
            onClick={() => {
              setEditing(true);
            }}
          >
            <Pencil className='w-4 h-4 mr-2' />Rename
          </ContextMenuItem>
          <ContextMenuItem
            disabled={pendingDelete}
            onClick={() => {
              setPendingDelete(true);
              handleDeleteFile(data);
            }}
          >
            <Trash2 className='w-4 h-4 mr-2' />Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}

export default SidebarFile;
