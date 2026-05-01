import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProtectedWrapper = ({ children }) => {
    const [authAdmin, setAuthAdmin] = useState(false);
    const navigate = useNavigate();

    const serialized = localStorage.getItem('adminDeatils');
    const adminDetail = serialized ? JSON.parse(serialized) : null;

    useEffect(() => {


        console.log("AdminProtectedWrapper -> adminDetail", adminDetail);

        if (
            // token && 
            adminDetail?.role === 'provider'
        ) {
            
            // alert(adminDetail.role)
            setAuthAdmin(true);
        } else {
            setAuthAdmin(false);
            alert('You must be an admin to access this page');
            navigate('/provider/Login');
        }
    }, [serialized]);



    return authAdmin ? <>{children}</> : null;
};

export default AdminProtectedWrapper;