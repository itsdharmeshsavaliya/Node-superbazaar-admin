import _ from 'underscore';
import bcrypt from 'bcrypt';
import CustomErrorHandler from "../../../services/CustomErrorHandler";
import { SALT_FACTOR } from '../../../config';
import { Admin } from '../../../models';
import {
    changePasswordValidatorSchema
} from '../../../validators';
import {
    validate,
} from '../../../helper';

const adminController = {
    async me(req, res, next) {
        try {
            let { admin } = req;
            res.json(admin);
        } catch (err) {
            return next(err);
        }
    },
    async changePassword(req, res, next) {
        try {
            req.body = await validate(changePasswordValidatorSchema, req.body);

            const { admin } = req;
            let { currentPassword, newPassword } = req.body;
            const match = await bcrypt.compare(currentPassword, admin.password);
            if (!match) return next(CustomErrorHandler.wrongCredentials("Invalid current Password"));

            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            const { adminId } = admin;
            await Admin.setNewPassword(adminId, hashedPassword);
            res.json({ message: "Password changed successful." });
        } catch (err) {
            return next(err);
        }
    }
};

export default adminController;