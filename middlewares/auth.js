import CustomErrorHandler from '../services/CustomErrorHandler';
import JwtService from '../services/JwtService';
import { SAVE_JWT_TOKEN_IN_COOKIE, JWT_COOKIE_NAME } from '../config';

const auth = async(req, res, next) => {
    let token;
    try {
        if (SAVE_JWT_TOKEN_IN_COOKIE) {
            token = req.cookies[JWT_COOKIE_NAME];
        }
        if (!token) { //if user not accept cookie then use Bearer token method
            let authHeader = req.headers.authorization;
            if (!authHeader) return next(CustomErrorHandler.unAuthorized());
            token = authHeader.split(' ')[1];
        }
        if (!token) return next(CustomErrorHandler.unAuthorized());

        const { userId, role } = await JwtService.verify(token);
        req.user = { userId, role };
        next();
    } catch (err) {
        return next(CustomErrorHandler.unAuthorized());
    }
};
export default auth;