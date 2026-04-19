const exporess = require("express");
const userModel = require("../model/user.model");


// user register 
module.exports.userRegister = async (req, res) => {

    const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({ message: "All fields are required" , success : false });
    }

    const userDetail = await userModel.findone({email});

    if(userDetail){
        return res.status(400).json({ message: "User already exists" , success : false });
    }

    



    try {
        
    } catch (error) {
        console.log("error :",error)
        return res.status(500).json({ message: "internal server error" , error: error.message , success :false});
    }

}