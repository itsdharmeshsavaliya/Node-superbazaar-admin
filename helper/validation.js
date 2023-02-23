import { ERROR_IN_ARRAY } from '../config';
const abortEarly = (ERROR_IN_ARRAY === 'true') ? false : true;

const validate = async(validatorSchema, payload) => {
    return new Promise(async(resolve, reject) => {
        const { value, error } = await validatorSchema.validate(payload, { abortEarly });
        if (error) return reject(error);
        return resolve(value);
    });
};
export { validate };