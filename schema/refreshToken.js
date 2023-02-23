import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    token: { type: String, unique: true },
    role: { type: String, trim: true, default: "user", enum: ["user", "admin"] },
}, { timestamps: true });

export default mongoose.model('RefreshToken', refreshTokenSchema, 'refreshTokens');