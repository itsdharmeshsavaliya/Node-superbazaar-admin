import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import { APP_URL } from '../config';

const categorySchema = new Schema({
    name: { type: String, trim: true, required: true },
    image: {
        type: String,
        required: false,
        get: (image) => {
            return (image) ? `${APP_URL}${image}` : '';
        },
    },
    description: { type: String, required: false, default: "" },
    menu: {
        type: Schema.Types.ObjectId,
        ref: 'Menus'
    },
    megaMenuFilters: [{
        type: Schema.Types.ObjectId,
        ref: 'Attributes',
        sparse: true, //allow empty array, otherwise it generates duplicate value in megaMenuFilters error
    }],
    metaTitle: { type: String, required: false, default: "" },
    metaKeyword: { type: String, required: false, default: "" },
    metaDescription: { type: String, required: false, default: "" },
    status: { type: Boolean, default: true },
    __v: { type: Number, select: false }
}, {
    timestamps: true, //need createdAt & updatedAt datetime fields in response
    toObject: { getters: true, setters: true },
    toJSON: { getters: true, setters: true }, //set custom function with getters/setters method in schema
    id: false, //don't need this field in response
    __v: false, //don't need this field in response
    strict: false,
});

export default mongoose.model('Category', categorySchema, 'categories');