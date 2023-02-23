import _ from 'underscore';
import { User } from '../models';
import CustomErrorHandler from '../services/CustomErrorHandler';

const user = async(req, res, next) => {
    try {
        let { path } = req.route;
        let getProps = [];
        if (path === "/changepassword") getProps.push('password');
        const user = await User.fetchById(req.user.userId, getProps);
        if (_.isEmpty(user)) return next(CustomErrorHandler.unAuthorized());
        if (!user.status) return next(CustomErrorHandler.wrongCredentials("Your account is disabled, if you are a new user than verify your email, Otherwise contact to administrator!"));
        if (user.role === 'user') {
            req.user = user; //If needed, Add only required parameter(s) object to req
            next();
        } else { //admin not allowed in user middleware
            return next(CustomErrorHandler.unAuthorized());
        }
    } catch (err) {
        return next(CustomErrorHandler.serverError(err.message));
    }
};
export default user;