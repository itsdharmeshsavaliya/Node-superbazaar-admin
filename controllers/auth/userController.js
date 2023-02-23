import _ from 'underscore';
import bcrypt from 'bcrypt';
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { SALT_FACTOR } from '../../config';
import { User } from '../../models';
import {
    verifyAccountValidatorSchema,
    editProfileValidatorSchema,
    changePasswordValidatorSchema
} from '../../validators';
import {
    commonHelper,
    systemSettingsHelper,
    validate,
} from '../../helper';

const userController = {
    async me(req, res, next) {
        try {
            let user = await User.fetchById(req.user.userId);
            if (_.isEmpty(user)) return next(CustomErrorHandler.userNotFound());
            res.json(user);
        } catch (err) {
            return next(err);
        }
    },
    async verifyAccount(req, res, next) {
        try {
            req.body = await validate(verifyAccountValidatorSchema, req.body);

            const { userId, email } = req.body;
            let user = await User.fetchByParams({ _id: userId, email });
            if (_.isEmpty(user)) return next(CustomErrorHandler.userNotFound());

            if (!user.status) {
                await User.setAccountStatus({ userId, status: true });
                await User.sendWelcomeEmail({ userId, email, fullname: user.fullname });
            }
            res.json({ message: "Your account verified successful." });
        } catch (err) {
            return next(err);
        }
    },
    async save(req, res, next) {
        try {
            const isPhoneField = systemSettingsHelper.isPhoneField();
            if (isPhoneField) req.body.phone = req.body.phoneCountryCode + req.body.phoneNumber;

            let { user } = req;
            const { loginFrom } = user;
            req.body.loginFrom = loginFrom;
            req.body = await validate(editProfileValidatorSchema, req.body);

            let { email } = req.body;
            email = (email) ? email : "";
            user.email = (user.email) ? user.email : "";

            let exist = true;
            if (loginFrom === "manually") {
                exist = (email === user.email) ? false : await User.isEmailExist(email);
                if (exist) return next(CustomErrorHandler.alreadyExist('Email already exist!'));
            } else { //social
                if (user.email !== email) { //Social auth user try to change his/her email with any Add new/edit/empty, so don't accept this request
                    const socialAccountType = commonHelper.ucfirst(loginFrom);
                    return next(CustomErrorHandler.somethingWrong(`You are authorized from ${socialAccountType}, so you can not change your email!`));
                }
            }

            if (loginFrom === "manually") {
                const isUsernameField = systemSettingsHelper.isUsernameField();
                if (isUsernameField) {
                    let { username } = req.body;
                    user.username = (user.username) ? user.username : "";
                    username = (username) ? username : "";
                    exist = (username === user.username) ? false : await User.isUsernameExist(username);
                    if (exist) return next(CustomErrorHandler.alreadyExist('Username already exist!'));
                }
            }

            if (isPhoneField) {
                let { phone } = req.body;
                user.phone = (user.phone) ? user.phone : "";
                phone = (phone) ? phone : "";
                exist = (phone === user.phone) ? false : await User.isPhoneNumberExist(phone);
                if (exist) return next(CustomErrorHandler.alreadyExist('Phone number already exist!'));
            }

            const { userId } = user;
            const isSaved = await User.saveProfileInfo({
                userId,
                ...req.body,
                loginFrom
            });
            if (isSaved)
                return res.json({ message: "Data saved successful." });
            else
                return next(CustomErrorHandler.somethingWrong());
        } catch (err) {
            return next(err);
        }
    },
    async changePassword(req, res, next) {
        try {
            req.body = await validate(changePasswordValidatorSchema, req.body);

            const { user } = req;
            const { loginFrom } = user;
            if (loginFrom !== "manually") { //Social
                let socialAccountType = commonHelper.ucfirst(loginFrom);
                return next(CustomErrorHandler.alreadyExist(`We have recognised that you have already registered using ${socialAccountType}, You can't access this functionality!`));
            }

            let { currentPassword, newPassword } = req.body;
            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) return next(CustomErrorHandler.wrongCredentials("Invalid current Password"));

            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            const { userId } = user;
            await User.setNewPassword(userId, hashedPassword);
            res.json({ message: "Password changed successful." });
        } catch (err) {
            return next(err);
        }
    }
};

export default userController;