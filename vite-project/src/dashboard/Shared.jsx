import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { ChevronRight } from 'lucide-react';
import Avatar from '../components/ui/avatar';
import { Link } from 'react-router-dom';

function Shared({ virtualBox ,shared}) {
  console.log(shared)
  console.log(virtualBox)
  return (
    <>
      <div className='grow p-4 flex flex-col'>
        <div className='text-xl font-medium mb-8'>Shared with Me</div>
        {shared.length>0 ? 
         <>
          <div className="grow w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Virtualbox Name</TableHead>
                <TableHead>Shared By</TableHead>
                <TableHead>Sent On</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shared.map((share,index) => (
                <TableRow key={index}> 
                
                  <TableCell>
                    <div className="font-medium flex items-center">
                      <img
                        src={share.type === 'react' ? '../../public/project-icons/react.svg' : '../../public/project-icons/node.svg'}
                        className="mr-2"
                        alt=""
                      />
                      {share.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center '>
                    <Avatar name={share.author.name}/>
                      {share.author.name} 
                    </div>
                  </TableCell>
                  <TableCell>
                  {share.sharedOn ? new Date(share.sharedOn).toLocaleDateString() : 'N/A'}
                </TableCell>
                  <TableCell className="text-right">
                  <Link to={`/code-editor/${share.id}`}>

                    <Button  variant={"secondary"}>
                      Open <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          </>
            :(
          <div>
            No virtualboxes here.Get a friend  to share  one with you and try live collaboration
          </div>
        )}
  
      </div>
    </>
  );
}

export default Shared;
