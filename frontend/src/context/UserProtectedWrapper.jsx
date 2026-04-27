import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProtectedWrapper = ({ children }) => {
    const [userRole, setUserRole] = useState(false);
    const navigate = useNavigate();

    const serialized = localStorage.getItem('userDeatils');
    const userDetail = serialized ? JSON.parse(serialized) : null;

    useEffect(() => {

        if (
            // token && 
            userDetail?.role === 'user'
        ) {
            
            // alert(adminDetail.role)
            setUserRole(true);
        } else {
            setUserRole(false);
            alert('You must be an admin to access this page');
            navigate('/user/Login');
        }
    }, [serialized]);



    return userRole ? <>{children}</> : null;
};

export default UserProtectedWrapper;