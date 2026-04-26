import React, { createContext, useState } from 'react'

export const AdminDataContext = createContext()

const AdminContext = ({ children }) => {
    const [authAdmin, setAuthAdmin] = useState(false);


    const isAdminVerification = () => {

        try {
            const serialized = localStorage.getItem('adminDeatils');
            const adminDetail = serialized ? JSON.parse(serialized) : null;

            if (adminDetail.role == provider) {
                setAuthAdmin(true);

            } else {
                alert('You must be an admin to access this page');
                setAuthAdmin(false);
                navigate('/admin/dashboard');
            }



        } catch (error) {
            console.error("Error loading from localStorage", error);
            return null;
        }

    }

    const setAdminDeatils = (value) => {
        try {
            localStorage.setItem('adminDeatils', JSON.stringify(value));
            console.log(`Saved adminDeatils:`, value);
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    }

    // Load data
    const loadAdminDetail = () => {
        try {
            const serialized = localStorage.getItem('adminDeatils');
            return serialized ? JSON.parse(serialized) : null;
        } catch (error) {
            console.error("Error loading from localStorage", error);
            return null;
        }
    };

    // Remove data
    const removeAdminDetail = () => {
        try {
            localStorage.removeItem('adminDeatils');
            console.log(`Removed adminDeatils`);
        } catch (error) {
            console.error("Error removing from localStorage", error);
        }
    };

    return (
        <AdminDataContext.Provider value={{ setAdminDeatils, loadAdminDetail, removeAdminDetail }}>
            {children}
        </AdminDataContext.Provider>
    )
}

export default AdminContext;