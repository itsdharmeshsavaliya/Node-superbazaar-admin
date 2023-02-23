import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import { commonHelper } from '../helper';

const menuSchema = new Schema({
    type: {
        type: String,
        required: true,
        unique: true,
        enum: commonHelper.validMenuTypes(),
    },
    __v: { type: Number, select: false }
}, {
    timestamps: true,
    toJSON: { getters: true },
    id: false,
    __v: false,
});

export default mongoose.model('Menus', menuSchema, 'menus');