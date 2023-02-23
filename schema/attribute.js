import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const attributeSchema = new Schema({
    name: { type: String, trim: true, required: true },
    keyName: { type: String, trim: true, required: true },
    values: [{
        type: String,
        required: true
    }],
    __v: { type: Number, select: false }
}, {
    timestamps: true,
    id: false,
    __v: false,
});

export default mongoose.model('Attribute', attributeSchema, 'attributes');