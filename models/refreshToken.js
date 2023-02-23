import _ from 'underscore';
import { commonHelper } from '../helper';
import { RefreshTokenSchema } from '../schema';
import {
    IS_USER_MULTI_DEVICE_LOGIN,
    IS_ADMIN_MULTI_DEVICE_LOGIN
} from '../config';

const RefreshToken = {
    async fetchByToken(token) {
        try {
            let data = await RefreshTokenSchema.findOne(token);
            data = (data) ? commonHelper.nullToEmptyString(data) : {};
            return data;
        } catch (err) {
            return err;
        }
    },
    async fetchByParams(fields) {
        try {
            let data = await RefreshTokenSchema.findOne(fields);
            data = (data) ? commonHelper.nullToEmptyString(data) : {};
            return data;
        } catch (err) {
            return err;
        }
    },
    async create(payload) {
        try {
            let isMultiDeviceLogin = false;
            const { role } = payload;
            if (role === "admin") isMultiDeviceLogin = (IS_ADMIN_MULTI_DEVICE_LOGIN === 'true') ? true : false;
            if (role === "user") isMultiDeviceLogin = (IS_USER_MULTI_DEVICE_LOGIN === 'true') ? true : false;
            //Add more role conditions if more role is coming....

            if (!isMultiDeviceLogin) { //Single Device login only, so remove all token before creating one
                try {
                    const { userId } = payload;
                    await RefreshTokenSchema.deleteMany({ userId });
                } catch (error) {
                    //do nothing...
                }
            }

            const refreshToken = new RefreshTokenSchema(payload);
            let result = await refreshToken.save();
            const id = result ? result._id : "";
            return id;
        } catch (err) {
            return err;
        }
    },
    async delete(token) {
        try {
            let result = await RefreshTokenSchema.deleteOne(token);
            return (result && result.acknowledged) ? true : false;
        } catch (err) {
            return err;
        }
    },
}
export default RefreshToken;