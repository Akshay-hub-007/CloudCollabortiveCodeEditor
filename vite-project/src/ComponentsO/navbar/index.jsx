import React from 'react'
import { Button } from '../../components/ui/button'
import { ChevronLeft, Clock, Pencil } from 'lucide-react'
import logo from "../../assets/logo.svg";
import { useClerk, UserButton } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { Link,useNavigate } from 'react-router-dom';
import DashBoardSearch from './DashBoardSearch';
import Layout from './Layout';
import Userbutton from '../../components/ui/Userbutton';
function Navbar({userData}) {
    console.log(userData)
 
    return (
        <>
         {/* <Layout></Layout> */}
            <div className="h-14 px-2 w-full border-b-[0.2px] border-bordr flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <Link to={"/"}>
                   <button className="ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none rounded-sm">
                    <img src={logo} alt="Logo" className="h-10" />
                    </button>
                   </Link> 
                   <div className='text-sm font-medium flex items-center'>Virtual-box</div>

                </div>
                <div className='flex items-center justify-center space-x-2'>
                    <DashBoardSearch/>
                <Userbutton userData={userData}/>   
                {/* <UserButton></UserButton> */}
                </div>
               
            </div>
        </>
    )
}

export default Navbar