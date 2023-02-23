import {
    JWT_SECRET,
    JWT_EXPIRES_IN,
    REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN,
} from '../config';
import jwt from 'jsonwebtoken';

class JwtService {
    static sign(payload, tokenType = "access") {
        if (tokenType === "access")
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        else //refresh
            return jwt.sign(payload, REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
    }
    static verify(token, tokenType = "access") {
        if (tokenType === "access")
            return jwt.verify(token, JWT_SECRET);
        else //refresh
            return jwt.verify(token, REFRESH_SECRET);
    }
}
export default JwtService;