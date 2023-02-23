import _ from 'underscore';
import JwtService from '../../services/JwtService';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import {
    SAVE_JWT_TOKEN_IN_COOKIE,
    JWT_COOKIE_NAME,
    JWT_ADMIN_COOKIE_NAME
} from '../../config';
import { commonHelper } from '../../helper';
import { User, RefreshToken, Admin } from '../../models';
import { refreshTokenValidatorSchema } from '../../validators';
import { validate } from '../../helper';

const refreshTokenController = {
    async refresh(req, res, next) {
        try {
            req.body = await validate(refreshTokenValidatorSchema, req.body);

            let refreshTokenInfo = await RefreshToken.fetchByToken({ token: req.body.refreshToken });
            if (_.isEmpty(refreshTokenInfo)) return next(CustomErrorHandler.unAuthorized('Invalid refresh token!'));

            let refreshToken = refreshTokenInfo.token;
            let tokenInfo;
            try {
                tokenInfo = await JwtService.verify(refreshToken, "refresh");
            } catch (err) {
                return next(CustomErrorHandler.unAuthorized('Invalid refresh token'));
            }

            const { userId, role } = tokenInfo;
            const user = (role === 'user') ? await User.fetchById(userId) : await Admin.fetchById(userId);
            if (_.isEmpty(user)) return next(CustomErrorHandler.unAuthorized());

            let accessToken = await JwtService.sign({ userId, role });
            if (role === 'user') {
                if (SAVE_JWT_TOKEN_IN_COOKIE) res.cookie(JWT_COOKIE_NAME, accessToken, commonHelper.getCookieOptions());
            } else {
                res.cookie(JWT_ADMIN_COOKIE_NAME, accessToken, commonHelper.getCookieOptions());
            }
            res.json({ accessToken, refreshToken });
        } catch (err) {
            return next(err);
        }
    }
};

export default refreshTokenController;