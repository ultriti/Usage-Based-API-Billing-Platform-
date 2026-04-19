const exporess = require("express");
const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");


// user register -------------------
module.exports.userRegister = async (req, res) => {

    console.log("req.body :", req.body)

    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }



    try {

        const userDetail = await userModel.findOne({ email });

        if (userDetail) {
            return res.status(400).json({ message: "User already exists", success: false });
        }

        const createdUser = await userModel.create({
            username,
            email,
            password,
            role: "consumer"
        });


        // Generate token 
        const token = jwt.sign({ userId: createdUser._id, email: createdUser.email }, process.env.SECRET_KEY);
        res.cookie('apiProviderToken', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            expires: new Date(Date.now() + 3600000 * 24 * 30)
        });

        return res.status(201).json({ message: "User registered successfully", success: true, user: createdUser });

    } catch (error) {
        console.log("error :", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });
    }

}


// /user login -------------------
module.exports.userLogin = async (req, res) => {

    const { email, password } = req.body;

    try {

        const user = await userModel.findOne({ email })
        console.log("user :", user)

        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }

        console.log("user :", user.password, password)

        if (user.password != password) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const token = jwt.sign({ email: email, userId: user._id }, process.env.SECRET_KEY);

        res.cookie("apiProviderToken", token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            expires: new Date(Date.now() + 3600000 * 24 * 30)
        });

        return res.status(200).json({ message: "User logged in successfully", success: true, user });

    } catch (error) {
        console.log("error :", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });
    }

}


// get user detail
module.exports.getUserDetail = async (req, res) => {
    const id = req.id;


    try {

        const userDetail = await userModel.findById(id);

        console.log("userDetail :", userDetail)


        if (!userDetail) {
            return res.status(404).json({ messgae: "user not found! ", success: false });
        }
        return res.status(201).json({ message: "user found", success: true, userDetail: userDetail })


    } catch (error) {
        console.log("error :", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });
    }

}


// logout route
module.exports.userLogout = async (req, res) => {

    try {
        res.clearCookie('apiProviderToken');
        res.status(200).json({ msg: 'Logged out successfully' });

    } catch (error) {
        res.status(400).json({ msg: 'user cant logout ' })
    }

} 


// udate user detail
module.exports.updateUserDetail = async (req, res) => {
    
}