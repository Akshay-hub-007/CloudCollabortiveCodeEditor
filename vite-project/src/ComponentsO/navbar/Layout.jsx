import { useUser } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashBoardPage from '../../DashBoardPage.jsx';

function Layout() {
    const navigate = useNavigate();
    const { isLoaded, user } = useUser();
    const [dbUser, setDbUser] = useState(null);

    useEffect(() => {
        if (isLoaded && !user) {
            navigate("/");
        }

        const fetchOrCreateUser = async () => {
            if (isLoaded && user) {
                try {
                    const response = await axios.get(`http://localhost:3000/api/user/${user.id}`);
                    if (response.data) {
                        setDbUser(response.data);
                    }
                } catch (err) {
                    if (err.response && err.response.status === 404) {
                       
                        try {
                            const newUser = {
                                id: user.id,
                                name: user.fullName || "New User", 
                                email: user.emailAddresses?.[0]?.emailAddress || `${user.id}@example.com` // Safe email check
                            };
                            const createUserResponse = await axios.post('http://localhost:3000/api/user', newUser);
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
    }, [isLoaded, user, navigate]);

    return <DashBoardPage />;
}

export default Layout;
