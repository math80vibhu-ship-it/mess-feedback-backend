const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const { protect, JWT_SECRET } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user with salted bcrypt password hash & generate TOTP secret
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 1. Salted Password Hashing using bcrypt (Question 2a)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Generate TOTP MFA secret (Question 2b)
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `MessHub (${email})`,
      issuer: 'MessHub Institute Mess',
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      totpSecret: secret.base32,
      totpEnabled: true, // Enabled for MFA login
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully with salted bcrypt hash and TOTP 2FA secret.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        totpEnabled: newUser.totpEnabled,
      },
      mfa: {
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        otpauth_url: secret.otpauth_url,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Step 1 of Login: verify email & password with bcrypt
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare plain-text password against salted hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If TOTP MFA is enabled, require MFA step
    if (user.totpEnabled && user.totpSecret) {
      return res.json({
        success: true,
        requiresMfa: true,
        userId: user._id,
        role: user.role,
        message: 'Password verified. Please enter the 6-digit TOTP code from your Authenticator app.',
      });
    }

    // Otherwise issue JWT token directly
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      requiresMfa: false,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/verify-totp
// @desc    Step 2 of Login: verify 6-digit TOTP code and issue JWT token (Question 2b)
router.post('/verify-totp', async (req, res) => {
  try {
    const { userId, email, totpCode } = req.body;

    if (!totpCode || (!userId && !email)) {
      return res.status(400).json({ message: 'User identifier and 6-digit TOTP code are required' });
    }

    const query = userId ? { _id: userId } : { email };
    const user = await User.findOne(query);

    if (!user || !user.totpSecret) {
      return res.status(404).json({ message: 'User or TOTP configuration not found' });
    }

    // Verify TOTP token using speakeasy
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpCode.toString().trim(),
      window: 2, // Allow +/- 60 seconds clock drift
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired TOTP code. Please check your Google/Microsoft Authenticator app.',
      });
    }

    // Generate JWT token upon successful MFA verification
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      message: 'MFA TOTP verification successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/mfa-qr/:userId
// @desc    Get QR code for user to scan in Google Authenticator
router.get('/mfa-qr/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let secret = user.totpSecret;
    if (!secret) {
      const generated = speakeasy.generateSecret({
        length: 20,
        name: `MessHub (${user.email})`,
        issuer: 'MessHub Institute Mess',
      });
      user.totpSecret = generated.base32;
      user.totpEnabled = true;
      await user.save();
      secret = generated.base32;
    }

    const otpauthUrl = `otpauth://totp/MessHub%20(${encodeURIComponent(user.email)})?secret=${secret}&issuer=MessHub%20Institute%20Mess`;
    const qrCode = await QRCode.toDataURL(otpauthUrl);

    res.json({
      secret,
      qrCode,
      otpauthUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile (protected)
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
