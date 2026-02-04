import express from "express";
import Admin from "../models/admin.js";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const setting = express.Router();

setting.post("/updateSettings", async (req, res) => {
  console.log(req.body);
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      msg: "Bad request found",
    });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Admin.findById(decode.id);
    switch (req.body.tab) {
      case "security": {
        const {
          currentPassword,
          newPassword,
          confirmPassword,
          twoFactorEnabled,
        } = req.body.data;

        // support both hashed (bcrypt) and legacy-plaintext passwords
        let isMatch = false;
        if (user.password && typeof user.password === 'string' && user.password.startsWith('$2')) {
          isMatch = Boolean(currentPassword, user.password);
        } else {
          isMatch = Boolean(currentPassword === user.password);
        }

        if (!isMatch) {
          return res.status(401).json({
            success: false,
            msg: "Incorrect password",
          });
        }

        if (newPassword || confirmPassword) {
          if (newPassword !== confirmPassword) {
            return res.status(400).json({
              success: false,
              msg: "Both passwords should match",
            });
          }
          // store new passwords as bcrypt hashes (backwards-compatible login is supported)
          user.password = newPassword;
        }

        if (twoFactorEnabled === true && !user.twoFactorEnabled) {
          const secret = speakeasy.generateSecret({
            name: "Feeds Admin",
          });

          user.twoFactorEnabled = true;
          user.twoFactorSecret = secret.base32;
          await user.save();

          const qrCode = await QRCode.toDataURL(secret.otpauth_url);

          return res.status(200).json({
            success: true,
            msg: "Two-factor authentication enabled",
            qrCode,
          });
        }

        // 🔓 DISABLE 2FA
        if (twoFactorEnabled === false && user.twoFactorEnabled) {
          user.twoFactorEnabled = false;
          user.twoFactorSecret = undefined;
          await user.save();

          return res.status(200).json({
            success: true,
            msg: "Two-factor authentication disabled",
          });
        }

        await user.save();

        return res.status(200).json({
          success: true,
          msg: "Security details updated",
        });
      }
      case "profile":
        const { name, email } = req.body.data;
        try {
          user.username = name;
          user.email = email;
          await user.save();
          // clear cookie and logout
          return res.status(201).json({
            success: true,
            msg: "Details updated!!",
          });
        } catch (e) {
          return res.status(400).json({
            success: false,
            msg: "Error saving new Details",
          });
        }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error, try re-login",
    });
  }
});

setting.post("/verify-2fa", async (req, res) => {
  const { otp } = req.body;
  const token = req.cookies.auth_token;

  const decode = jwt.verify(token, process.env.JWT_SECRET);
  // twoFactorSecret is stored with select: false; explicitly include it here
  const user = await Admin.findById(decode.id).select('+twoFactorSecret');

  if (!user || !user.twoFactorSecret) {
    return res.status(400).json({
      success: false,
      msg: "Two-factor authentication is not enabled for this account",
    });
  }

  const tokenStr = String(otp || '').trim();

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: tokenStr,
    window: 2,
  });

  if (process.env.NODE_ENV !== 'production') {
    // dev-only: show server-side TOTP for debugging (DO NOT enable in production)
    console.log('server totp:', speakeasy.totp({ secret: user.twoFactorSecret, encoding: 'base32' }));
  }

  if (!verified) {
    return res.status(400).json({
      success: false,
      msg: "Invalid OTP",
    });
  }

  return res.status(200).json({
    success: true,
    msg: "Two-factor authentication verified",
  });
});
