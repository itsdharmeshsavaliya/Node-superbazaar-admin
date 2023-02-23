import _ from 'underscore';
import multer from 'multer';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import {
    Category,
    Menu
} from '../../models';
import {
    categoryValidatorSchema,
    categoryIdValidatorSchema,
    categoryIdsValidatorSchema,
    categoryStatusValidatorSchema
} from '../../validators';
import {
    commonHelper,
    validate
} from '../../helper';

let categoryDir = "categories";
let categoryDirPath = `./uploads/${categoryDir}`;
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, categoryDirPath),
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
}).single('image');

const categoryController = {
    async all(req, res, next) {
        let documents = [];
        try {
            documents = await Category.list();
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },
    async create(req, res, next) {
        try {
            handleMultipartData(req, res, async(err) => { //Multipart form data 
                if (req.fileValidationError) return next(CustomErrorHandler.serverError(req.fileValidationError));
                if (err instanceof multer.MulterError) return next(CustomErrorHandler.serverError(err.message));
                if (err) return next(CustomErrorHandler.serverError(err.message));

                try {
                    req.body.megaMenuFilters = commonHelper.parseString(req.body.megaMenuFilters);
                    req.body = await validate(categoryValidatorSchema, req.body);

                    const { menu } = req.body;
                    const menuData = await Menu.isRecordExist(menu);
                    if (!menuData) {
                        if (req.file) await commonHelper.deleteFile(`${req.file.path}`);
                        return next(CustomErrorHandler.recordNotFound("Menu not found!"));
                    }

                    const { name, description, megaMenuFilters, metaTitle, metaKeyword, metaDescription, status } = req.body;
                    let document = await Category.create({
                        name,
                        ...(req.file && { image: commonHelper.convertFilePathSlashes(req.file.path) }),
                        description,
                        menu: { _id: menu },
                        ...(menu == "62dfd89c17b20e0d78f24ff4" && { megaMenuFilters }),
                        metaTitle,
                        metaKeyword,
                        metaDescription,
                        status
                    });
                    res.json(document);
                } catch (err) {
                    if (req.file) await commonHelper.deleteFile(`${req.file.path}`);
                    return next(err);
                }
            });
        } catch (err) {
            return next(err);
        }
    },
    async fetch(req, res, next) {
        try {
            req.params = await validate(categoryIdValidatorSchema, req.params);
            let document = await Category.fetchById(req.params.id, true);
            console.log(document);
            if (_.isEmpty(document)) return next(CustomErrorHandler.recordNotFound("Category not found!"));

            return res.json(document);
        } catch (err) {
            return next(err);
        }
    },
    async update(req, res, next) {
        try {
            req.params = await validate(categoryIdValidatorSchema, req.params);
            const categoryId = req.params.id;
            let category = await Category.fetchById(categoryId);
            if (_.isEmpty(category)) return next(CustomErrorHandler.recordNotFound("Category not found!"));

            handleMultipartData(req, res, async(err) => {
                if (req.fileValidationError) return next(CustomErrorHandler.serverError(req.fileValidationError));
                if (err instanceof multer.MulterError) return next(CustomErrorHandler.serverError(err.message));
                if (err) return next(CustomErrorHandler.serverError(err.message));

                try {
                    req.body.megaMenuFilters = commonHelper.parseString(req.body.megaMenuFilters);
                    req.body = await validate(categoryValidatorSchema, req.body);

                    const { menu } = req.body;
                    const menuData = await Menu.isRecordExist(menu);
                    if (!menuData) {
                        if (req.file) await commonHelper.deleteFile(`${req.file.path}`);
                        return next(CustomErrorHandler.recordNotFound("Menu not found!"));
                    }

                    let document;
                    try {
                        let { name, description, metaTitle, metaKeyword, metaDescription, status } = req.body;

                        let megaMenuFilters = [];
                        if (menu == "62dfd89c17b20e0d78f24ff4") { //Mega Menu Filter
                            let oldMegaMenuFilters = commonHelper.convertArrayOfobjectIdsToStringArray(category.megaMenuFilters);
                            megaMenuFilters = req.body.megaMenuFilters;
                            megaMenuFilters = _.uniq([...oldMegaMenuFilters, ...megaMenuFilters]);
                        }

                        const updateSet = {
                            name,
                            ...(req.file && { image: commonHelper.convertFilePathSlashes(req.file.path) }),
                            description,
                            menu: { _id: menu },
                            megaMenuFilters,
                            metaTitle,
                            metaKeyword,
                            metaDescription,
                            status
                        };
                        document = await Category.update(categoryId, updateSet);
                        if (!document) {
                            if (req.file) await commonHelper.deleteFile(`${req.file.path}`);
                            return next(CustomErrorHandler.somethingWrong());
                        }
                        res.json(document);
                    } catch (err) {
                        if (req.file) await commonHelper.deleteFile(`${req.file.path}`);
                        return next(err);
                    }
                } catch (err) {
                    if (req.file) await commonHelper.deleteFile(`${req.file.path}`);
                    return next(err);
                }
            });
        } catch (err) {
            return next(err);
        }
    },
    async changeStatus(req, res, next) {
        try {
            req.body = await validate(categoryStatusValidatorSchema, req.body);

            const { ids, status } = req.body;
            await Promise.all(ids.map(async categoryId => {
                await Category.update(categoryId, { status });
            }));
            return res.json({ message: "Data saved successful" });
        } catch (err) {
            return next(err);
        }
    },
    async remove(req, res, next) {
        try {
            req.params = await validate(categoryIdValidatorSchema, req.params);

            const document = await Category.delete(req.params.id);
            if (!document) return next(CustomErrorHandler.somethingWrong());

            if (document.image) await commonHelper.deleteFile(document.image);
            return res.json({ message: "Data deleted successful" });
        } catch (err) {
            return next(err);
        }
    },
    async removeSelected(req, res, next) {
        try {
            req.body = await validate(categoryIdsValidatorSchema, req.body);

            const { ids } = req.body;
            let document;
            await Promise.all(ids.map(async categoryId => {
                document = await Category.delete(categoryId);
                if (document) {
                    if (document.image) await commonHelper.deleteFile(document.image);
                }
            }));
            return res.json({ message: "Data deleted successful!" });
        } catch (err) {
            return next(err);
        }
    },
};
export default categoryController;