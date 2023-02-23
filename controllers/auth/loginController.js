import _ from 'underscore';
import bcrypt from 'bcrypt';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';
import {
    SAVE_JWT_TOKEN_IN_COOKIE,
    JWT_COOKIE_NAME
} from '../../config';
import {
    commonHelper,
    systemSettingsHelper,
    validate
} from '../../helper';
import {
    User,
    RefreshToken
} from '../../models';
import {
    loginValidatorSchema,
    refreshTokenValidatorSchema
} from '../../validators';

const loginController = {
    async login(req, res, next) {
        try {
            if (SAVE_JWT_TOKEN_IN_COOKIE) { //Check if user already logged in?
                let token = req.cookies[JWT_COOKIE_NAME];
                if (token) return next(CustomErrorHandler.alreadyLoggedIn());
            }

            req.body = await validate(loginValidatorSchema, req.body);

            let { loginFrom, username, password } = req.body;
            let userId = null;
            let isNewUser = false;
            if (loginFrom === "manually") { // manually
                const isUsernameField = systemSettingsHelper.isUsernameField();
                const searchFromFields = (isUsernameField) ? "both" : "email";
                const user = await User.fetch(username, searchFromFields);
                if (_.isEmpty(user)) return next(CustomErrorHandler.wrongCredentials());

                if (user.loginFrom !== "manually") { //Social
                    let socialAccountType = commonHelper.ucfirst(user.loginFrom);
                    return next(CustomErrorHandler.alreadyExist(`We have recognised that you have already registered using ${socialAccountType}, Please use social login to continue!`));
                }

                const match = await bcrypt.compare(password, user.password);
                if (!match) return next(CustomErrorHandler.wrongCredentials());

                userId = user.userId;
            } else { //Social login
                let { socialAuthId, email, fullname } = req.body;
                const authUser = await User.socialAuth({ loginFrom, socialAuthId });
                if (!_.isEmpty(authUser)) {
                    //check requested email and already added user's email(if added) in single social auth id is same or not?
                    if (email) {
                        if (authUser.email) {
                            if (authUser.email !== email) {
                                let socialAccountType = commonHelper.ucfirst(loginFrom);
                                return next(CustomErrorHandler.alreadyExist(`Login failed! You have already registered with ${authUser.email} for ${socialAccountType} and now we detect new email ${email} for ${socialAccountType}!`));
                            }
                        } else {
                            // Save email if not added before, check email everytime and if found than save email
                            // Note: Never edit social login user's email in this system, Edit manually register user's email only
                            const exist = await User.isEmailExist(email);
                            if (exist) return next(CustomErrorHandler.alreadyExist(`Login failed! Your email (${email}) is already beed used!`));
                            await User.updateUser(authUser.userId, {
                                email,
                                ...(!authUser.fullname && { fullname })
                            });
                            isNewUser = true;
                        }
                    }
                    userId = authUser.userId;
                }
                if (!userId) { //user not exist, first time social login, so create new   
                    if (email) {
                        const exist = await User.isEmailExist(email);
                        if (exist) return next(CustomErrorHandler.alreadyExist('Email already exists, Please use your ID and Password to continue or Try resetting your password!'));
                    }
                    userId = await User.createSocial(req.body);
                    isNewUser = true;
                }
            }

            if (!userId) return next(CustomErrorHandler.somethingWrong());
            let user = await User.fetchById(userId);
            if (_.isEmpty(user)) return next(CustomErrorHandler.wrongCredentials());

            if (!user.status) return next(CustomErrorHandler.wrongCredentials("We have sent verification email at register time, Please verify your email to continue!"));

            const { fullname, email, role } = user;
            if (isNewUser && email) await User.sendWelcomeEmail({ email, fullname });

            user.accessToken = await JwtService.sign({ userId, role });
            user.refreshToken = await JwtService.sign({ userId, role }, "refresh");
            await RefreshToken.create({ userId, token: user.refreshToken, role });

            if (SAVE_JWT_TOKEN_IN_COOKIE) res.cookie(JWT_COOKIE_NAME, user.accessToken, commonHelper.getCookieOptions());

            return res.json(user);
        } catch (err) {
            return next(err);
        }
    },
    async logout(req, res, next) {
        try {
            req.body = await validate(refreshTokenValidatorSchema, req.body);

            const { refreshToken } = req.body;
            let refreshTokenInfo = await RefreshToken.fetchByParams({ userId: req.user.userId, token: refreshToken });
            if (_.isEmpty(refreshTokenInfo)) return next(CustomErrorHandler.unAuthorized('Invalid refresh token!'));

            await RefreshToken.delete({ token: refreshToken });
            if (SAVE_JWT_TOKEN_IN_COOKIE) res.clearCookie(JWT_COOKIE_NAME);

            res.json({ message: "Logged out successful" });
        } catch (err) {
            return next(CustomErrorHandler.somethingWrong());
        }

    }
};
export default loginController;