import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const businessSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
}, { timestamps: true, id: false, __v: false });

export default mongoose.model('BusinessTypes', businessSchema, 'businessTypes');