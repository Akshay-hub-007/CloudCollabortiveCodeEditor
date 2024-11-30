import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import React, { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

function Disables({ open, setOpen, message }) {
    const navigate=useNavigate()
    useEffect(()=>{
        if(open){
            const timer=setTimeout(()=>{
                navigate("/dashboard")
               ,1000000000})
            return ()=> clearTimeout(timer)               
        }
         },[])
    return (
        <>
            <Dialog>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Live Collaboration Disabled</DialogTitle>
                    </DialogHeader>
                    <div className='text-sm text-muted-foreground'>
                        <div>{message}</div>
                        <div className='flex items-center'>
                            <Loader2 className='w-4 h-4 animate-spin mr-2'/>
                            Redirectiong you to dashboard....
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Disables