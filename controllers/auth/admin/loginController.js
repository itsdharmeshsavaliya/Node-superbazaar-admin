import _ from 'underscore';
import bcrypt from 'bcrypt';
import CustomErrorHandler from '../../../services/CustomErrorHandler';
import JwtService from '../../../services/JwtService';
import { JWT_ADMIN_COOKIE_NAME } from '../../../config';
import {
    commonHelper,
    validate
} from '../../../helper';
import {
    Admin,
    RefreshToken
} from '../../../models';
import {
    adminLoginValidatorSchema,
    refreshTokenValidatorSchema
} from '../../../validators';

const adminLoginController = {
    async login(req, res, next) {
        try {
            // await Admin.create();
            // return res.json({ message: "Data saved successful!" });

            //Check if user already logged in?
            let token = req.cookies[JWT_ADMIN_COOKIE_NAME];
            if (token) return next(CustomErrorHandler.alreadyLoggedIn());

            req.body = await validate(adminLoginValidatorSchema, req.body);

            const { username } = req.body;
            const admin = await Admin.fetch(username);
            if (_.isEmpty(admin)) return next(CustomErrorHandler.wrongCredentials());

            if (!admin.status) return next(CustomErrorHandler.wrongCredentials("Your account is deactivated, please contact to administrator!"));

            let { password } = req.body;
            const match = await bcrypt.compare(password, admin.password);
            if (!match) return next(CustomErrorHandler.wrongCredentials());

            let adminId = admin.adminId;
            let role = "admin";
            let accessToken = await JwtService.sign({ userId: adminId, role });
            let refreshToken = await JwtService.sign({ userId: adminId, role }, "refresh");
            await RefreshToken.create({ userId: adminId, token: refreshToken, role });

            res.cookie(JWT_ADMIN_COOKIE_NAME, accessToken, commonHelper.getCookieOptions());
            return res.json({ accessToken, refreshToken });
        } catch (err) {
            return next(err);
        }
    },
    async logout(req, res, next) {
        try {
            req.body = await validate(refreshTokenValidatorSchema, req.body);

            const { refreshToken } = req.body;
            let refreshTokenInfo = await RefreshToken.fetchByParams({ userId: req.admin.adminId, token: refreshToken });
            if (_.isEmpty(refreshTokenInfo)) return next(CustomErrorHandler.unAuthorized('Invalid refresh token!'));

            await RefreshToken.delete({ token: refreshToken });
            res.clearCookie(JWT_ADMIN_COOKIE_NAME);

            res.json({ message: "Logged out successful" });
        } catch (err) {
            return next(CustomErrorHandler.somethingWrong());
        }
    }
};
export default adminLoginController;