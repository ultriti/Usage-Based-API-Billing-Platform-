const exporess = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userModel = require("../model/user.model");
const providerModel = require("../model/provider.model");
const apiModel = require("../model/api.model");

// code generation for verification -------------->
const codegenerate = async (req, res) => {
  const crypto = require("crypto");

  function generateVerificationCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  const code = generateVerificationCode();

  const providerDetail = await providerModel.findById(req.id);

  providerDetail.verificationCode.email = code;
  await providerDetail.save();

  return code;
};

// demo code for code gen
module.exports.codeGen = async (req, res) => {
  const code = await codegenerate(req, res);
  return res.status(201).json({ message: "code gen", code });
};

// provider registeration
module.exports.providerRegister = async (req, res) => {
  const { email, password, role, username } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  try {
    const providerDeatil = await providerModel.findOne({ email });

    if (providerDeatil) {
      return res
        .status(400)
        .json({ message: "provider already exists", success: false });
    }

    const hashedPassword = await providerModel.prototype.hashPassword(password);
    const userDetail = await userModel.findOne({ email });


    if (userDetail?.email === email) {
      if (!userDetail.isVerified.email) {
        return res
          .status(400)
          .json({ message: "email not verified !", sucess: false });
      }

      const createdProvider = await providerModel.create({
        username: userDetail.username,
        email: userDetail.email,
        password: hashedPassword,
        role: "provider",
      });

      createdProvider.isVerified.email = true;
      await createdProvider.save();

      // Generate token
      const token = jwt.sign(
        {
          userId: createdProvider._id,
          email: createdProvider.email,
          role: createdProvider.role,
        },
        process.env.SECRET_KEY,
      );
      res.cookie("apiProviderToken", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 3600000 * 24 * 30),
      });

      return res.status(201).json({
        message: "provider registered successfully",
        success: true,
        Provider: createdProvider,
      });
    } else {
      const createdProvider = await providerModel.create({
        username,
        email,
        password: hashedPassword,
        role: "provider",
      });

      createdProvider.isVerified.email = true;
      await createdProvider.save();

      // Generate token
      // const token = jwt.sign({ email: email, userId: providerDetail._id, role: providerDetail.role }, process.env.SECRET_KEY);
      const token = jwt.sign(
        {
          userId: createdProvider._id,
          email: createdProvider.email,
          role: createdProvider.role,
        },
        process.env.SECRET_KEY,
      );
      res.cookie("apiProviderToken", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 3600000 * 24 * 30),
      });

      return res.status(201).json({
        message: "provider registered successfully",
        success: true,
        Provider: createdProvider,
      });
    }
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// provider  login
module.exports.providerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const providerDetail = await providerModel
      .findOne({ email: email })
      .select("+password");


    if (!providerDetail) {
      return res.status(400).json({
        message: "provider not found",
        success: false,
        errors: [{ msg: "provider not found" }],
      });
    }

    const isMatch = await providerDetail.comparePassword(
      password,
      providerDetail.password,
    );


    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    const token = jwt.sign(
      { email: email, userId: providerDetail._id, role: providerDetail.role },
      process.env.SECRET_KEY,
    );

    // res.cookie("apiProviderToken", token, {
    //     httpOnly: true,
    //     sameSite: 'lax',
    //     secure: false,
    //     expires: new Date(Date.now() + 3600000 * 24 * 30)
    // });

    res.cookie("apiProviderToken", token, {
      httpOnly: true,
      sameSite: "none", // or "strict"
      secure: true, // only true in production HTTPS
      expires: new Date(Date.now() + 3600000 * 24 * 30),
    });

    return res.status(200).json({
      message: "provider logged in successfully",
      success: true,
      providerDetail: providerDetail,
    });
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// get provider detail
module.exports.getProviderDetail = async (req, res) => {
  const id = req.id;

  try {
    const providerDetail = await providerModel.findById(id);


    if (!providerDetail) {
      return res
        .status(404)
        .json({ messgae: "provider not found! ", success: false });
    }
    return res.status(201).json({
      message: "provider found",
      success: true,
      providerDetail: providerDetail,
    });
  } catch (error) {
    console.log("error :", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// logout provider
module.exports.providerLogout = async (req, res) => {
  try {
    res.clearCookie("apiProviderToken");
    res.status(200).json({ msg: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ msg: "user cant logout " });
  }
};

// update provider detail
module.exports.updateProviderDetail = async (req, res) => {
  const { username, profileUrl, ProfileImgId } = req.body;

  const id = req.id;

  try {
    const providerDetail = await providerModel.findById(id);

    if (!providerDetail) {
      return res
        .status(404)
        .json({ messgae: "provider not found! ", success: false });
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

    res.status(200).json({
      message: "provider detail updated successfully",
      success: true,
      providerDetail,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// delete user
module.exports.deleteProvider = async (req, res) => {
  const id = req.id;
  const { password, emailCode } = req.body;

  if (!password && !emailCode) {
    return res
      .status(201)
      .json({ message: "fill all the credentails", success: false });
  }

  try {
    const providerDetail = await providerModel.findById(id);

    if (password) {
      if (providerDetail.password != password) {
        return res
          .status(201)
          .json({ message: "invalid credentails", success: false });
      }
    } else if (emailCode) {
      if (providerDetail.verificationCode.email !== emailCode) {
        return res
          .status(201)
          .json({ message: "invalid credentails", success: false });
      }

      providerDetail.verificationCode.email = null;
    }

    await providerDetail.save();

    await providerModel.findByIdAndDelete(id);

    return res
      .status(201)
      .json({ message: "provider deleted sucessfully !", success: true });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};

// get provider apis
module.exports.getProviderApi = async (req, res) => {
  const providerId = req.id;

  try {
    const providerDetails = await providerModel.findById(providerId);
    if (!providerDetails) {
      return res
        .status(400)
        .json({ message: "provider account not found!", success: false });
    }

    const providerApi = await apiModel.find({ providerId });
    
    if (!providerApi || providerApi.length === 0) {
      return res
        .status(400)
        .json({ message: "error fetching the api's!", success: false });
    }

    // Flatten all consumerDetail entries
    const apiBilling = providerApi.flatMap((api) => api.billing.consumerDetail);

    // Collect customerIds
    const customerIds = apiBilling.map((b) => b.customerId);

    // Limit at DB level
    const limit = 10;
    const users = await userModel
      .find({ _id: { $in: customerIds } })
      .select("username email")
      .limit(limit);


    // Merge user + billing info
    const billingData = apiBilling.slice(0, limit).map((billing) => {
      const user = users.find((u) => u._id.equals(billing.customerId));
      return {
        // url : providerApi?.platformUrl,
        username: user?.username,
        email: user?.email,
        totalRequest: billing.totalRequest,
        totalAmount: billing.ammountPaid, // spelling corrected
      };
    });


    return res.status(200).json({
      message: "provider api fetch!",
      success: true,
      providerApi,
      billingData,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "server error fetching provider api", success: false });
  }
};

// get provider api billing data
module.exports.getProviderApiBilling = async (req, res) => {
  const providerId = req.id;

  try {
    const providerDetails = await providerModel.findById(providerId);
    const providerApi = await apiModel.find({ providerId });


    if (!providerDetails) {
      return res
        .status(400)
        .json({ message: "provider account not found!", success: false });
    }
    if (!providerApi) {
      return res
        .status(400)
        .json({ message: "error fetching the api's!", success: false });
    }


    return res
      .status(200)
      .json({ message: "provider api fetch!", success: true, providerApi });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
      success: false,
    });
  }
};
