const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true
    },
    lastName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        unique: true,
        require: true,
        lowercase: true
    },
    phone: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: true,
        enum: ['male', 'female', 'others']
    },
    password: {
        type: String,
        require: true,
        select: false
    },
    role: {
        type: String,
        require: true,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: () => {
            return Date.now()
        },
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: () => {
            return Date.now()
        }
    }
});


module.exports = mongoose.model("user", userSchema);