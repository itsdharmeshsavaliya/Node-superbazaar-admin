import _ from 'underscore';
import { Admin } from '../models';
import CustomErrorHandler from '../services/CustomErrorHandler';
import JwtService from '../services/JwtService';
import { JWT_ADMIN_COOKIE_NAME } from '../config';

const admin = async(req, res, next) => {
    try {
        let token = req.cookies[JWT_ADMIN_COOKIE_NAME];
        if (!token) {
            let authHeader = req.headers.authorization;
            if (!authHeader) return next(CustomErrorHandler.unAuthorized());
            token = authHeader.split(' ')[1];
        }
        if (!token) return next(CustomErrorHandler.unAuthorized());
        const { userId } = await JwtService.verify(token);

        let { path } = req.route;
        let getProps = [];
        if (path === "/admin/changepassword") getProps.push('password');
        const admin = await Admin.fetchById(userId, getProps);
        if (_.isEmpty(admin)) return next(CustomErrorHandler.unAuthorized());
        if (!admin.status) return next(CustomErrorHandler.wrongCredentials("Your account is deactivated, please contact to administrator!"));

        req.admin = admin;
        next();
    } catch (err) {
        return next(err);
    }
};
export default admin;