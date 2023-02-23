import * as Joi from 'joi';
import JoiObjectId from "joi-objectid";
Joi.objectId = JoiObjectId(Joi);
import CustomErrorHandler from '../../services/CustomErrorHandler';

const categoryIdValidatorSchema = Joi.object({
    id: Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid category ID!')),
});

let createValidatorFields = {
    category: Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid category ID!')),
    name: Joi.string().required().label("Subcategory name"),
    description: Joi.string().allow(''),
    metaTitle: Joi.string().allow('').label("Meta title"),
    metaKeyword: Joi.string().allow('').label("Meta keyword"),
    metaDescription: Joi.string().allow('').label("Meta description"),
    status: Joi.boolean().required().error(CustomErrorHandler.unprocessableEntity('Please select status!')),
};
const createValidatorSchema = Joi.object(createValidatorFields);

const idValidatorFields = {
    id: Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid subcategory ID!')),
};
const idValidatorSchema = Joi.object(idValidatorFields);

delete createValidatorFields.category;
const updateValidatorSchema = Joi.object({
    ...createValidatorFields,
    ...idValidatorFields,
});

const idsValidatorFields = {
    ids: Joi.array().required().min(1).items(Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid subcategory ID!'))).error(CustomErrorHandler.unprocessableEntity('Please select any subcategories!')),
};
const idsValidatorSchema = Joi.object(idsValidatorFields);

const statusValidatorSchema = Joi.object({
    ...idsValidatorFields,
    status: Joi.boolean().required().error(CustomErrorHandler.unprocessableEntity('Please select status!')),
});

export {
    categoryIdValidatorSchema,
    createValidatorSchema,
    idValidatorSchema,
    updateValidatorSchema,
    idsValidatorSchema,
    statusValidatorSchema
};