import Joi from 'joi';
import JoiObjectId from "joi-objectid";
Joi.objectId = JoiObjectId(Joi);
import { commonHelper } from '../../helper';

const menuValidatorSchema = Joi.object({
    type: Joi.string().trim().required().valid(...commonHelper.validMenuTypes()).label("Menu type").messages({
        'any.only': "Please select {{#label}}!"
    })
});

// const menuIdValidatorSchema = Joi.object({
//     id: Joi.objectId().required().label("Menu Id").messages({
//         'string.pattern.name': "Invalid {{#label}}!"
//     }),
// });

export {
    menuValidatorSchema,
    // menuIdValidatorSchema 
};