import * as Joi from 'joi';
import JoiObjectId from "joi-objectid";
Joi.objectId = JoiObjectId(Joi);

import { commonHelper, systemSettingsHelper } from '../../helper';
const B2BvisibleOption = systemSettingsHelper.getB2BVisibleOption();
const B2BvisibleOptionIds = commonHelper.convertArrayOfStringElementsToNumber(Object.keys(B2BvisibleOption));

const businessIdValidatorFields = {
    id: Joi.objectId().required().label("Business setting Id").messages({
        'string.pattern.name': "Invalid {{#label}}!"
    }),
};
const businessIdValidatorSchema = Joi.object(businessIdValidatorFields);

const businessValidatorFields = {
    ...businessIdValidatorFields,
    type: Joi.objectId().required().label("Business type").messages({
        'string.pattern.name': "Please select business type!"
    }),
    visibleOption: Joi.when("type", {
        is: Joi.objectId().required().valid("632da5c42ae0801ff7c2a0ff", "632da5c42ae0801ff7c2a101", "632da5c52ae0801ff7c2a103", "632da5c52ae0801ff7c2a105"),
        then: Joi.number().required().valid(...B2BvisibleOptionIds).label("B2B type").messages({
            'any.only': "Please select valid {{#label}}!"
        }),
        otherwise: Joi.number().optional().allow('').default('').label("B2B type").messages({
            'any.only': "Please select valid {{#label}}!"
        }),
    }),
    minimumPieces: Joi.when("type", {
        is: Joi.objectId().required().valid("632da5c52ae0801ff7c2a103", "632da5c52ae0801ff7c2a105"),
        then: Joi.number().required().min(1).label("Minimum pieces").messages({
            'number.min': "Please enter minimum {{#limit}} pieces for Semi B2B business!",
        }),
        otherwise: Joi.number().optional().allow('').default('').label("Minimum pieces").messages({
            'number.min': "Please enter minimum {{#limit}} pieces for Semi B2B business!",
        }),
    }),
    minimumCart: Joi.when("type", {
        is: Joi.objectId().required().valid("632da5c52ae0801ff7c2a103", "632da5c52ae0801ff7c2a105"),
        then: Joi.number().required().min(1).label("Minimum cart value").messages({
            'number.min': "Please enter minimum rs. {{#limit}} to cart price/value for Semi B2B business!",
        }),
        otherwise: Joi.number().optional().allow('').default('').label("Minimum cart value").messages({
            'number.min': "Please enter minimum rs. {{#limit}} to cart price/value for Semi B2B business!",
        }),
    }),
};
const businessValidatorSchema = Joi.object(businessValidatorFields);

export {
    businessIdValidatorSchema,
    businessValidatorSchema
};