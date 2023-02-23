import * as Joi from 'joi';
import JoiObjectId from "joi-objectid";
Joi.objectId = JoiObjectId(Joi);

import { registerValidatorFields } from './registerValidator';

const userIdValidatorFields = {
    userId: Joi.objectId().required().label("User Id").messages({
        'string.pattern.name': "Invalid {{#label}}!"
    }),
};
const userIdValidatorSchema = Joi.object(userIdValidatorFields).unknown();


delete registerValidatorFields.password;
const editProfileValidatorFields = registerValidatorFields;
const editProfileValidatorSchema = Joi.object(editProfileValidatorFields).unknown();


const changePasswordValidatorFields = {
    currentPassword: Joi.string().trim().required().label("Current password"), //.pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))    
    newPassword: Joi.string().trim().required().label("New password"),
    confirmPassword: Joi.string().trim().valid(Joi.ref('newPassword')).required().label("Confirm password").messages({
        'any.only': "Confirm password must be same as new password!"
    }),
};
const changePasswordValidatorSchema = Joi.object(changePasswordValidatorFields);

export {
    userIdValidatorFields,
    userIdValidatorSchema,
    editProfileValidatorSchema,
    changePasswordValidatorSchema
};