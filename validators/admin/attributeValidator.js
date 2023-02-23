import * as Joi from 'joi';
import JoiObjectId from "joi-objectid";
Joi.objectId = JoiObjectId(Joi);
import CustomErrorHandler from '../../services/CustomErrorHandler';

const idValidatorFields = {
    id: Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid attribute ID!')),
};
const idValidatorSchema = Joi.object(idValidatorFields);

const createValidatorFields = {
    name: Joi.string().required().label("Attribute name"),
    values: Joi.array().required().items(Joi.string().required().error(CustomErrorHandler.unprocessableEntity('Please enter values for attribute!'))).error(CustomErrorHandler.unprocessableEntity('Please enter values for attribute!')),
};
const createValidatorSchema = Joi.object(createValidatorFields);

const updateValidatorSchema = Joi.object({
    ...createValidatorFields,
    ...idValidatorFields,
});

const idsValidatorSchema = Joi.object({
    ids: Joi.array().required().min(1).items(Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid attribute ID!'))).error(CustomErrorHandler.unprocessableEntity('Please select any attribute(s)!')),
});

export {
    idValidatorSchema,
    createValidatorSchema,
    updateValidatorSchema,
    idsValidatorSchema,
};