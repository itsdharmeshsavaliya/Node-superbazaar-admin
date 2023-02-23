import {
    DEBUG_MODE,
    ERROR_IN_ARRAY
} from '../config';
import { ValidationError } from 'joi';
import CustomErrorHandler from '../services/CustomErrorHandler';

const displayErrorInArray = (ERROR_IN_ARRAY === 'true') ? true : false;
const debugMode = (DEBUG_MODE === 'true') ? true : false;

const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let data = {
        errors: (displayErrorInArray) ? ['Internal server error'] : 'Internal server error',
        ...(debugMode && { originalError: err.message })
    }

    if (err instanceof ValidationError) {
        statusCode = 422;
        data = {
            errors: (displayErrorInArray) ? err.details.map((obj) => obj.message) : err.message,
            ...(debugMode && { errorInfo: err })
        };
    }

    if (err instanceof CustomErrorHandler) {
        statusCode = err.status;
        data = {
            errors: (displayErrorInArray) ? [err.message] : err.message
        };
    }
    return res.status(statusCode).json(data);
}

export default errorHandler;