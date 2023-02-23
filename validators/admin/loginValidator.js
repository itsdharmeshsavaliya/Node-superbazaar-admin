import * as Joi from 'joi';

const loginValidatorFields = {
    username: Joi.string().trim().required().label("Username"),
    password: Joi.string().trim().required().label("Password"),
};
const adminLoginValidatorSchema = Joi.object(loginValidatorFields).unknown();

export default adminLoginValidatorSchema;