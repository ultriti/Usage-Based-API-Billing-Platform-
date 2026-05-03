const exporess = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const adminModel = require("../model/admin.model");
const providerModel = require("../model/provider.model");
const apiModel = require("../model/api.model");

// admin create --------------
module.exports.adminRegister = async (req, res) => {
  const { email, password, username, adminToken } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  console.log("adminToken", process.env.SECRET_KEY_ADMIN_TOKEN);

  if (!adminToken) {
    return res
      .status(400)
      .json({ message: "sorry you are not authorized to continue!" });
  }

  if (String(adminToken) != String(process.env.SECRET_KEY_ADMIN_TOKEN)) {
    return res
      .status(400)
      .json({ message: "wrong token you are not authorized to continue!" });
  }

  try {
    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ message: "Admin already exists", success: false });
    }

    const hashedPassword = await adminModel.prototype.hashPassword(password);

    const createdAdmin = await adminModel.create({
      username,
      email,
      password: hashedPassword,
      role: "admin",
      adminToken: adminToken,
    });

    // Mark email verified (optional, depending on your flow)
    // createdAdmin.isVerified.email = true;
    await createdAdmin.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: createdAdmin._id,
        email: createdAdmin.email,
        role: createdAdmin.role,
      },
      process.env.SECRET_KEY,
    );

    // Set cookie
    res.cookie("apiAdminToken", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + 3600000 * 24 * 30), // 30 days
    });

    return res.status(201).json({
      message: "Admin registered successfully",
      success: true,
      Admin: createdAdmin,
    });
  } catch (error) {
    console.error("error :", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};


// admin login
module.exports.adminLogin = async (req, res) => {
  const { email, password, adminToken } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "All fields are required", success: false });
  }

  if (!adminToken) {
    return res
      .status(400)
      .json({ message: "sorry you are not authorized to continue!" });
  }

  if (String(adminToken) != String(process.env.SECRET_KEY_ADMIN_TOKEN)) {
    return res
      .status(400)
      .json({ message: "wrong token you are not authorized to continue!" });
  }

  try {
    // Find admin by email (include password explicitly since it's select:false)
    const admin = await adminModel.findOne({ email }).select("+password");
    if (!admin) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    // Compare password using schema method
    const isMatch = await adminModel.prototype.comparePassword(
      password,
      admin.password,
    );
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: admin._id,
        email: admin.email,
        role: admin.role,
      },
      process.env.SECRET_KEY,
    );

    // Set cookie
    res.cookie("apiAdminToken", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      expires: new Date(Date.now() + 3600000 * 24 * 30), // 30 days
    });

    return res.status(200).json({
      message: "Admin login successful",
      success: true,
      Admin: {
        _id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("error :", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};


// Admin get all providers (with associated APIs + total amount)
module.exports.getAllProvider = async (req, res) => {
  try {
    // Optional filters
    const { name } = req.query;

    let query = {};
    if (name) {
      query.username = { $regex: name, $options: "i" };
    }

    // Fetch providers with limit
    const providers = await providerModel
      .find(query)
      .limit(10)
      .populate({
        path: "apiCreated.apiId",
        model: "API", // replace with your actual apiModel name
        select: "name url billing",
      });

    if (!providers || providers.length === 0) {
      return res.status(404).json({
        message: "No providers found",
        success: false,
      });
    }

    // Build response array with total amount per provider
    const providerData = providers.map((provider) => {
      const apis = provider.apiCreated.map((entry) => entry.apiId).filter(Boolean);

      let totalAmount = 0;
      apis.forEach((api) => {
        if (api.billing && api.billing.consumerDetail) {
          api.billing.consumerDetail.forEach((bill) => {
            totalAmount += bill.ammountPaid || 0;
          });
        }
      });

      return {
        _id: provider._id,
        username: provider.username,
        email: provider.email,
        profilePicture: provider.profilePicture,
        isVerified: provider.isVerified,
        subscriptionPlan: provider.subscriptionPlan,
        apis,
        totalAmount,
      };
    });

    return res.status(200).json({
      message: "Providers fetched successfully",
      success: true,
      count: providerData.length,
      providers: providerData,
    });
  } catch (error) {
    console.error("error :", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};





// Admin get all APIs (with optional filter by name)
module.exports.getAllApis = async (req, res) => {
  try {
    const { name } = req.query;

    let query = {};

    if (name) {
      // case-insensitive regex search on API name
      query.name = { $regex: name, $options: "i" };
    }

    const apis = await apiModel.find(query);

    if (!apis || apis.length === 0) {
      return res
        .status(404)
        .json({ message: "No APIs found", success: false });
    }

    return res.status(200).json({
      message: "APIs fetched successfully",
      success: true,
      count: apis.length,
      apis,
    });
  } catch (error) {
    console.error("error :", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};


// delete provider
// Admin delete provider by ID
module.exports.deleteProvider = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Provider ID is required", success: false });
    }

    const deletedProvider = await providerModel.findByIdAndDelete(id);

    if (!deletedProvider) {
      return res
        .status(404)
        .json({ message: "Provider not found", success: false });
    }

    return res.status(200).json({
      message: "Provider deleted successfully",
      success: true,
      deletedProvider,
    });
  } catch (error) {
    console.error("error :", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      success: false,
    });
  }
};
