require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Atlas Connected successfully.');

    // Sample users with plain text passwords before hashing
    const sampleUsersRaw = [
      {
        name: 'Chief Mess Warden / Admin',
        email: 'admin@hostel.edu',
        plainPassword: 'adminSecurePassword123!',
        role: 'admin',
      },
      {
        name: 'Dining Hall Supervisor',
        email: 'supervisor@hostel.edu',
        plainPassword: 'supervisorPass2026#',
        role: 'supervisor',
      },
      {
        name: 'Vibhuti (Student)',
        email: 'student@hostel.edu',
        plainPassword: 'studentPass2026',
        role: 'student',
      },
    ];

    console.log('\n========================================================================');
    console.log('QUESTION 2(a) DEMONSTRATION: PASSWORDS BEFORE HASHING (VULNERABLE PLAIN TEXT)');
    console.log('========================================================================');
    console.table(
      sampleUsersRaw.map((u) => ({
        Name: u.name,
        Email: u.email,
        PlainTextPassword: u.plainPassword,
        Role: u.role,
        SecurityStatus: 'INSECURE - Plain Text Vulnerable to Breaches',
      }))
    );

    console.log('\nGenerating salted bcrypt hashes (10 rounds of salt) & TOTP secrets...');

    const hashedUsers = [];
    for (const raw of sampleUsersRaw) {
      // Salted bcrypt hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(raw.plainPassword, salt);

      // TOTP secret for MFA
      const totpSecret = speakeasy.generateSecret({
        length: 20,
        name: `MessHub (${raw.email})`,
        issuer: 'MessHub Institute Mess',
      });

      hashedUsers.push({
        name: raw.name,
        email: raw.email,
        plainPasswordRef: raw.plainPassword,
        password: hashedPassword,
        role: raw.role,
        totpSecret: totpSecret.base32,
        totpEnabled: true,
      });
    }

    // Save or update in MongoDB Atlas
    for (const u of hashedUsers) {
      await User.findOneAndUpdate(
        { email: u.email },
        {
          name: u.name,
          email: u.email,
          password: u.password,
          role: u.role,
          totpSecret: u.totpSecret,
          totpEnabled: u.totpEnabled,
        },
        { upsert: true, new: true }
      );
    }

    console.log('\n========================================================================');
    console.log('QUESTION 2(a) DEMONSTRATION: PASSWORDS AFTER SALTED BCRYPT HASHING (SECURE IN DATABASE)');
    console.log('========================================================================');
    
    const dbUsers = await User.find({}).lean();
    console.table(
      dbUsers.map((u) => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        StoredBcryptHash: u.password,
        TOTPEnabled: u.totpEnabled,
        TOTPSecret: u.totpSecret,
      }))
    );

    console.log('\nAll users seeded successfully into MongoDB Atlas.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
