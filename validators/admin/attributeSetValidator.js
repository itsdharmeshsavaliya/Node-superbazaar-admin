import * as Joi from 'joi';
import JoiObjectId from "joi-objectid";
Joi.objectId = JoiObjectId(Joi);
import CustomErrorHandler from '../../services/CustomErrorHandler';

const idValidatorFields = {
    id: Joi.objectId().required().label("Attribute Set Id").messages({
        'string.pattern.name': "Invalid {{#label}}!"
    }),
};
const idValidatorSchema = Joi.object(idValidatorFields);

const createValidatorFields = {
    name: Joi.string().trim().required().label("Attribute set name"),
    attributes: Joi.array().items(Joi.objectId().required().label("Attribute Set Id").messages({
        'string.pattern.name': "Invalid {{#label}}!"
    })).error(CustomErrorHandler.unprocessableEntity('Please select any attribute(s)!')),
};
const createValidatorSchema = Joi.object(createValidatorFields);

const updateValidatorSchema = Joi.object({
    ...createValidatorFields,
    ...idValidatorFields,
});

const idsValidatorSchema = Joi.object({
    ids: Joi.array().required().min(1).items(Joi.objectId().required().error(CustomErrorHandler.unprocessableEntity('Invalid attribute set ID!'))).error(CustomErrorHandler.unprocessableEntity('Please select any attribute set(s)!')),
});

export {
    idValidatorSchema,
    createValidatorSchema,
    updateValidatorSchema,
    idsValidatorSchema,
};