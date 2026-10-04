import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({ user });
  } catch {
    res.status(500).json({
      message: "Could not load profile"
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile updated",
      user
    });
  } catch {
    res.status(500).json({
      message: "Could not update profile"
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both passwords are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.user.id);

    const match = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        message: "Current password is incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      message: "Password changed successfully"
    });
  } catch {
    res.status(500).json({
      message: "Could not change password"
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch {
    res.status(500).json({
      message: "Could not load users"
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        message: "You cannot delete yourself"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted"
    });
  } catch {
    res.status(500).json({
      message: "Could not delete user"
    });
  }
};
