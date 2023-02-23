import _ from 'underscore';
import moment from 'moment/moment';
import { UserSchema } from './../schema';
import { commonHelper, systemSettingsHelper, emailHelper } from '../helper';

const User = {
    async isUserExist(userId) {
        let totalDocs = await new Promise((resolve, reject) => {
            UserSchema.countDocuments({ _id: userId }, (err, count) => {
                if (err) return reject(err);
                resolve(count);
            });
        });
        return (totalDocs > 0) ? true : false;
    },
    async isEmailExist(email) {
        let totalDocs = await new Promise((resolve, reject) => {
            UserSchema.countDocuments({ email }, (err, count) => {
                if (err) return reject(err);
                resolve(count);
            });
        });
        return (totalDocs > 0) ? true : false;
    },
    async isUsernameExist(username) {
        let totalDocs = await new Promise((resolve, reject) => {
            UserSchema.countDocuments({ username }, (err, count) => {
                if (err) return reject(err);
                resolve(count);
            });
        });
        return (totalDocs > 0) ? true : false;
    },
    async isPhoneNumberExist(phone) {
        let totalDocs = await new Promise((resolve, reject) => {
            UserSchema.countDocuments({ phone }, (err, count) => {
                if (err) return reject(err);
                resolve(count);
            });
        });
        return (totalDocs > 0) ? true : false;
    },
    async fetchByEmail(email) {
        let user = await new Promise((resolve, reject) => {
            UserSchema.findOne({ email }, { password: 0 }, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        if (user) {
            user = await commonHelper.nullToEmptyString(user);
            user.userId = user._id;
        } else {
            user = {};
        }
        return user;
    },
    async fetchById(userId, props = []) {
        let noProps = { password: 0 };
        noProps = _.isEmpty(props) ? noProps : _.omit(noProps, props);
        let user = await new Promise((resolve, reject) => {
            UserSchema.findById(userId, noProps, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        if (user) {
            user = await commonHelper.nullToEmptyString(user);
            user.userId = user._id;
        } else {
            user = {};
        }
        return user;
    },
    async fetchByParams(params) {
        let user = await new Promise((resolve, reject) => {
            UserSchema.findOne(params, { password: 0 }, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        if (user) {
            user = await commonHelper.nullToEmptyString(user);
            user.userId = user._id;
        } else {
            user = {};
        }
        return user;
    },
    async fetch(username, action = "email") {
        let user = await new Promise((resolve, reject) => {
            let fields = {
                email: username,
                ...(action === "both" && { username })
            };
            UserSchema.findOne(fields, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        if (user) {
            user = await commonHelper.nullToEmptyString(user);
            user.userId = user._id;
        } else {
            user = {};
        }
        return user;
    },
    async socialAuth(fields) {
        let user = await new Promise((resolve, reject) => {
            UserSchema.findOne(fields, { _id: 1, email: 1, fullname: 1 }, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        if (user) {
            user = await commonHelper.nullToEmptyString(user);
            user.userId = user._id;
        } else {
            user = {};
        }
        return user;
    },
    async updateUser(userId, updateSet) {
        try {
            await UserSchema.updateOne({ _id: userId }, updateSet);
            return true;
        } catch (err) {
            return err;
        }
    },
    createSocial({ loginFrom, socialAuthId, fullname, email }) {
        return new Promise(async(resolve, reject) => {
            const user = new UserSchema({ loginFrom, socialAuthId, email, fullname, status: true });
            await user.save((err, result) => {
                if (err) return reject(err);
                const userId = result ? result._id : null;
                resolve(userId);
            });
        });
    },
    async create(payload) {
        const isGenderField = systemSettingsHelper.isGenderField();
        const isDobField = systemSettingsHelper.isDobField();
        const isUsernameField = systemSettingsHelper.isUsernameField();
        const isPhoneField = systemSettingsHelper.isPhoneField();

        let gender = "";
        if (isGenderField) {
            gender = payload.gender;
            gender = gender.toLowerCase();
        };

        let dob = "";
        if (isDobField) {
            dob = payload.dob;
            dob = moment(dob, 'YYYY-MM-DD').format("YYYY-MM-DD");
        };

        let username = (isUsernameField) ? payload.username : "";

        let phoneCountryCode = "";
        let phoneNumber = "";
        let phone = "";
        if (isPhoneField) {
            phoneCountryCode = payload.phoneCountryCode;
            phoneNumber = payload.phoneNumber;
            phone = payload.phone;
        }

        let status = systemSettingsHelper.isAutoActiveNewUserAccount();

        let { fullname, email, password } = payload;
        return new Promise(async(resolve, reject) => {
            const user = new UserSchema({ fullname, email, password, gender, dob, username, phoneCountryCode, phoneNumber, phone, status });
            await user.save((err, result) => {
                if (err) return reject(err);
                const userId = result ? result._id : null;
                resolve(userId);
            });
        });
    },
    async sendAccountVerificationEmail(payload) {
        try {
            const { userId, email } = payload;
            payload.link = `http://localhost:3000/users/verify/${userId}/${email}`;
            payload.systemName = systemSettingsHelper.CMSDATA("SYSTEM_NAME");
            payload.subject = `Verify your email to finish signing up for ${payload.systemName}`;
            payload.templateFile = "verifyAccountEmail";
            await emailHelper.sendEmail(payload);
            return true;
        } catch (err) {
            return false;
        }
    },
    async setAccountStatus({ userId, status }) {
        try {
            const updateSet = { status };
            await UserSchema.updateOne({ _id: userId }, updateSet);
            return true;
        } catch (err) {
            return err;
        }
    },
    async sendWelcomeEmail(payload) {
        try {
            const { fullname } = payload;
            payload.systemName = systemSettingsHelper.CMSDATA("SYSTEM_NAME");
            payload.subject = `${payload.systemName}: Welcome ${fullname}!`;
            payload.templateFile = "welcomeEmail";
            await emailHelper.sendEmail(payload);
            return true;
        } catch (err) {
            return false;
        }
    },
    async saveProfileInfo(payload) {
        let { userId, fullname, email } = payload;
        let updateSet = {
            fullname,
            email
        }

        const isGenderField = systemSettingsHelper.isGenderField();
        const isDobField = systemSettingsHelper.isDobField();
        const isUsernameField = systemSettingsHelper.isUsernameField();
        const isPhoneField = systemSettingsHelper.isPhoneField();

        if (isGenderField) {
            updateSet.gender = payload.gender.toLowerCase();
        }
        if (isDobField) {
            updateSet.dob = moment(payload.dob, 'YYYY-MM-DD').format("YYYY-MM-DD");
        }
        if (isUsernameField) {
            updateSet.username = payload.username;
        }
        if (isPhoneField) {
            updateSet.phoneCountryCode = payload.phoneCountryCode;
            updateSet.phoneNumber = payload.phoneNumber;
            updateSet.phone = payload.phone;
        }
        try {
            await UserSchema.updateOne({ _id: userId }, updateSet);
            return true;
        } catch (err) {
            return err;
        }
    },
    async getPassword(userId) {
        let user = await new Promise((resolve, reject) => {
            UserSchema.findOne({ _id: userId }, { password: 1 }, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        user = (user) ? await commonHelper.nullToEmptyString(user) : {};
        return user;
    },
    async setNewPassword(userId, password) {
        try {
            const updateSet = { password };
            await UserSchema.updateOne({ _id: userId }, updateSet);
            return true;
        } catch (err) {
            return err;
        }
    },
}
export default User;