import CustomErrorHandler from '../../services/CustomErrorHandler';
import { Business } from '../../models';

const businessController = {
    async index(req, res, next) {
        let documents;
        try {
            documents = await Business.list();
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async create(req, res, next) {
        try {
            let data = await Business.create();
            return res.json(data);
        } catch (err) {
            if (err.name === 'MongoError' && err.code === 11000) return next(CustomErrorHandler.serverError(`Record is already inserted with value '${err.keyValue.type}'`));
            return next(err);
        }
    },
};

export default businessController;