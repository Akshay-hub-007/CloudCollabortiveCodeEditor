import axios from "axios";
import { useNavigate } from "react-router-dom";
export async function createVirtualBox(body) {
     console.log(body); // Log the correct variable
     try {
          console.log(body); // Log the correct variable
          const response = await axios.put("http://localhost:3000/api/virtualbox", body);
          console.log(response)
          return response; 
        } catch (error) {
          console.error("Error in creating virtual box:", error);
          throw error; 
        }
   }
   
   export async function deleteVirtualBox(id) {
    try {
      console.log(id)
         const response = await axios.delete(`http://localhost:3000/api/virtualbox/${id}`);
         console.log(response)
        //  return response; 
        // window.location.reload()
        
             } catch (error) {
         console.error("Error in creating virtual box:", error);
         throw error; 
       }
  }

  export async function updateVirtualBox(id, name,visibility) {
    try {
      console.log(id,name,visibility)
      const response = await axios.post("http://localhost:3000/api/virtualbox", { id,name, visibility });
      console.log(response.data); 
      return response.data; 
    } catch (error) {
      console.error("Error in updating virtual box:", error);
      throw error;  
    }
  }
  
  
  export async function shareVirtualbox(virtualboxId,email) {
    console.log(virtualboxId,email)
    try {
      const response = await axios.post("http://localhost:3000/api/virtualbox/share", { virtualboxId, email });
      console.log(response.data);  
      return response;  
    } catch (error) {
      console.error("Error in updating virtual box:", error);
      throw error; 
     }
     
  }
  
  export async function unshareVirtualbox(virtualboxId,userId) {
   console.log(virtualboxId,userId)
    try {
      const response = await axios.delete("http://localhost:3000/api/virtualbox/share", { userId,virtualboxId});
      console.log(response.data);  
      return response;  
    } catch (error) {
      console.error("Error in deleteing virtual box:", error);
      throw error; 
    }
     
  }
  
