import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import React, { useState, useEffect } from 'react';
import { HashLoader } from 'react-spinners';

function Sign_In() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className='flex items-center justify-center mt-8 h-screen'>
        {loading ? (
   <HashLoader  color="red"></HashLoader>
     
        ) : (
          <SignIn
            appearance={{
              baseTheme: dark,
              elements: {
                footerActionLink: {
                  color: "#fff",
                },
              },
            }}
            signUpUrl="/sign-up"
          />
        )}
      </div>
    </>
  );
}

export default Sign_In;
