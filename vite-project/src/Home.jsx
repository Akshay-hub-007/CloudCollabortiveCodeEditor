import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      console.log("navigate to dashboard")
      navigate('/dashboard'); 
    }
  }, [isLoaded, user, navigate]);

  const [dbUser, setDbUser] = useState(null);
   
  useEffect(() => {
      if (isLoaded && !user) {
          navigate("/");
      }
  }, [isLoaded, user, navigate]);
  useEffect(() => {
      const fetchOrCreateUser = async () => {
          if (isLoaded && user) {
              console.log(user)
              try {
                  const response = await axios.get(`https://cloudcollabortivecodeeditor-2xts.onrender.com/api/user/${user.id}`);
                  if (response.data) {
                      setDbUser(response.data);
                  }
              } catch (err) {
                  if (err.response && err.response.status === 404) {
                      try {
                          const newUser = {
                              id: user.id,
                              name: user.fullName+" "+user.lastName|| "New User",
                              email: user.emailAddresses[0].emailAddress || `${user.id}@example.com` 
                          };
                          const createUserResponse = await axios.post('https://cloudcollabortivecodeeditor-2xts.onrender.com/api/user', newUser);
                          setDbUser(createUserResponse.data);
                      } catch (createErr) {
                          console.error("Error creating user!", createErr);
                      }
                  } else {
                      console.error("Error fetching user!", err);
                  }
              }
          }
      };

      fetchOrCreateUser();
  }, [isLoaded, user]);
  console.log(user)
  return (
    <div className='flex w-screen mb-9 text-white overflow-hidden flex-col items-center bg-background'>
      <div className='w-full max-w-screen-md px-8 flex flex-col items-center'>
        <h1 className='text-2xl font-medium text-center mt-32'>
          A Collaborative Code Editor 
        </h1>
        <div className='text-muted-foreground mt-1 text-center'>
        Welcome to the future of coding! Our platform is designed to bring developers together, enabling 
    seamless real-time collaboration on projects from anywhere in the world. Whether you're 
    building solo or working with a team, our intuitive code editor streamlines your workflow, 
    offering live updates, intelligent code assistance, and a distraction-free interface.
        </div>
        <div className='mt-8 flex space-x-4'>
          <Link to={"/sign-up"}>
            <Button className="bg-white text-black hover:bg-black hover:text-white">
              Get Started
              <ArrowRight className='h-4 w-4 ml-2' />
            </Button>
          </Link>
        </div>
        <div>
          <div className='w-full rounded-lg bg-neutral-800 mt-12 aspect-video'>
            {/* <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
