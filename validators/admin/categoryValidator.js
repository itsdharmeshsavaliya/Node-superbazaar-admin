import * as Joi from 'joi';
import JoiObjectId from "joi-objectid";
Joi.objectId = JoiObjectId(Joi);

const categoryValidatorSchema = Joi.object({
    name: Joi.string().trim().required().label("Category name"),
    image: Joi.string().trim().allow('').label("Category image"),
    description: Joi.string().trim().allow('').label("Description"),
    menu: Joi.objectId().required().label("Menu Id").messages({
        'string.pattern.name': "Invalid {{#label}}!"
    }),
    megaMenuFilters: Joi.when("menu", {
        is: "62dfd89c17b20e0d78f24ff4", // Filter(s) are required if menu is Mega Menu Filter         
        then: Joi.array().required().items(Joi.objectId().required().label("Filter Id").messages({
            'string.pattern.name': "Invalid {{#label}}!"
        })).messages({
            'array.includesRequiredKnowns': "Please select any filter(s)!",
        }),
        otherwise: Joi.array().allow(null).optional().default([]),
    }),
    metaTitle: Joi.string().trim().allow('').label("Meta title"),
    metaKeyword: Joi.string().trim().allow('').label("Meta keyword"),
    metaDescription: Joi.string().trim().allow('').label("Meta description"),
    status: Joi.string().required().valid("true", "false", true, false).label("Status"),
}).unknown();

const categoryIdValidatorFields = {
    id: Joi.objectId().required().label("Category Id").messages({
        'string.pattern.name': "Invalid {{#label}}!"
    }),
};
const categoryIdValidatorSchema = Joi.object(categoryIdValidatorFields);

const categoryIdsValidatorFields = {
    ids: Joi.array().required().items(Joi.objectId().required().label("Category Id").messages({
        'string.pattern.name': "Invalid {{#label}}!"
    })).messages({
        'array.includesRequiredKnowns': "Please select any categories!",
    }),
};
const categoryIdsValidatorSchema = Joi.object(categoryIdsValidatorFields);

const categoryStatusValidatorSchema = Joi.object({
    ...categoryIdsValidatorFields,
    status: Joi.boolean().required().label("Status"),
});

export {
    categoryValidatorSchema,
    categoryIdValidatorSchema,
    categoryIdsValidatorSchema,
    categoryStatusValidatorSchema
};