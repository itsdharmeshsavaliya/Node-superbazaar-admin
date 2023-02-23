import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const attributeSetSchema = new Schema({
    name: { type: String, trim: true, required: true },
    attributes: [{
        type: Schema.Types.ObjectId,
        ref: 'Attribute',
    }],
    __v: { type: Number, select: false }
}, {
    timestamps: true,
    id: false,
    __v: false,
});

export default mongoose.model('AttributeSet', attributeSetSchema, 'attributeSets');