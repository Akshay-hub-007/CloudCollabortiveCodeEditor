import { useClerk } from '@clerk/clerk-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import { LogOut, Pencil } from 'lucide-react'
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
          <DropdownMenuContent align="end">
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
