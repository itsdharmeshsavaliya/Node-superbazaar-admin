import _ from 'underscore';
import bcrypt from 'bcrypt';
import JwtService from '../../services/JwtService';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import {
    SAVE_JWT_TOKEN_IN_COOKIE,
    JWT_COOKIE_NAME,
    SALT_FACTOR
} from '../../config';
import { commonHelper, systemSettingsHelper } from '../../helper';
import { User, RefreshToken } from '../../models';
import { registerValidatorSchema } from '../../validators';
import { validate } from '../../helper';

const registerController = {
    async register(req, res, next) {
        try {
            let isPhoneField = systemSettingsHelper.isPhoneField();
            if (isPhoneField) req.body.phone = req.body.phoneCountryCode + req.body.phoneNumber;

            req.body.loginFrom = "manually";
            req.body = await validate(registerValidatorSchema, req.body);

            const { email } = req.body;
            let authUser = await User.fetchByEmail(email);
            if (!_.isEmpty(authUser)) {
                if (authUser.loginFrom === "manually") {
                    return next(CustomErrorHandler.alreadyExist('Email already exist!'));
                } else { //Social
                    let socialAccountType = commonHelper.ucfirst(authUser.loginFrom);
                    return next(CustomErrorHandler.alreadyExist(`We have recognised that you have already registered using ${socialAccountType}, Please use social login to continue!`));
                }
            }

            let exist = true;
            const isUsernameField = systemSettingsHelper.isUsernameField();
            if (isUsernameField) {
                const { username } = req.body;
                exist = await User.isUsernameExist(username);
                if (exist) return next(CustomErrorHandler.alreadyExist('Username already exist!'))
            }

            isPhoneField = systemSettingsHelper.isPhoneField();
            if (isPhoneField) {
                const { phone } = req.body;
                exist = await User.isPhoneNumberExist(phone);
                if (exist) return next(CustomErrorHandler.alreadyExist('Phone number already exist!'));
            }

            let { password } = req.body;
            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(password, salt);
            req.body.password = hashedPassword;

            const userId = await User.create({...req.body });
            if (!userId) return next(CustomErrorHandler.somethingWrong());

            let user = await User.fetchById(userId);
            if (_.isEmpty(user)) return next(CustomErrorHandler.userNotFound());

            const { fullname, role } = user;
            if (user.status) {
                await User.sendWelcomeEmail({ email, fullname });

                user.accessToken = await JwtService.sign({ userId, role });
                user.refreshToken = await JwtService.sign({ userId, role }, "refresh");
                await RefreshToken.create({ userId, token: user.refreshToken, role });

                if (SAVE_JWT_TOKEN_IN_COOKIE) res.cookie(JWT_COOKIE_NAME, user.accessToken, commonHelper.getCookieOptions());

                return res.json(user);
            } else { //Need to send account verification email
                await User.sendAccountVerificationEmail({ userId, email, fullname });
                return res.send({ message: "Account created successful, Please check your mailbox and verify your email to continue!" })
            }
        } catch (err) {
            return next(err);
        }
    }
}
export default registerController;