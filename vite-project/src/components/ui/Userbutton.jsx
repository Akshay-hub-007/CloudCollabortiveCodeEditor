import { useClerk } from '@clerk/clerk-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu'
import { LogOut, Pencil, Sparkles } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function Userbutton({ userData }) {
  const {signOut}=useClerk()
  const navigate=useNavigate()
  return (
    <>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className='w-9 h-9 rounded-full overflow-hidden font-mono bg-gradient-to-t from bg-neutral-600 flex justify-center items-center text-sm font-medium'>
              {userData.name.split(" ").slice(0, 2).map((name) => name[0].toUpperCase()).join('')}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <div className='py-1.5 px-2 w-full'>
              <div className='font-medium'>
                {userData.name}
              </div>
              <div className='text-sm w-full overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground'>
                {userData.email}
              </div>    
             </div>
             <DropdownMenuSeparator/>
             <div className='py-1.5 px-2 flex flex-col items-start text-sm w-full'>
              <div className='flex items-center'>
                <Sparkles className='h-4 w-4 mr-2 text-indigo-500'/>
                AI Usage: {userData.generations}/30
              </div>
             </div>
             <div className='rounded-ful w-full mt-2 overflow-hidden bg-secondary'>
              <div className='h-full bg-indigo-500 rounded-full' style={{
                width:`${(userData.generation*100)/30}%`
              }}></div> 
             </div>
            <DropdownMenuItem className="cursor-pointer">
              <Pencil className='mr-2 h-4 w-4' />
              <span>Edit Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="!text-destructive cursor-pointer"
            onClick={()=>signOut(()=>navigate("/"))}>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}

export default Userbutton
