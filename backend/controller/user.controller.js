const exporess = require("express");
const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const apiModel = require("../model/api.model");

// funtions

// code generation for verification -------------->
const codegenerate = async (req, res) => {
  const crypto = require("crypto");

  function generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  const code = generateVerificationCode();
  console.log("Verification code:", code);

  const userDetail = await userModel.findById(req.id);

  userDetail.verificationCode.email = code;
  await userDetail.save();

  return code;
};

// demo code for code gen
module.exports.codeGen = async (req, res) => {
  const code = await codegenerate(req, res);
  return res.status(201).json({ message: "code gen", code });
};

// user register -------------------
module.exports.userRegister = async (req, res) => {
  console.log("req.body :", req.body);

  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  try {
    const userDetail = await userModel.findOne({ email });

    if (userDetail) {
      return res
        .status(400)
        .json({ message: "User already exists", success: false });
    }

    const hashedPassword = await userModel.prototype.hashPassword(password);

    const createdUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    const userResponse = createdUser.toObject();
    delete userResponse.password;

    // Generate token
    const token = jwt.sign(
      { userId: createdUser._id, email: createdUser.email },
      process.env.SECRET_KEY,
    );
    res.cookie("apiProviderToken", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + 3600000 * 24 * 30),
    });

    return res
      .status(201)
      .json({
        message: "User registered successfully",
        success: true,
        user: userResponse,
      });
  } catch (error) {
    console.log("error :", error);
    return res
      .status(500)
      .json({
        message: "internal server error",
        error: error.message,
        success: false,
      });
  }
};

// /user login -------------------
module.exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  console.log("--------->login:", req.body);

  try {
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      console.log("user :", user);
      return res
        .status(400)
        .json({ message: "User not found!", success: false });
    }

    const isMatch = await user.comparePassword(password, user.password);

    console.log("user :", user.password, password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    const token = jwt.sign(
      { email: email, userId: user._id },
      process.env.SECRET_KEY,
    );

    res.cookie("apiProviderToken", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + 3600000 * 24 * 30),
    });

    return res
      .status(200)
      .json({
        message: "User logged in successfully",
        success: true,
        user: user,
      });
  } catch (error) {
    console.log("error :", error);
    return res
      .status(500)
      .json({
        message: "internal server error",
        error: error.message,
        success: false,
      });
  }
};

// get user detail
module.exports.getUserDetail = async (req, res) => {
  const id = req.id;

  try {
    const userDetail = await userModel.findById(id);

    console.log("userDetail :", userDetail);

    if (!userDetail) {
      return res
        .status(404)
        .json({ messgae: "user not found! ", success: false });
    }
    return res
      .status(201)
      .json({ message: "user found", success: true, userDetail: userDetail });
  } catch (error) {
    console.log("error :", error);
    return res
      .status(500)
      .json({
        message: "internal server error",
        error: error.message,
        success: false,
      });
  }
};

// logout route
module.exports.userLogout = async (req, res) => {
  try {
    res.clearCookie("apiProviderToken");
    res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ msg: "user cant logout " });
  }
};

// udate user detail
module.exports.updateUserDetail = async (req, res) => {
  const { username, profileUrl, ProfileImgId } = req.body;

  const id = req.id;

  try {
    const userDetail = await userModel.findById(id);

    if (!userDetail) {
      return res
        .status(404)
        .json({ messgae: "user not found! ", success: false });
    }

    if (username) {
      userDetail.username = username;
    }
    if (profileUrl) {
      userDetail.profilePicture.url = profileUrl;
    }
    if (ProfileImgId) {
      userDetail.profilePicture.imageId = ProfileImgId;
    }

    await userDetail.save();

    res
      .status(200)
      .json({
        message: "user detail updated successfully",
        success: true,
        userDetail,
      });
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({
        message: "internal server error",
        error: error.message,
        success: false,
      });
  }
};

// upgarde the user to provider/seller
module.exports.promoteUser = async (req, res) => {
  const id = req.id;
  const userId = req.params.userId;

  try {
    const userDetail = await userModel.findById(id);

    if (!userDetail) {
      return res
        .status(404)
        .json({ message: "user not found !", success: false });
    }

    if (userId !== id) {
      return res
        .status(404)
        .json({ message: "you are not authorized", success: false });
    }

    userDetail.membership(true);

    userDetail.save();

    res
      .status(201)
      .json({
        messgae: "you are promoted to provider/seller",
        success: true,
        userDetail: userDetail,
      });
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({
        message: "internal server error",
        error: error.message,
        success: false,
      });
  }
};

// delete user
module.exports.deleteUser = async (req, res) => {
  const id = req.id;
  const { password, emailCode } = req.body;

  if (!password && !emailCode) {
    return res
      .status(201)
      .json({ message: "fill all the credentails", success: false });
  }

  try {
    const userDetail = await userModel.findById(id);

    if (password) {
      if (userDetail.password != password) {
        return res
          .status(201)
          .json({ message: "invalid credentails", success: false });
      }
    } else if (emailCode) {
      if (userDetail.verificationCode.email !== emailCode) {
        return res
          .status(201)
          .json({ message: "invalid credentails", success: false });
      }

      userDetail.verificationCode.email = null;
    }

    await userDetail.save();

    await userModel.findByIdAndDelete(id);

    return res
      .status(201)
      .json({ message: "user deleted sucessfully !", success: true });
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({
        message: "internal server error",
        error: error.message,
        success: false,
      });
  }
};

// get user apis
// user get all APIs
module.exports.getUserApis = async (req, res) => {
 const userId = req.id; // middleware sets req.id from JWT

try {
  const userDetail = await userModel.findById(userId).lean();

  if (!userDetail) {
    return res
      .status(404)
      .json({ message: "User account not found!", success: false });
  }

  // Step 1: Extract apiIds from userDetail.api
  const apiIds = userDetail.api.map((api) => api.apiId);

  // Step 2: Query the Api collection for those IDs
  const apis = await apiModel.find({ _id: { $in: apiIds } }).lean();

  // Step 3: Merge userDetail.api info with apiModel docs
  const mergedApis = userDetail.api.map((apiEntry) => {
    const fullApiDoc = apis.find(
      (doc) => doc._id.toString() === apiEntry.apiId.toString()
    );
    return {
      ...apiEntry,       // subscription, keyCode, usage, etc.
      fullApiDoc,        // the full API document from apiModel
    };
  });

  return res.status(200).json({
    message: "User APIs fetched successfully",
    success: true,
    user: {
      username: userDetail.username,
      email: userDetail.email,
      role: userDetail.role,
      subscriptionPlan: userDetail.subscriptionPlan,
      profilePicture: userDetail.profilePicture,
    },
    apis: mergedApis,
  });
} catch (err) {
  console.error("error :", err);
  return res
    .status(500)
    .json({ message: "Server error fetching user APIs", success: false });
}

};
