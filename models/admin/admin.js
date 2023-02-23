import _ from 'underscore';
import bcrypt from 'bcrypt';
import { SALT_FACTOR } from '../../config';
import { AdminSchema } from '../../schema';
import { commonHelper } from '../../helper';

const Admin = {
    async fetch(username) {
        try {
            let admin = await AdminSchema.findOne({ username });
            if (admin) {
                admin = await commonHelper.nullToEmptyString(admin);
                admin.adminId = admin._id;
            } else {
                admin = {};
            }
            return admin;
        } catch (err) {
            return err;
        }
    },
    async fetchById(adminId, props = []) {
        try {
            let noProps = { password: 0 };
            noProps = _.isEmpty(props) ? noProps : _.omit(noProps, props);
            let admin = await AdminSchema.findById(adminId, noProps);
            if (admin) {
                admin = await commonHelper.nullToEmptyString(admin);
                admin.adminId = admin._id;
            } else {
                admin = {};
            }
            return admin;
        } catch (err) {
            return err;
        }
    },
    async create() {
        try {
            let password = "admin@system";
            const salt = await bcrypt.genSalt(parseInt(SALT_FACTOR));
            const hashedPassword = await bcrypt.hash(password, salt);
            const admin = new AdminSchema({
                username: "admin",
                password: hashedPassword,
                status: true
            });
            let result = await admin.save();
            const adminId = result ? result._id : null;
            return adminId;
        } catch (err) {
            return err;
        }
    },
    async setNewPassword(adminId, password) {
        try {
            const updateSet = { password };
            await AdminSchema.updateOne({ _id: adminId }, updateSet);
            return true;
        } catch (err) {
            return err;
        }
    },
}
export default Admin;