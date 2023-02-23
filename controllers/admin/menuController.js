import CustomErrorHandler from '../../services/CustomErrorHandler';
import { validate } from '../../helper';
import { Menu } from '../../models';
import { menuValidatorSchema } from '../../validators';

const menuController = {
    async index(req, res, next) {
        let documents;
        try {
            documents = await Menu.list();
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async create(req, res, next) {
        try {
            req.body = await validate(menuValidatorSchema, req.body);

            let document = await Menu.create(req.body);
            res.json(document);
        } catch (err) {
            if (err.name === 'MongoError' && err.code === 11000) return next(CustomErrorHandler.serverError(`Record is already inserted with value '${err.keyValue.type}'`));
            return next(err);
        }
    },
};

export default menuController;