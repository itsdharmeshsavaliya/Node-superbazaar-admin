import Joi from 'joi';
import JoiObjectId from "joi-objectid";
Joi.objectId = JoiObjectId(Joi);
import CustomErrorHandler from '../../services/CustomErrorHandler';

const idValidatorFields = {
    id: Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid product ID!')),
};
const idValidatorSchema = Joi.object(idValidatorFields);

const createValidatorFields = {
    attributeSet: Joi.objectId().required().label("Attribute set").error(CustomErrorHandler.unprocessableEntity('Invalid Attribute set ID!')),
    allAttributesInfo: Joi.object().required().label("All attributes Info").error(CustomErrorHandler.unprocessableEntity('Please enter all attribute(s) values!')),
    categories: Joi.array().required().items(Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid category ID!'))).error(CustomErrorHandler.unprocessableEntity('Please select any category!')),
    subcategories: Joi.array().required().items(Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid subcategory ID!'))).error(CustomErrorHandler.unprocessableEntity('Please select any subcategory!')),
    sku: Joi.string().required().label("Product SKU"),
    name: Joi.string().required().label("Product name"),
    isCatalog: Joi.boolean().required().label("Is catalog product?"),
    price: Joi.number().positive().precision(2).min(1).label("B2B price").error(CustomErrorHandler.unprocessableEntity('B2B price must be valid positive value!')),
    assortedPrice: Joi.number().positive().precision(2).min(1).required().label("B2B + Semi B2B (assorted) price").error(CustomErrorHandler.unprocessableEntity('B2B + Semi B2B (assorted) price must be valid positive value!')),
    singlePrice: Joi.number().positive().precision(2).min(1).required().label("B2C price").error(CustomErrorHandler.unprocessableEntity('B2C price must be valid positive value!')),
    quantity: Joi.number().integer().positive().min(0).required().label("Quantity").error(CustomErrorHandler.unprocessableEntity('Quantity must be valid positive value!')),
    description: Joi.string().allow('').optional().label("Product description"),
    description2: Joi.string().allow('').optional().label("Product description 2"),
    metaTitle: Joi.string().allow('').optional().label("Meta title"),
    metaKeyword: Joi.string().allow('').optional().label("Meta keyword"),
    metaDescription: Joi.string().allow('').optional().label("Meta description"),
};
const createValidatorSchema = Joi.object(createValidatorFields);

const updateValidatorSchema = Joi.object({
    ...createValidatorFields,
    ...idValidatorFields,
});

const idsValidatorSchema = Joi.object({
    ids: Joi.array().required().min(1).items(Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid product ID!'))).error(CustomErrorHandler.unprocessableEntity('Please select any product(s)!')),
});

export {
    idValidatorSchema,
    createValidatorSchema,
    updateValidatorSchema,
    idsValidatorSchema,
};