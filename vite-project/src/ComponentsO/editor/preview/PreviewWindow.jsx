import { ChevronLeft, ChevronRight, RefreshCw, RotateCw, TerminalSquare, UnfoldVertical } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

function PreviewWindow({ collapsed, open }) {
    const ref = useRef(null)
    const [iframeKey, setIframekey] = useState(0);
    return (
        <>
            <div className={`${collapsed ? "h-full" : "h-10"} select-none w-full  flex gap-2`}>
                <div className='flex items-center w-full justify-between h-8 rounded-md px-3 '>
                    <div className='text-sm'>
                        Preview{" "} <span className='inline-block ml-2 items-center font-mono text-muted-foreground'>
                            localhost:300</span></div>
                    <div className='flex space-x-1 translate-x-1'>

                        {collapsed ? (
                            <PreviewButton onClick={open}>
                                <UnfoldVertical className='w-4 h-4 ' />
                            </PreviewButton>
                        ) : (
                            <>
                                {/* <PreviewButton onClick={() => { console.log("Terminal") }}>
                                    <TerminalSquare className='h-4 w-4' />
                                </PreviewButton> */}
                                <PreviewButton onClick={() => {
                                    navigator.clipboard.writeText(`http://localhost:5173`)
                                    toast.info("Copiled to clipboard")

                                    console.log("Terminal")
                                }}>
                                    <Link className='h-4 w-4' />
                                </PreviewButton>

                                <PreviewButton onClick={() => {
                                    setIframekey((prev => prev + 1))
                                }}>
                                    <RefreshCw className='h-4 w-4' />
                                </PreviewButton>
                            </>
                        )}

                    </div>


                </div>
            </div>
            {
                collapsed ? null : (
                    <div className='w-full grow rounded-md bg-foreground'>
                        <iframe
                            src={`http://localhost:5174`}
                            key={iframeKey}
                            ref={ref}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                        ></iframe>
                    </div>
                )
            }

        </>
    )
}
function PreviewButton({ children, onClick }) {  
    return (
        <div className="p-0.5 h-5 w-5 ml-0.5 flex items-center justify-center transition-colors bg-transparent hover:bg-muted-foreground/25 cursor-pointer rounded-sm" onClick={onClick}>
            {children}
        </div>
    )
}
export default PreviewWindow

