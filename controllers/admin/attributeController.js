import CustomErrorHandler from '../../services/CustomErrorHandler';
import { AttributeSchema } from '../../schema';
import {
    idValidatorSchema,
    createValidatorSchema,
    updateValidatorSchema,
    idsValidatorSchema,
} from '../../validators/admin/attributeValidator';
import { commonHelper } from '../../helper';
import _ from 'underscore';

const attributeController = {
    async index(req, res, next) {
        let documents;
        try {
            documents = await AttributeSchema.find();
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async all(req, res, next) {
        let documents;
        try {
            documents = await AttributeSchema.find();
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async create(req, res, next) {
        try {
            const { error } = createValidatorSchema.validate(req.body);
            if (error) return next(error);

            let document;
            try {
                let { name, values } = req.body;
                let keyName = commonHelper.convertSpecialCharacters(name.toLowerCase());

                values = _.uniq(values);
                document = await AttributeSchema.create({
                    name,
                    keyName,
                    values
                });
            } catch (err) {
                return next(err);
            }
            res.json(document);
        } catch (err) {
            return next(err);
        }
    },
    async isRecordExist(attributeId) {
        let totalDocuments = 0;
        try {
            const { error } = idValidatorSchema.validate({ id: attributeId });
            if (error) return false;

            totalDocuments = await AttributeSchema.countDocuments({ _id: attributeId });
        } catch (err) {
            return false;
        }
        return (totalDocuments > 0) ? true : false;
    },
    async fetch(req, res, next) {
        try {
            const { error } = idValidatorSchema.validate(req.params);
            if (error) return next(error);

            const attributeId = req.params.id;
            let document;
            try {
                document = await AttributeSchema.findById(attributeId);
                document = commonHelper.nullToObject(document);
            } catch (err) {
                return next(CustomErrorHandler.serverError());
            }
            return res.json(document);
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
    },
    async update(req, res, next) {
        try {
            const { error } = updateValidatorSchema.validate({...req.body, ...req.params });
            if (error) return next(error);

            const attributeId = req.params.id;
            let attribute = await AttributeSchema.findById(attributeId);
            if (!attribute) return next(CustomErrorHandler.recordNotFound("Attribute not found!"));

            let document;
            try {
                const id = { _id: attributeId };
                let { name, values } = req.body;
                let keyName = commonHelper.convertSpecialCharacters(name.toLowerCase());

                let oldValues = commonHelper.convertArrayOfobjectIdsToStringArray(attribute.values);
                values = _.uniq([...oldValues, ...values]);
                const updateSet = {
                    name,
                    keyName,
                    values
                };
                document = await AttributeSchema.findOneAndUpdate(id, updateSet, { new: true });
            } catch (err) {
                return next(err);
            }
            res.json(document);
        } catch (err) {
            return next(err);
        }
    },
    async remove(req, res, next) {
        try {
            const { error } = idValidatorSchema.validate(req.params);
            if (error) return next(error);

            const attributeId = req.params.id;
            const document = await AttributeSchema.findOneAndDelete({ _id: attributeId }).lean();
            if (!document) return next(CustomErrorHandler.somethingWrong());
            return res.json({ message: "Data deleted successful" });
        } catch (err) {
            return next(err);
        }
    },
    async removeSelected(req, res, next) {
        try {
            const { error } = idsValidatorSchema.validate(req.body);
            if (error) return next(error);

            const { ids } = req.body;
            await Promise.all(ids.map(async attributeId => {
                await AttributeSchema.findOneAndDelete({ _id: attributeId });
            }));
            return res.json({ message: "Data deleted successful!" });
        } catch (err) {
            return next(err);
        }
    },
};

export default attributeController;