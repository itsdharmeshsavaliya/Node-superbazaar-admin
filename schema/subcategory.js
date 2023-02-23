import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    name: { type: String, required: true },
    description: { type: String, required: false, default: "" },
    metaTitle: { type: String, required: false, default: "" },
    metaKeyword: { type: String, required: false, default: "" },
    metaDescription: { type: String, required: false, default: "" },
    status: { type: Boolean, default: true },
    __v: { type: Number, select: false }
}, {
    timestamps: true, //need createdAt & updatedAt datetime fields in response
    toJSON: { getters: true }, //set custom function with getters/setters method in schema
    id: false, //don't need this field in response
    __v: false, //don't need this field in response
});

export default mongoose.model('Subcategory', subcategorySchema, 'subcategories');