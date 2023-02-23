import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username: { type: String, trim: true, required: true, default: "admin" },
    password: { type: String, trim: true, required: true },
    status: { type: Boolean, default: true },
    __v: { select: false }
}, {
    timestamps: true,
    toObject: { getters: true, setters: true },
    toJSON: { getters: true, setters: true },
    id: false,
    __v: false
});

export default mongoose.model('Admin', adminSchema, 'admin');