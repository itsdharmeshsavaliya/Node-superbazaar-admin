import { categoryController } from '../../controllers';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import { SubcategorySchema } from '../../schema';
import {
    categoryIdValidatorSchema,
    createValidatorSchema,
    idValidatorSchema,
    updateValidatorSchema,
    idsValidatorSchema,
    statusValidatorSchema
} from '../../validators/admin/subcategoryValidator';
import { commonHelper } from '../../helper';

const subcategoryController = {
    async index(req, res, next) {
        const { error } = categoryIdValidatorSchema.validate(req.params);
        if (error) return next(error);

        let documents;
        try {
            const categoryId = req.params.id;
            const categoryData = await categoryController.isRecordExist(categoryId);
            if (!categoryData) return next(CustomErrorHandler.recordNotFound("Category not found!"));

            documents = await SubcategorySchema.find({ category: categoryId });
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async create(req, res, next) {
        try {
            const { error } = createValidatorSchema.validate(req.body);
            if (error) return next(error);

            const categoryId = req.body.category;
            const categoryData = await categoryController.isRecordExist(categoryId);
            if (!categoryData) return next(CustomErrorHandler.recordNotFound("Category not found!"));

            let document;
            try {
                const { category, name, description, metaTitle, metaKeyword, metaDescription, status } = req.body;
                document = await SubcategorySchema.create({
                    category,
                    name,
                    description,
                    metaTitle,
                    metaKeyword,
                    metaDescription,
                    status
                });
            } catch (err) {
                return next(err);
            }
            res.json(document);
        } catch (err) {
            return next(err);
        }
    },
    async isRecordExist(subcategoryId) {
        let totalDocuments = 0;
        try {
            const { error } = idValidatorSchema.validate({ id: subcategoryId });
            if (error) return false;

            totalDocuments = await SubcategorySchema.countDocuments({ _id: subcategoryId });
        } catch (err) {
            return false;
        }
        return (totalDocuments > 0) ? true : false;
    },
    async isRecordsExist(ids) {
        if (!ids) return false;

        let totalIds = ids.length;
        if (totalIds == 0) return false;

        let totalDocuments = 0;
        try {
            totalDocuments = await SubcategorySchema.countDocuments({ _id: { $in: ids } });
        } catch (err) {
            return false;
        }
        return (totalDocuments == totalIds) ? true : false;
    },
    async fetch(req, res, next) {
        try {
            const { error } = idValidatorSchema.validate(req.params);
            if (error) return next(error);

            const subcategoryId = req.params.id;
            let document;
            try {
                document = await SubcategorySchema.findById(subcategoryId).populate('category', '_id name description');
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

            const subcategoryId = req.params.id;
            let subcategory = await SubcategorySchema.findById(subcategoryId);
            if (!subcategory) return next(CustomErrorHandler.recordNotFound("Subcategory not found!"));

            let document;
            try {
                let { name, description, metaTitle, metaKeyword, metaDescription, status } = req.body;
                const id = { _id: subcategoryId };
                const updateSet = {
                    name,
                    description,
                    metaTitle,
                    metaKeyword,
                    metaDescription,
                    status
                };
                document = await SubcategorySchema.findOneAndUpdate(id, updateSet, { new: true });
            } catch (err) {
                return next(err);
            }
            res.json(document);
        } catch (err) {
            return next(err);
        }
    },
    async changeStatus(req, res, next) {
        try {
            const { error } = statusValidatorSchema.validate(req.body);
            if (error) return next(error);

            const { ids, status } = req.body;
            await Promise.all(ids.map(async subcategoryId => {
                await SubcategorySchema.findByIdAndUpdate({ _id: subcategoryId }, { status });
            }));
            return res.json({ message: "Data saved successful" });
        } catch (err) {
            return next(err);
        }
    },
    async remove(req, res, next) {
        try {
            const { error } = idValidatorSchema.validate(req.params);
            if (error) return next(error);

            const subcategoryId = req.params.id;
            const document = await SubcategorySchema.findOneAndDelete({ _id: subcategoryId }).lean();
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
            await Promise.all(ids.map(async subcategoryId => {
                await SubcategorySchema.findOneAndDelete({ _id: subcategoryId });
            }));
            return res.json({ message: "Data deleted successful!" });
        } catch (err) {
            return next(err);
        }
    },
};

export default subcategoryController;