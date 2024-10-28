import { File, FilePlus, Folder, FolderPlus, Search } from 'lucide-react';
import React from 'react';
import { getIconForFile } from 'vscode-icons-js';

function Sidebar() {
  

  return (
    <div className='h-full w-56 flex flex-col item-start p-2'>
      <div className='flex w-full items-center justify-between h-8 mb-1'>
        <div className='text-muted-foreground'>EXPLORER</div>
        <div className='flex space-x-1'>
          <div className="h-6 w-6 text-muted-foreground ml-0.5 flex items-center translate-x-1 transition-colors hover:bg-muted-foreground/25 cursor-pointer rounded-sm">
            <FilePlus className="h-4 w-4" />
          </div>
          <div className="h-6 w-6 text-muted-foreground ml-0.5 flex items-center translate-x-1 transition-colors hover:bg-muted-foreground/25 cursor-pointer rounded-sm">
            <FolderPlus className="h-4 w-4" />
          </div>
          <div className="h-6 w-6 text-muted-foreground ml-0.5 flex items-center translate-x-1 transition-colors hover:bg-muted-foreground/25 cursor-pointer rounded-sm">
            <Search className="w-4 h-4" />
          </div>
        </div>
      </div>
      <div className='w-full mt-2'>
        <div className='w-full flex items-center h-6 transition-colors hover:text-muted-foreground cursor-pointer'>
          {getIconForFile("index.html") ? (
            <img src={`icons/${getIconForFile("index.html")}`} alt="File Icon" width={16} height={16} className='mr-2' />
          ) : (
            <File className="h-4 w-4 mr-2" />
          )}
          index.html
        </div>
        <div className='w-full flex items-center h-6 transition-colors hover:text-muted-foreground cursor-pointer'>
          {getIconForFile("styles.css") ? (
            <img src={`icons/${getIconForFile("styles.css")}`} alt="File Icon" width={16} height={16} className='mr-2' />
          ) : (
            <File className="h-4 w-4 mr-2" />
          )}
         styles.css
        </div>
        <div className='w-full flex items-center h-6 transition-colors hover:text-muted-foreground cursor-pointer'>
          <Folder className="h-4 w-4 mr-2" />
          styles
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
