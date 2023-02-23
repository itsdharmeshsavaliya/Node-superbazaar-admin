import CustomErrorHandler from '../../services/CustomErrorHandler';
import { AttributeSetSchema } from '../../schema';
import {
    idValidatorSchema,
    createValidatorSchema,
    updateValidatorSchema,
    idsValidatorSchema,
} from '../../validators/admin/attributeSetValidator';
import { commonHelper } from '../../helper';
import _ from 'underscore';

const attributeSetController = {
    async index(req, res, next) {
        let documents;
        try {
            documents = await AttributeSetSchema.find();
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
                let { name, attributes } = req.body;
                attributes = _.uniq(attributes);
                document = await AttributeSetSchema.create({
                    name,
                    attributes
                });
            } catch (err) {
                return next(err);
            }
            res.json(document);
        } catch (err) {
            return next(err);
        }
    },
    async isRecordExist(attributeSetId) {
        let totalDocuments = 0;
        try {
            totalDocuments = await AttributeSetSchema.countDocuments({ _id: attributeSetId });
        } catch (err) {
            return false;
        }
        return (totalDocuments > 0) ? true : false;
    },
    async fecthById(attributeSetId) {
        let document;
        try {
            document = await AttributeSetSchema.findById(attributeSetId).populate('attributes');
            document = commonHelper.nullToObject(document);
        } catch (err) {
            document = {};
        }
        return document;
    },
    async fetch(req, res, next) {
        try {
            const { error } = idValidatorSchema.validate(req.params);
            if (error) return next(error);

            const attributeSetId = req.params.id;
            let document;
            try {
                document = await AttributeSetSchema.findById(attributeSetId).populate('attributes');
                document = commonHelper.nullToObject(document);
            } catch (err) {
                console.log(err);
                return next(CustomErrorHandler.serverError());
            }
            return res.json(document);
        } catch (err) {
            console.log(err);
            return next(CustomErrorHandler.serverError());
        }
    },
    async update(req, res, next) {
        try {
            const { error } = updateValidatorSchema.validate({...req.body, ...req.params });
            if (error) return next(error);

            const attributeSetId = req.params.id;
            let attributeSet = await AttributeSetSchema.findById(attributeSetId);
            if (!attributeSet) return next(CustomErrorHandler.recordNotFound("Attribute set not found!"));

            let document;
            try {
                const id = { _id: attributeSetId };
                let { name, attributes } = req.body;

                let oldAttributes = commonHelper.convertArrayOfobjectIdsToStringArray(attributeSet.attributes);
                attributes = _.uniq([...oldAttributes, ...attributes]);
                const updateSet = {
                    name,
                    attributes
                };
                document = await AttributeSetSchema.findOneAndUpdate(id, updateSet, { new: true });
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

            const attributeSetId = req.params.id;
            const document = await AttributeSetSchema.findOneAndDelete({ _id: attributeSetId }).lean();
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
            await Promise.all(ids.map(async attributeSetId => {
                await AttributeSetSchema.findOneAndDelete({ _id: attributeSetId });
            }));
            return res.json({ message: "Data deleted successful!" });
        } catch (err) {
            return next(err);
        }
    },
};

export default attributeSetController;