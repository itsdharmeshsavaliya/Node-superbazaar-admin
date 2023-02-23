import * as Joi from 'joi';

import { systemSettingsHelper } from '../helper';
const loginFromTypes = systemSettingsHelper.loginFromTypes();

const loginValidatorFields = {
    loginFrom: Joi.string().trim().valid(...loginFromTypes).required(),
    username: Joi.when("loginFrom", {
        is: "manually",
        then: Joi.string().trim().email().required().label("Username"),
        otherwise: Joi.string().trim().optional().allow('').default('').label("Username"),
    }),
    password: Joi.when("loginFrom", {
        is: "manually",
        then: Joi.string().trim().required().label("Password"), //pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        otherwise: Joi.string().trim().optional().allow('').default('').label("Password"),
    }),
    socialAuthId: Joi.when("loginFrom", {
        // All below "is" conditions are working 
        // is: Joi.string().valid("google", "facebook"),
        // is: Joi.equal("google", "facebook"),
        is: Joi.invalid("manually"),
        then: Joi.string().trim().required().label("Social Auth ID"),
        otherwise: Joi.string().trim().optional().allow('').default('').label("Social Auth ID"),
    }),
    email: Joi.when("loginFrom", {
        is: Joi.invalid("manually"),
        then: Joi.string().trim().email().allow('').default('').label("Email"),
        otherwise: Joi.string().trim().optional().allow('').default('').label("Email"),
    }),
    fullname: Joi.when("loginFrom", {
        is: Joi.invalid("manually"),
        then: Joi.string().trim().allow('').default('').label("Fullname"),
        otherwise: Joi.string().trim().optional().allow('').default('').label("Fullname"),
    }),
};
const loginValidatorSchema = Joi.object(loginValidatorFields).unknown();

export default loginValidatorSchema;