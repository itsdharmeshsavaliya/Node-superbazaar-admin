import * as Joi from 'joi';

const refreshTokenFields = {
    refreshToken: Joi.string().required().label("Refresh Token"),
};
const refreshTokenValidatorSchema = Joi.object(refreshTokenFields).unknown();

export default refreshTokenValidatorSchema;