require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const AuditLog = require('../models/auditLogModel');

const users = [
    {
        username: 'admin',
        email: 'admin@syntecxhub.com',
        password: 'Admin@123',
        role: 'admin',
    },
    {
        username: 'fazil',
        email: 'fazil@syntecxhub.com',
        password: 'User@123',
        role: 'user',
    },
];

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    await AuditLog.deleteMany({});

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await User.create({
            username: user.username,
            email: user.email,
            password: hashedPassword,
            role: user.role,
        });
    }

    console.log('Seeded admin and user accounts');
    console.log('Admin login: admin@syntecxhub.com / Admin@123');
    console.log('User login: fazil@syntecxhub.com / User@123');
    await mongoose.disconnect();
};

seed().catch((error) => {
    console.log(error);
    process.exit(1);
});
