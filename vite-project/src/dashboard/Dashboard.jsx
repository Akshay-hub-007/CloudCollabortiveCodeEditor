
  import React, { useState } from 'react'
  import CustomButton from '../components/ui/customButton'
  import { Clock, Code2, FolderDot, Globe, HelpCircle, HelpCircleIcon, Plus, Settings, Users } from 'lucide-react'
  import { Button } from '../components/ui/button'
  import ProjectCard from './projectcard/index'
  import Dropdown from './projectcard/Dropdown'
  import Shared from './Shared'
  import DashboardProject from './DashboardProject'
  import NewProject from './NewProject'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import AboutModal from './About'



  function Dashboard({ virtualBoxData,shared }) {
    console.log(shared)
    const [screen, setScreen] = useState("projects");
    const [newProjectModalOpen,setNewProjectModalOpen]=useState(false);
   const [aboutModalOpen,setAboutModalOpen]=useState(false);
    const activeScreen = (s) => {
      if (screen == s) return "justify-start"
      else return "justify-start font-normal text-muted-foreground"
    }
    console.log(virtualBoxData);
    const [searchParams, setSearchParams] = useSearchParams();
    const q = searchParams.get('q'); // Now this will work as expected
    console.log(q);
  
    return (
      <>
       <AboutModal  open={aboutModalOpen} setOpen={setAboutModalOpen} /> 
      <NewProject 
      open={newProjectModalOpen}
      setOpen={setNewProjectModalOpen}/>
        <div className="flex grow w-full">
          <div className="w-56 shrink-0  border-border p-4  flex flex-col justify-stretch">
            <div className="flex flex-col">
              <CustomButton
                className="mb-4"
                onClick={() => {
                  if (virtualBoxData.length >= 8) {
                    toast.error("You reached the maximum # of virtualboxes");
                    return;
                  }
                  setNewProjectModalOpen(true);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </CustomButton>
              <Button
                // variant={"ghost"}
                onClick={() => setScreen("projects")}
                className={activeScreen("projects")}
              >
                <FolderDot className="w-4 h-4 mr-2" />
                My Projects
              </Button>
              <Button
                // variant={"ghost"}
                onClick={() => setScreen("shared")}
                className={activeScreen("shared")}
              >
                <Users className="w-4 h-4 mr-2" />
                Shared With Me
              </Button>
              <Button
                // variant={"ghost"}
                onClick={() => setScreen("settings")}
                className={activeScreen("settings")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
            <div className="flex flex-col">
              <Button
                // variant={"ghost"}
                className="justify-start font-normal text-muted-foreground"
              >
                <Code2 className="w-4 h-4 mr-2" />
                Github Repo
              </Button>
              <Button
                  onClick={() => setAboutModalOpen(true)}
                // variant={"ghost"}
                className="justify-start font-normal text-muted-foreground"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                About
              </Button>
            </div>

          </div>
          {screen === "projects" ?(
            <div className="grow grid lg:grid-cols-1 2xl:grid-cols-2 space-y-0.5 p-4">
            <DashboardProject virtualbox={virtualBoxData} q={q}/>
            </div>
            ): screen==="shared"?(<Shared virtualBox={virtualBoxData} shared={shared}/>):null}

        </div>
      </>
    )
  }

  export default Dashboard