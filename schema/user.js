import mongoose from 'mongoose';
const Schema = mongoose.Schema;

import { systemSettingsHelper } from '../helper';
const loginFromTypes = systemSettingsHelper.loginFromTypes();

const userSchema = new Schema({
    loginFrom: { type: String, trim: true, required: true, default: "manually", enum: loginFromTypes },
    socialAuthId: { type: String, trim: true, required: false, default: null },
    fullname: { type: String, trim: true, required: false, default: null },
    email: { type: String, trim: true, required: false, default: null },
    username: { type: String, trim: true, required: false, default: null },
    password: { type: String, trim: true, required: false, default: null },
    gender: { type: String, trim: true, required: false, enum: ["male", "female", "", null] },
    dob: { type: String, trim: true, required: false, default: null },
    phoneCountryCode: { type: String, trim: true, required: false, default: null },
    phoneNumber: { type: String, trim: true, required: false, default: null },
    phone: { type: String, trim: true, required: false, default: null },
    role: { type: String, trim: true, default: "user", enum: ["user"] },
    status: { type: Boolean, default: false },
    __v: { select: false }
}, {
    timestamps: true,
    toObject: { getters: true, setters: true },
    toJSON: { getters: true, setters: true },
    id: false,
    __v: false
});

export default mongoose.model('User', userSchema, 'users');