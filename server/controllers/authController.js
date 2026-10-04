import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { generateOTP } from "../utils/generateOTP.js";
import { createToken } from "../utils/token.js";
import { sendEmail } from "../config/mailer.js";

const emailOf = (email) => email.toLowerCase().trim();

const OTP_EXPIRY = 5 * 60 * 1000;
const RESEND_COOLDOWN = 30 * 1000;
const MAX_OTP_REQUESTS = 5;
const MAX_OTP_ATTEMPTS = 5;

export const sendRegisterOTP = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const cleanEmail = emailOf(email);

    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email is already registered"
      });
    }

    const now = new Date();

    let record = await OTP.findOne({
      email: cleanEmail,
      type: "register"
    });

    if (record) {
      const timePassed = now - record.lastSentAt;

      if (timePassed < RESEND_COOLDOWN) {
        const remaining = Math.ceil(
          (RESEND_COOLDOWN - timePassed) / 1000
        );

        return res.status(429).json({
          message: `Please wait ${remaining} seconds before requesting another OTP`
        });
      }

      if (record.requestCount >= MAX_OTP_REQUESTS) {
        return res.status(429).json({
          message: "Maximum OTP requests reached. Please try again later."
        });
      }
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!record) {
      record = await OTP.create({
        email: cleanEmail,
        otp,
        type: "register",
        name,
        password: hashedPassword,
        expiresAt: new Date(Date.now() + OTP_EXPIRY),
        attempts: 0,
        requestCount: 1,
        lastSentAt: now
      });
    } else {
      record.otp = otp;
      record.name = name;
      record.password = hashedPassword;
      record.expiresAt = new Date(Date.now() + OTP_EXPIRY);
      record.attempts = 0;
      record.requestCount += 1;
      record.lastSentAt = now;

      await record.save();
    }

    await sendEmail(
      cleanEmail,
      "Your registration OTP",
      `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `
    );

    res.json({
      message: "OTP sent successfully",
      email: cleanEmail
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not send OTP"
    });
  }
};

export const verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = emailOf(email || "");

    const record = await OTP.findOne({
      email: cleanEmail,
      type: "register"
    });

    if (!record) {
      return res.status(400).json({
        message: "OTP not found"
      });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({
        _id: record._id
      });

      return res.status(400).json({
        message: "OTP expired"
      });
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await OTP.deleteOne({
        _id: record._id
      });

      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP."
      });
    }

    if (record.otp !== otp) {
      record.attempts += 1;

      await record.save();

      const remaining = MAX_OTP_ATTEMPTS - record.attempts;

      return res.status(400).json({
        message:
          remaining > 0
            ? `Invalid OTP. ${remaining} attempts remaining.`
            : "Too many incorrect attempts. Please request a new OTP."
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      await OTP.deleteOne({
        _id: record._id
      });

      return res.status(400).json({
        message: "Email is already registered"
      });
    }

    const user = await User.create({
      name: record.name,
      email: cleanEmail,
      password: record.password,
      isEmailVerified: true
    });

    await OTP.deleteOne({
      _id: record._id
    });

    const token = createToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed"
    });
  }
};

export const resendRegisterOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = emailOf(email || "");

    const record = await OTP.findOne({
      email: cleanEmail,
      type: "register"
    });

    if (!record) {
      return res.status(400).json({
        message: "Registration data not found. Start again."
      });
    }

    const now = new Date();
    const timePassed = now - record.lastSentAt;

    if (timePassed < RESEND_COOLDOWN) {
      const remaining = Math.ceil(
        (RESEND_COOLDOWN - timePassed) / 1000
      );

      return res.status(429).json({
        message: `Please wait ${remaining} seconds before requesting another OTP`
      });
    }

    if (record.requestCount >= MAX_OTP_REQUESTS) {
      return res.status(429).json({
        message: "Maximum OTP requests reached. Please try again later."
      });
    }

    const otp = generateOTP();

    record.otp = otp;
    record.expiresAt = new Date(Date.now() + OTP_EXPIRY);
    record.attempts = 0;
    record.requestCount += 1;
    record.lastSentAt = now;

    await record.save();

    await sendEmail(
      cleanEmail,
      "Your new registration OTP",
      `
        <h2>Email Verification</h2>
        <p>Your new OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `
    );

    res.json({
      message: "New OTP sent",
      remainingRequests:
        MAX_OTP_REQUESTS - record.requestCount
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not resend OTP"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = emailOf(email || "");

    const user = await User.findOne({
      email: cleanEmail
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email first"
      });
    }

    const token = createToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed"
    });
  }
};

export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = emailOf(email || "");

    const user = await User.findOne({
      email: cleanEmail
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email"
      });
    }

    const now = new Date();

    let record = await OTP.findOne({
      email: cleanEmail,
      type: "reset"
    });

    if (record) {
      const timePassed = now - record.lastSentAt;

      if (timePassed < RESEND_COOLDOWN) {
        const remaining = Math.ceil(
          (RESEND_COOLDOWN - timePassed) / 1000
        );

        return res.status(429).json({
          message: `Please wait ${remaining} seconds before requesting another OTP`
        });
      }

      if (record.requestCount >= MAX_OTP_REQUESTS) {
        return res.status(429).json({
          message: "Maximum OTP requests reached. Please try again later."
        });
      }
    }

    const otp = generateOTP();

    if (!record) {
      record = await OTP.create({
        email: cleanEmail,
        otp,
        type: "reset",
        expiresAt: new Date(Date.now() + OTP_EXPIRY),
        attempts: 0,
        requestCount: 1,
        lastSentAt: now
      });
    } else {
      record.otp = otp;
      record.expiresAt = new Date(Date.now() + OTP_EXPIRY);
      record.attempts = 0;
      record.requestCount += 1;
      record.lastSentAt = now;

      await record.save();
    }

    await sendEmail(
      cleanEmail,
      "Password reset OTP",
      `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `
    );

    res.json({
      message: "Reset OTP sent",
      email: cleanEmail
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Could not send reset OTP"
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const cleanEmail = emailOf(email || "");

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const record = await OTP.findOne({
      email: cleanEmail,
      type: "reset"
    });

    if (!record) {
      return res.status(400).json({
        message: "OTP not found"
      });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({
        _id: record._id
      });

      return res.status(400).json({
        message: "OTP expired"
      });
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await OTP.deleteOne({
        _id: record._id
      });

      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP."
      });
    }

    if (record.otp !== otp) {
      record.attempts += 1;

      await record.save();

      const remaining = MAX_OTP_ATTEMPTS - record.attempts;

      return res.status(400).json({
        message:
          remaining > 0
            ? `Invalid OTP. ${remaining} attempts remaining.`
            : "Too many incorrect attempts. Please request a new OTP."
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await User.updateOne(
      {
        email: cleanEmail
      },
      {
        password: hashedPassword
      }
    );

    await OTP.deleteOne({
      _id: record._id
    });

    res.json({
      message: "Password reset successful"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Password reset failed"
    });
  }
};