import React, { useState } from 'react'
// import { Button } from '../../components/ui/button'
import { ChevronLeft, Clock, Pencil, Users } from 'lucide-react'
import logo from "../../../assets/logo.svg";
import { UserButton } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { Link } from 'react-router-dom';
import DashBoardSearch from '../../navbar/DashBoardSearch';
// import Layout from './Layout';
import Userbutton from '../../../components/ui/Userbutton';
import EditVirtualboxModal from './Edit';
import { Button } from '../../../components/ui/button';
import ShareVirtualboxModal from "./Share"
import { Avatars } from '../live/avatars';
function Navbar({userData,virtualboxData,Shared}) {
    console.log(userData)
    console.log(virtualboxData)
    console.log(Shared)
    const [isEditOpen,setIsEditOpen]=useState(false);
    const [isSharedOpen,setIsSharedOpen]=useState(false);
    const isOwner= virtualboxData.userId===userData.id
    console.log(isOwner)
    return (
        <>
        <EditVirtualboxModal open={isEditOpen} 
                setOpen={setIsEditOpen}
             data={virtualboxData}></EditVirtualboxModal>
             
<ShareVirtualboxModal open={isSharedOpen} setOpen={setIsSharedOpen} data={virtualboxData} Shared={Shared}></ShareVirtualboxModal>
       
         {/* <Layout></Layout> */}
            <div className="h-14 px-2 w-full border-b-[0.2px] border-bordr flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <Link to={"/"}>
                   <button className="ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none rounded-sm">
                    <img src={logo} alt="Logo" className="h-10" />
                    </button>
                   </Link> 
                   <div className='text-md font-medium flex items-center'
                   >{virtualboxData.name}
                   {isOwner?(
                        <button onClick={()=>setIsEditOpen(true)} className="h-7 w-7 ml-2 flex items-center justify-center">
                        <Pencil className='w-4 h-4'/>
                        </button>
                   ):null}</div>
             
                </div>
                
                <div className='flex items-center space-x-4'>
                {isOwner?(
                <>
                 <Avatars/>
                    <Button variant={"outline"} onClick={()=>setIsSharedOpen(true)}>
                    <Users className='w-4 h-4 mr-2'></Users>
                    Share
                </Button>
                </>
                ):null}
                    <Userbutton userData={userData}></Userbutton>
                </div>
               
            </div>
        </>
    )
}

export default Navbar