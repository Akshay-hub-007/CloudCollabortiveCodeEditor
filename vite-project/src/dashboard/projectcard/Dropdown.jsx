
import { Ellipsis, Globe, Lock, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import React from 'react'

function Dropdown({virtualBox,onVisibilityChange,onDelete}) {
  return (
   <>
     <DropdownMenu>
        <DropdownMenuTrigger 
        className="h-6 w-6 flex items-center justify-center transition-colors bg-transparent hover:bg-muted-foreground/25 rounded-sm">
           <Ellipsis className='w-4 h-4'></Ellipsis> 
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
            <DropdownMenuItem
            onClick={(e)=>{
              e.stopPropagation();
              onVisibilityChange(virtualBox)
            }}>
              {virtualBox.visibility==="public"?
              <>
               <Lock className="mr-2 h-4 w-4"></Lock>
               <span>Make private</span></>:
               <>
                <Globe className="mr-2 h-4 w-4"/>
                <span>Make public</span></>}
               
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
            e.stopPropagation();
            onDelete(virtualBox);
          }}>
                <Trash2 className="mr-2 h-4 w-4"/>
                <span>Delete Project</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
     </DropdownMenu>
   </>
  )
}

export default Dropdown