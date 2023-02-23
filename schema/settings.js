import mongoose from 'mongoose';
const Schema = mongoose.Schema;

import { systemSettingsHelper } from '../helper';
const B2BvisibleOption = systemSettingsHelper.getB2BVisibleOption();
let B2BvisibleOptionIds = Object.keys(B2BvisibleOption); //This'll only work for numeric strings - if it's a European string involving decimals, for instance, it'll be NaN

var validVisibleOptions = {
    values: [...Object.values(B2BvisibleOptionIds), '', "", null], //allow B2BvisibleOptionIds and blank(''/"") ONLY
    message: `Invalid values, valid values include [${B2BvisibleOptionIds}]`
};

const settingsBusinessSchema = new Schema({
    type: {
        type: Schema.Types.ObjectId,
        required: true,
        default: "632da5c52ae0801ff7c2a107"
    },
    visibleOption: { //For B2B
        type: Number,
        required: false,
        default: '',
        enum: validVisibleOptions,
    },
    minimumPieces: { //For B2B + Semi B2B(Assorted)
        type: Number,
        required: false,
        default: '',
    },
    minimumCart: { //For B2B + Semi B2B(Assorted)
        type: Number,
        required: false,
        default: '',
    },
}, {
    timestamps: true,
    toJSON: { getters: true },
    id: false,
    __v: false
});

export default mongoose.model('SettingsBusiness', settingsBusinessSchema, 'SettingsBusiness');