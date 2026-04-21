const exporess = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userModel = require("../model/user.model");
const providerModel = require("../model/provider.model");




// code generation for verification --------------> 
const codegenerate = async (req, res) => {
    const crypto = require('crypto');

    function generateVerificationCode() {
        return crypto.randomInt(100000, 999999).toString();
    }

    const code = generateVerificationCode();
    console.log("Verification code:", code);

    const providerDetail = await providerModel.findById(req.id);

    providerDetail.verificationCode.email = code;
    await providerDetail.save();

    return code;

}

// demo code for code gen
module.exports.codeGen = async (req, res) => {

    const code = await codegenerate(req, res);
    return res.status(201).json({ message: "code gen", code })

}



// provider registeration 
module.exports.providerRegister = async (req, res) => {

    console.log("req.body->", req.body)
    const { email, password, role, username } = req.body;



    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    try {

        const providerDeatil = await providerModel.findOne({ email });

        if (providerDeatil) {
            return res.status(400).json({ message: "provider already exists", success: false });
        }

        const hashedPassword = await providerModel.prototype.hashPassword(password);
        const userDetail = await userModel.findOne({ email });

        if (userDetail?.email === email) {

            if (!userDetail.isVerified.email) {
                return res.status(400).json({ message: "email not verified !", sucess: false })
            }

            const createdProvider = await providerModel.create({
                username: userDetail.username,
                email: userDetail.email,
                password: hashedPassword,
                role: "provider"
            })

            createdProvider.isVerified.email = true;
            await createdProvider.save()

            // Generate token 
            const token = jwt.sign({ userId: createdProvider._id, email: createdProvider.email, role: createdProvider.role }, process.env.SECRET_KEY);
            res.cookie('apiProviderToken', token, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                expires: new Date(Date.now() + 3600000 * 24 * 30)
            });


            return res.status(201).json({ message: "provider registered successfully", success: true, user: createdProvider });

        } else {

            const createdProvider = await providerModel.create({
                username,
                email,
                password: hashedPassword,
                role: "provider"
            })


            createdProvider.isVerified.email = true;
            await createdProvider.save()

            // Generate token 
            const token = jwt.sign({ userId: createdProvider._id, email: createdProvider.email, role: createdProvider.role }, process.env.SECRET_KEY);
            res.cookie('apiProviderToken', token, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
                expires: new Date(Date.now() + 3600000 * 24 * 30)
            });


            return res.status(201).json({ message: "provider registered successfully", success: true, user: createdProvider });

        }

    } catch (error) {
        console.log("error :", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });
    }

}


// provider  login
module.exports.providerLogin = async (req, res) => {

    const { email, password } = req.body;

    try {

        const providerDetail = await providerModel.findOne({ email }).select("+password");;

        if (!providerDetail) {
            return res.status(400).json({ message: "provider not found", success: false });
        }

        const isMatch = await providerDetail.comparePassword(password, providerDetail.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials", success: false });
        }

        const token = jwt.sign({ email: email, userId: providerDetail._id, role: providerDetail.role }, process.env.SECRET_KEY);

        // res.cookie("apiProviderToken", token, {
        //     httpOnly: true,
        //     sameSite: 'lax',
        //     secure: false,
        //     expires: new Date(Date.now() + 3600000 * 24 * 30)
        // });

        res.cookie("apiProviderToken", token, {
            httpOnly: true,
            sameSite: "lax",   // or "strict"
            secure: false,     // only true in production HTTPS
            expires: new Date(Date.now() + 3600000 * 24 * 30)
        });

        return res.status(200).json({ message: "provider logged in successfully", success: true, providerDetail });

    } catch (error) {

        console.log("error :", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });
    }

}


// get provider detail
module.exports.getProviderDetail = async (req, res) => {
    const id = req.id;


    try {

        const providerDetail = await providerModel.findById(id);

        console.log("providerDetail :", providerDetail)


        if (!providerDetail) {
            return res.status(404).json({ messgae: "provider not found! ", success: false });
        }
        return res.status(201).json({ message: "provider found", success: true, providerDetail: providerDetail })


    } catch (error) {
        console.log("error :", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });
    }

}


// logout provider
module.exports.providerLogout = async (req, res) => {

    try {
        res.clearCookie('apiProviderToken');
        res.status(200).json({ msg: 'Logged out successfully' });

    } catch (error) {
        res.status(400).json({ msg: 'user cant logout ' })
    }

}


// update provider detail
module.exports.updateProviderDetail = async (req, res) => {

    const { username, profileUrl, ProfileImgId } = req.body;

    const id = req.id;

    try {

        const providerDetail = await providerModel.findById(id);

        if (!providerDetail) {
            return res.status(404).json({ messgae: "provider not found! ", success: false });
        }

        if (username) {
            providerDetail.username = username;
        }
        if (profileUrl) {
            providerDetail.profilePicture.url = profileUrl;
        }
        if (ProfileImgId) {
            providerDetail.profilePicture.imageId = ProfileImgId;
        }

        await providerDetail.save();

        res.status(200).json({ message: "provider detail updated successfully", success: true, providerDetail })

    } catch (error) {
        console.log("error", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });
    }
}


// delete user
module.exports.deleteProvider = async (req, res) => {
    const id = req.id;
    const { password, emailCode } = req.body;

    if (!password && !emailCode) {
        return res.status(201).json({ message: "fill all the credentails", success: false })
    }

    try {
        const providerDetail = await providerModel.findById(id);

        if (password) {

            if (providerDetail.password != password) {
                return res.status(201).json({ message: "invalid credentails", success: false })
            }

        }

        else if (emailCode) {

            if (providerDetail.verificationCode.email !== emailCode) {
                return res.status(201).json({ message: "invalid credentails", success: false })
            }

            providerDetail.verificationCode.email = null;
        }

        await providerDetail.save()

        await providerModel.findByIdAndDelete(id);


        return res.status(201).json({ message: "provider deleted sucessfully !", success: true })


    } catch (error) {
        console.log("error", error)
        return res.status(500).json({ message: "internal server error", error: error.message, success: false });

    }

}


