import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('\n=== Create Super Admin User ===\n');

    const name = await question('Enter super admin name: ');
    const email = await question('Enter super admin email: ');
    const password = await question('Enter super admin password: ');

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\nError: User with this email already exists!');
      process.exit(1);
    }

    // Create super admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'super_admin',
      approvalStatus: 'approved',
      isActive: true
    });

    // Create staff record
    await Staff.create({
      name: user.name,
      role: 'Super Admin',
      department: 'Operations',
      contact: user.email,
      user: user._id,
      active: 'Yes'
    });

    console.log('\n✓ Super admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Role: super_admin`);
    console.log('\nYou can now log in with these credentials.\n');

    process.exit(0);
  } catch (error) {
    console.error('\nError creating super admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

createSuperAdmin();
