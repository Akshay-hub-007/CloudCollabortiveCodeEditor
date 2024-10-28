import { Clock, Globe, Lock } from "lucide-react";
import ProjectCard from "./projectcard";
import Dropdown from "./projectcard/Dropdown";
import { toast } from "sonner";
import { deleteVirtualBox, updateVirtualBox } from "../lib/actions";

function DashboardProject({ virtualbox, q }) {
  console.log(q);

  const onDelete = async (virtualbox) => {
    toast(`Project ${virtualbox.name} deleted`);
    const res = await deleteVirtualBox(virtualbox.id);
  };

  const onVisibilityChange = async (virtualbox) => {
    const newVisibility =
      virtualbox.visibility === "public" ? "private" : "public";
    toast(`Project ${virtualbox.name} is now ${newVisibility}`);
    const res = await updateVirtualBox({
      id: virtualbox.id,
      visibility: newVisibility,
    });
  };

  return (
    <>
      <div className="grow p-4 flex flex-col">
        <div className="text-xl font-medium mb-8">My Projects</div>
        <div className="grow w-auto grid sm:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 gap-2">
          {virtualbox
            ?.filter((virtual) => {
              if (q && q.length > 0) {
                return virtual.name.toLowerCase().includes(q.toLowerCase());
              }
              return true; 
            })
            .map((virtual) => (
              <ProjectCard className={"text-white"} id={virtual.id} key={virtual.id}>
                <div className="flex space-x-2 items-center justify-start w-full p-2">
                  <img
                    src={
                      virtual.type === "react"
                        ? "/project-icons/react.svg"
                        : "/project-icons/node.svg"
                    }
                    width={20}
                    height={20}
                    alt=""
                  />
                  <div className="font-medium flex items-center whitespace-nowrap w-full text-ellipsis overflow-hidden m-2">
                    {virtual.name}
                  </div>
                  <Dropdown
                    virtualBox={virtual}
                    virtualbox={virtualbox}
                    onVisibilityChange={onVisibilityChange}
                    onDelete={onDelete}
                  />
                </div>

                <div className="flex flex-col text-muted-foreground space-y-0.5 text-sm m-2">
                  <div className="flex items-center">
                    {virtual.visibility === "public" ? (
                      <>
                        <Lock className="mr-2 h-4 w-4"></Lock>
                        <span>Make private</span>
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-4 w-4" />
                        <span>Make public</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-2" /> 3d ago
                  </div>
                </div>
              </ProjectCard>
            ))}
        </div>
      </div>
    </>
  );
}

export default DashboardProject;
