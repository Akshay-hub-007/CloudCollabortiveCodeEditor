import { FilePlus, FolderPlus, Loader2, Search } from "lucide-react";
import SidebarFile from "./File";
import SidebarFolder from "./Folder";
import { useState } from "react";
import New from "./New";
function  Sidebar({ files, selectFile ,handleRename,socket,addNew,handleDeleteFile, handleDeleteFolder}) {
   if(files){
  const flattenedArray = files.flat();
   const [creatingNew,setCreatingNew]=useState(null);

  return (
    <div className='h-full w-56 flex flex-col item-start p-2'>
      <div className='flex w-full items-center justify-between h-8 mb-1'>
        <div className='text-muted-foreground'>Explorer</div>
        <div className='flex space-x-1'>
          <button 
          onClick={()=>setCreatingNew("file")}
          className="h-6 w-6 text-muted-foreground ml-0.5 flex items-center translate-x-1 transition-colors hover:bg-muted-foreground/25 cursor-pointer rounded-sm">
            <FilePlus className="h-4 w-4" />
          </button>
          <button 
          onClick={()=>setCreatingNew("folder")}
          className="h-6 w-6 text-muted-foreground ml-0.5 flex items-center translate-x-1 transition-colors hover:bg-muted-foreground/25 cursor-pointer rounded-sm">
            <FolderPlus className="h-4 w-4" />
          </button>
          <div className="h-6 w-6 text-muted-foreground ml-0.5 flex items-center translate-x-1 transition-colors hover:bg-muted-foreground/25 cursor-pointer rounded-sm">
            <Search className="w-4 h-4" />
          </div>
        </div>
      </div>
      <div className="w-full mt-1 flex flex-col">
        {flattenedArray && flattenedArray.length === 0 ? (
          <div className="flex justify-center w-full">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        ) : (
          flattenedArray&& flattenedArray.map((child) => 
           child.type === "file" ? (
              <SidebarFile key={child.id} data={child} selectFile={selectFile} handleRename={handleRename} handleDeleteFile={handleDeleteFile} handleDeleteFolder={handleDeleteFolder} />
            ) : (
              <SidebarFolder key={child.id} data={child} selectFile={selectFile} handleRename={handleRename} handleDeleteFile={handleDeleteFile} handleDeleteFolder={handleDeleteFolder}/>
            )
          )
        )}
        {creatingNew!==null?(<New type={creatingNew} stopEditing={()=>setCreatingNew(null)} socket={socket} addNew={addNew}/>):null}
      </div>
    </div>
  );
}
}
export default Sidebar;
