import React, { useState,useEffect} from 'react';
import Navbar from './ComponentsO/navbar';
import Dashboard from './dashboard/Dashboard';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HashLoader } from 'react-spinners';

function DashBoardPage() {
  const [virtualBox, setVirtualBox] = useState([]);
  const [userData, setUserData] = useState(null); 
  const [shared,setShared]=useState([])
  const navigate=useNavigate();
  const { isLoaded,user}=useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      
      navigate('/');
      return;
    }
  console.log(user.id)
    const fetchVirtualData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/user/virtualbox/${user.id}`);
        console.log(response.data.virtualBoxes)
        setVirtualBox(response.data.virtualBoxes);
        return response.data; 
      } catch (error) {
        console.error('Error fetching virtual box data:', error);
        return [];
      }
    };
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`https://cloudcollabortivecodeeditor-backend.onrender.com/api/user/${user.id}`);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
     const shareRes=async()=>{
      try{
        const response=await axios.get(`https://cloudcollabortivecodeeditor-backend.onrender.com/api/virtualbox/share?id=${user.id}`);
        console.log(response.data);
        setShared(response.data)
       
      }catch(err)
      {
        console.log(err)
      }
      
     }
    fetchUserData(); 
    fetchVirtualData();
    shareRes();
  }, [isLoaded, user, navigate]);

  if (!isLoaded || !user) {
    return <div className="flex items-center justify-center h-screen">
    <HashLoader  color="red"></HashLoader></div>;
  }
 
 if(userData && shared)
 {
  console.log(shared)
  console.log(userData)
  console.log(virtualBox)
  return (
    <>
      <Navbar userData={userData} />
      <Dashboard virtualBoxData={virtualBox} shared={shared} />
    </>
  );
}
}

export default DashBoardPage;



// import React, { useState,useEffect} from 'react';
// import Navbar from './ComponentsO/navbar';
// import Dashboard from './dashboard/Dashboard';
// import { useUser } from '@clerk/clerk-react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { HashLoader } from 'react-spinners';

// function DashBoardPage() {
//   const [virtualBox, setVirtualBox] = useState([]);
//   const [userData, setUserData] = useState(null); 
//   const [shared,setShared]=useState([])
//   const navigate=useNavigate();
//   const { isLoaded,user}=useUser();

//   useEffect(() => {
//     if (!isLoaded) return;
//     if (!user) {
//       navigate('/');
//       return;
//     }
//   console.log(user.id)
//     const fetchVirtualData = async () => {
//       try {
//         const response = await axios.get(`https://cloudcollabortivecodeeditor-backend.onrender.com/api/user/virtualbox/${user.id}`);
//         console.log(response.data.virtualBoxes)
//         setVirtualBox(response.data.virtualBoxes);
//         return response.data; 
//       } catch (error) {
//         console.error('Error fetching virtual box data:', error);
//         return [];
//       }
//     };
//     const fetchUserData = async () => {
//       try {
//         const response = await axios.get(`https://cloudcollabortivecodeeditor-backend.onrender.com/api/user/${user.id}`);
//         setUserData(response.data);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       }
//     };
//      const shareRes=async()=>{
//       try{
//         const response=await axios.get(`https://cloudcollabortivecodeeditor-backend.onrender.com/api/virtualbox/share?id=${user.id}`);
//         console.log(response.data);
//         setShared(response.data)
       
//       }catch(err)
//       {
//         console.log(err)
//       }
      
//      }
//     fetchUserData(); 
//     fetchVirtualData();
//     shareRes();
//   }, [isLoaded, user, navigate]);

//   if (!isLoaded || !user) {
//     return <div className="flex items-center justify-center h-screen">
//     <HashLoader  color="red"></HashLoader></div>;
//   }
 
//  if(userData && shared)
//  {
//   console.log(shared)
//   console.log(userData)
//   console.log(virtualBox)
//   return (
//     <>
//       <Navbar userData={userData} />
//       <Dashboard virtualBoxData={virtualBox} shared={shared} />
//     </>
//   );
// }
// }

// export default DashBoardPage;
