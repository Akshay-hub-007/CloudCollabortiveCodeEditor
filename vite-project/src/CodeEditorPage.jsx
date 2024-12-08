import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom"; 
import axios from "axios";
import CodeEditor from "./ComponentsO/editor/index";
import Navbar from "./ComponentsO/editor/navbar/Navbar";
import { useUser } from '@clerk/clerk-react';
import { HashLoader } from 'react-spinners';
import Room from './ComponentsO/editor/live/Room';

export default function CodeEditorPage() {
  const { isLoaded, user } = useUser();
  const { id } = useParams(); 
  const [userData, setUserData] = useState(null);
  const [virtualboxData, setVirtualboxData] = useState(null);
  const [sharedData, setSharedData] = useState([]);
  const [sendData, setSendData] = useState([]);
  const navigate=useNavigate();
 console.log(user)
  const virtualboxId = id;
console.log(virtualboxId)

  useEffect(() => {
    if(!user)
      {
         navigate("/dashboard")
      }
    if (isLoaded && user && virtualboxId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`https://cloudcollabortivecodeeditor-2xts.onrender.com/api/user/${user.id}`);
          console.log("User data:", response.data); // Debugging log
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
       
      const fetchVirtualboxData = async () => {
        try {
          const response = await axios.get(`https://cloudcollabortivecodeeditor-2xts.onrender.com/api/virtualbox/${virtualboxId}`);
          setVirtualboxData(response.data.virtualboxData);
          console.log("Virtualbox data:", response.data); // Debugging log

          setSharedData(response.data.usersToVirtualboxes);
          console.log(sharedData)
          console.log("Shared data after fetch:", response.data.usersToVirtualboxes); // Debugging log
        } catch (err) {
          console.error("Error fetching virtualbox data", err);
        }
      };

      fetchUserData();
      fetchVirtualboxData();
    }
  }, [isLoaded, user, virtualboxId]);

  // Fetch shared users data when sharedData is available
  useEffect(() => {
    const getSharedUsers = async () => {
     
      // if (sharedData.length > 0) {
        try {
          console.log("Fetching shared users with data:", sharedData); // Debugging log
          const shared = await Promise.all(
            
            sharedData.map(async (user) => {
              console.log(user)
              const userRes = await axios.get(`https://cloudcollabortivecodeeditor-2xts.onrender.com/api/user/${user.userId}`);
              console.log(userRes);
              return { id: userRes.data.id, name: userRes.data.name };
            })
          );
          console.log("Shared users fetched:", shared); // Debugging log
          setSendData(shared);
        
        } catch (error) {
          console.error('Error fetching shared users:', error);
        }
      // }
    };

    getSharedUsers();
  }, [sharedData]);
  const isOwner=virtualboxData?.userId==user?.id
  const isSharedUser=sharedData.some((u)=>u.id==user?.id)
  if (!isLoaded || !userData || !virtualboxData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader />
      </div>
    );
  }

  console.log("Sending to Navbar shared prop:", sendData); 
  console.log(userData);
  console.log(virtualboxData)
  console.log(isSharedUser)
  return (
   <>
 

    <Room id={virtualboxId} initialPresence={{}}>
    <div className="flex w-screen flex-col h-screen bg-background">
      <div className="h-12 flex m-2">
        <Navbar userData={userData} virtualboxData={virtualboxData} Shared={sendData} />
      </div>
      <div className="w-screen flex grow">
        <CodeEditor 
        userData={userData}
        virtualboxData={virtualboxData} 
        isSharedUser={true}
        />
      </div>
    </div>
    </Room>
   </>
  );
}
