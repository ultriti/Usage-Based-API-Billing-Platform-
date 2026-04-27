import React, { createContext, useState } from 'react'

export const UserDataContext = createContext()

const UserContext = ({ children }) => {
    const [authUser, setAuthUser] = useState(false);


    const isAdminVerification = () => {

        try {
            const serialized = localStorage.getItem('userDeatils');
            const adminDetail = serialized ? JSON.parse(serialized) : null;

            if (adminDetail.role == provider) {
                setAuthUser(true);

            } else {
                alert('You must be an admin to access this page');
                setAuthUser(false);
                navigate('/admin/dashboard');
            }



        } catch (error) {
            console.error("Error loading from localStorage", error);
            return null;
        }

    }

    const setUserDeatils = (value) => {
        try {
            localStorage.setItem('userDeatils', JSON.stringify(value));
            console.log(`Saved adminDeatils:`, value);
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    }

    // Load data
    const loadUserDetail = () => {
        try {
            const serialized = localStorage.getItem('userDeatils');
            return serialized ? JSON.parse(serialized) : null;
        } catch (error) {
            console.error("Error loading from localStorage", error);
            return null;
        }
    };

    // Remove data
    const removeUserDetail = () => {
        try {
            localStorage.removeItem('userDeatils');
            console.log(`Removed adminDeatils`);
        } catch (error) {
            console.error("Error removing from localStorage", error);
        }
    };

    return (
        <UserDataContext.Provider value={{ setUserDeatils, loadUserDetail, removeUserDetail }}>
            {children}
        </UserDataContext.Provider>
    )
}

export default UserContext;