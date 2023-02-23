import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import { APP_URL } from '../config';

const productSchema = new Schema({
    attributeSet: {
        type: Schema.Types.ObjectId,
        ref: 'AttributeSets',
        required: false,
    },
    attributesValues: {
        type: Object, //OR Schema.Types.Mixed OR mongoose.Mixed OR {}
        required: false
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Categories',
        required: true,
    }],
    subcategories: [{
        type: Schema.Types.ObjectId,
        ref: 'Subcategories',
    }],
    sku: { //product code
        type: String,
        required: true
    },
    name: { type: String, required: true },
    images: [{
        type: String,
        required: true,
        get: (image) => {
            return (image) ? `${APP_URL}${image}` : '';
        },
    }],
    isCatalog: {
        type: Boolean,
        required: true,
        default: false
    },
    price: { //B2B Price
        type: Number,
        default: 0,
        required: true,
    },
    assortedPrice: { //B2B + Semi B2B (Assorted) Price
        type: Number,
        default: 0,
        required: true,
    },
    singlePrice: { //B2C Price
        type: Number,
        default: 0,
        required: true,
    },
    quantity: {
        type: Number,
        default: 0,
        required: true,
    },
    description: {
        type: String,
        required: false,
        default: ""
    },
    description2: {
        type: String,
        required: false,
        default: ""
    },
    metaTitle: { type: String, required: false, default: "" },
    metaKeyword: { type: String, required: false, default: "" },
    metaDescription: { type: String, required: false, default: "" },
}, {
    timestamps: true,
    toJSON: { getters: true },
    id: false,
    __v: false
});

export default mongoose.model('Product', productSchema, 'products');