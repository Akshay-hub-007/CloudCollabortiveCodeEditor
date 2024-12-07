import { FilePlus, FolderPlus, Loader2, MonitorPlay, Search, Sparkles } from "lucide-react";
import SidebarFile from "./File.jsx";
import SidebarFolder from "./Folder.jsx";
import { useEffect, useRef, useState } from "react";
import New from "./New.jsx";
import Toggle from "../../../components/ui/customToggle";
import { draggable, dropTargetForElements, monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { Switch } from "../../../components/ui/switch";
import { Button } from "../../../components/ui/button";
function Sidebar({ files, selectFile, handleRename, socket, addNew, handleDeleteFile, handleDeleteFolder, ai, setAi, virtualboxData, setFiles, deletingFolderId }) {
  if (!files) return
  if (files) {
    console.log(files)
    const flattenedArray = files.flat();
    const [creatingNew, setCreatingNew] = useState(null);
    const ref = useRef(null)
    const [movingId, setMovingId] = useState("")
    console.log(virtualboxData)
    useEffect(() => {
      const el = ref.current

      if (el) {
        return dropTargetForElements({
          element: el,
          getData: () => ({ id: `projects/${virtualboxData.id}` }),
          canDrop: ({ source }) => {
            const file = files.find((child) => child.id === source.data.id);
            return !file
          }
        })
      }
    }, [files])
    useEffect(() => {
      return monitorForElements({
        onDrop({ source, location }) {
          const destination = location.current.dropTargets[0]
          if (!destination) {
            return
          }
          const fileId = source.data.id
          const folderId = destination.data.id

          const fileFolder = fileId.split("/").slice(0, -1).join("/")
          if (fileFolder === folderId) {
            return;
          }
          setMovingId(fileId)
          socket?.emit("moveFile", fileId, folderId, (res) => {
            setFiles(res)
            setMovingId("")
          })
        }
      })
    }, [])
    console.log(flattenedArray)
    return (
      <>
        <div className='h-full w-56 flex flex-col item-start p-2'>
          <div className='flex w-full items-center justify-between h-8 mb-1'>
            <div className='text-muted-foreground'>Explorer</div>
            <div className='flex space-x-1'>
              <button
                disabled={!!creatingNew}
                onClick={() => setCreatingNew("file")}
                className="disabled:opacity-50 disabled:hover:bg-background h-6 w-6 text-muted-foreground ml-0.5 flex items-center translate-x-1 transition-colors hover:bg-muted-foreground/25 cursor-pointer rounded-sm">
                <FilePlus className="h-4 w-4" />
              </button>
              <button
                disabled={!!creatingNew}
                onClick={() => setCreatingNew("folder")}
                className="disabled:opacity-50 disabled:hover:bg-background h-6 w-6 text-muted-foreground ml-0.5 flex items-center translate-x-1 transition-colors hover:bg-muted-foreground/25 cursor-pointer rounded-sm">
                <FolderPlus className="h-4 w-4" />
              </button>
              <div className="h-6 w-6 text-muted-foreground ml-0.5 flex items-center translate-x-1 transition-colors hover:bg-muted-foreground/25 cursor-pointer rounded-sm">
                <Search className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div ref={ref} className=" w-full mt-1 flex flex-col rounded-sm ">
            {flattenedArray && flattenedArray.length === 0 ? (
            
              <div className="flex justify-center w-full">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              flattenedArray && flattenedArray.map((child) =>
                
                child.type === "file" ? (
                  
                  <SidebarFile
                    key={`file-${child.id}`}
                    data={child}
                    selectFile={selectFile}
                    handleRename={handleRename}
                    handleDeleteFile={handleDeleteFile}
                    handleDeleteFolder={handleDeleteFolder}
                    movingId={movingId}
                    deletingFolderId={deletingFolderId}
                  />
                ) : (
                  <SidebarFolder key={`folder-${child.id}`} data={child} selectFile={selectFile} handleRename={handleRename} handleDeleteFile={handleDeleteFile} handleDeleteFolder={handleDeleteFolder} movingId={movingId}
                    deletingFolderId={deletingFolderId} />
                )
              )
            )}
            {creatingNew !== null ? (<New type={creatingNew} stopEditing={() => setCreatingNew(null)} socket={socket} addNew={addNew} />) : null}
          </div>
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Sparkles className={`h-4 w-4 mr-2 ${ai ? "text-indigo-500" : "text-muted-foreground"}`} />
                Copilot
                <span className="font-mono text-muted-foreground inline-block ml-0.5 text-xs leading-none border border-b-2 border-muted-foreground py-1 px-1.5 rounded-md">
                  Ctrl+G
                  </span>
              </div>
              <Switch checked={ai} onCheckedChange={setAi}/>
            </div>
            <Button className="w-full">
            <MonitorPlay className="w-4 h-4 mr-2"/>run
            </Button>
          </div>
        </div>

      </>
    );
  }
}
export default Sidebar;
