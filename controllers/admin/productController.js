import multer from 'multer';
import _ from 'underscore';
import { attributeSetController, categoryController, subcategoryController } from '../../controllers';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import { ProductSchema } from '../../schema';
import {
    idValidatorSchema,
    createValidatorSchema,
    updateValidatorSchema,
    idsValidatorSchema,
} from '../../validators/admin/productValidator';
import { commonHelper } from '../../helper';

let productDir = "products";
let productDirPath = `./uploads/${productDir}/`;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        commonHelper.createDir(productDirPath + req.uuid);
        cb(null, productDirPath + req.uuid);
    },
    filename: async(req, file, cb) => {
        let uniqueFilename = await commonHelper.uniqueFilename(file);
        cb(null, uniqueFilename);
    },
});
let handleMultipartData = multer({
    storage,
    limits: { fileSize: 1000000 * 5 },
    fileFilter: (req, file, cb) => {
        if (file) {
            if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) { //Accept images only
                req.fileValidationError = 'Only image files are allowed!';
                return cb(null, false);
            }
        }
        cb(null, true);
    }
}).array('images');

const productController = {
    async index(req, res, next) {
        let documents;
        try {
            documents = await ProductSchema.find();
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async all(req, res, next) {
        let documents;
        try {
            documents = await ProductSchema.find();
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async create(req, res, next) {
        try {
            req.uuid = commonHelper.getUniqueUUID();
            handleMultipartData(req, res, async(err) => { //Multipart form data
                if (!req.files || req.files.length == 0) return next(CustomErrorHandler.serverError("Please select product image(s)!"));
                if (req.fileValidationError) return next(CustomErrorHandler.serverError(req.fileValidationError));
                if (err instanceof multer.MulterError) return next(CustomErrorHandler.serverError(err.message));
                if (err) return next(CustomErrorHandler.serverError(err.message));

                req.body.allAttributesInfo = commonHelper.parseString(req.body.allAttributesInfo, "object");
                req.body.categories = commonHelper.parseString(req.body.categories);
                req.body.subcategories = commonHelper.parseString(req.body.subcategories);

                const { error } = createValidatorSchema.validate(req.body);
                if (error) {
                    if (req.files) await commonHelper.deleteFiles(req.files);
                    return next(error);
                }

                let attributeSetId = req.body.attributeSet;
                let attributeSet = await attributeSetController.fecthById(attributeSetId);
                if (_.isEmpty(attributeSet)) {
                    if (req.files) await commonHelper.deleteFiles(req.files);
                    return next(CustomErrorHandler.recordNotFound("Attribute set not found!"));
                }

                let { allAttributesInfo } = req.body;
                let isSameKeys = true;
                attributeSet.attributes.some(attribute => {
                    if (allAttributesInfo.hasOwnProperty(attribute.keyName)) {
                        if (!attribute.values.includes(allAttributesInfo.ocassion)) isSameKeys = false;
                    } else isSameKeys = false;
                    if (!isSameKeys) return true; //true means break loop
                });
                if (!isSameKeys) {
                    if (req.files) await commonHelper.deleteFiles(req.files);
                    return next(CustomErrorHandler.recordNotFound("Please enter all attribute(s) values!"));
                }

                let isRecordsExist = false;
                let { categories } = req.body;
                categories = _.uniq(categories);
                isRecordsExist = await categoryController.isRecordsExist(categories);
                if (!isRecordsExist) {
                    if (req.files) await commonHelper.deleteFiles(req.files);
                    return next(CustomErrorHandler.recordNotFound("Invalid categories!"));
                }

                let { subcategories } = req.body;
                subcategories = _.uniq(subcategories);
                isRecordsExist = await subcategoryController.isRecordsExist(subcategories);
                if (!isRecordsExist) {
                    if (req.files) await commonHelper.deleteFiles(req.files);
                    return next(CustomErrorHandler.recordNotFound("Invalid subcategories!"));
                }

                let { sku } = req.body;
                let isRecordExistBySku = await this.isRecordExistBySku(sku);
                if (isRecordExistBySku) {
                    if (req.files) await commonHelper.deleteFiles(req.files);
                    return next(CustomErrorHandler.recordNotFound("SKU(product code) is alredy exist!"));
                }

                let images = (req.files) ? req.files.map(file => commonHelper.convertFilePathSlashes(file.path)) : [];

                let { price, assortedPrice, singlePrice } = req.body;
                if (assortedPrice > price) {
                    if (req.files) await commonHelper.deleteFiles(req.files);
                    return next(CustomErrorHandler.recordNotFound("B2B price must be greater or equal to B2B+Semi B2B(assorted) price!"));
                }
                if (singlePrice > assortedPrice) {
                    if (req.files) await commonHelper.deleteFiles(req.files);
                    return next(CustomErrorHandler.recordNotFound("B2B+Semi B2B(assorted) price must be greater or equal to B2C price!"));
                }

                let document;
                try {
                    let { name, isCatalog, quantity, description, description2, metaTitle, metaKeyword, metaDescription } = req.body;
                    document = await ProductSchema.create({
                        attributeSetId,
                        allAttributesInfo,
                        categories,
                        subcategories,
                        sku,
                        name,
                        images,
                        isCatalog,
                        price,
                        assortedPrice,
                        singlePrice,
                        quantity,
                        description,
                        description2,
                        metaTitle,
                        metaKeyword,
                        metaDescription
                    });
                } catch (err) {
                    return next(err);
                }
                res.json(document);
            });
        } catch (err) {
            return next(err);
        }
    },
    async isRecordExistBySku(sku) {
        let totalDocuments = 0;
        try {
            totalDocuments = await ProductSchema.countDocuments({ sku });
        } catch (err) {
            return false;
        }
        return (totalDocuments > 0) ? true : false;
    },
    async isRecordExist(attributeId) {
        let totalDocuments = 0;
        try {
            const { error } = idValidatorSchema.validate({ id: attributeId });
            if (error) return false;

            totalDocuments = await ProductSchema.countDocuments({ _id: attributeId });
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
                document = await ProductSchema.findById(attributeId);
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
            let attribute = await ProductSchema.findById(attributeId);
            if (!attribute) return next(CustomErrorHandler.recordNotFound("Attribute not found!"));

            let document;
            try {
                const id = { _id: attributeId };
                let { name, values } = req.body;

                let oldValues = commonHelper.convertArrayOfobjectIdsToStringArray(attribute.values);
                values = _.uniq([...oldValues, ...values]);
                const updateSet = {
                    name,
                    values
                };
                document = await ProductSchema.findOneAndUpdate(id, updateSet, { new: true });
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
            const document = await ProductSchema.findOneAndDelete({ _id: attributeId }).lean();
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
                await ProductSchema.findOneAndDelete({ _id: attributeId });
            }));
            return res.json({ message: "Data deleted successful!" });
        } catch (err) {
            return next(err);
        }
    },
};

export default productController;