import { SignUp } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import React, { useEffect, useState } from 'react'
import { HashLoader } from 'react-spinners';

function Sign_up() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <div className='flex items-center justify-center mt-8 h-screen'>
        {loading ? (
          <HashLoader color="red"></HashLoader>
        ) : (
          <SignUp
            appearance={{
              baseTheme: dark,
              elements: {
                footerActionLink: {
                  color: "#fff",
                },
              },
            }}
            signInUrl="/sign-in"
          />
        )}
      </div>
    </>
  )
}

export default Sign_up
