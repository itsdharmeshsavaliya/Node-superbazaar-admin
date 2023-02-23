import multer from 'multer';
import _ from 'underscore';
// import { attributeSetController, categoryController, subcategoryController } from '../../controllers';
import CustomErrorHandler from '../../services/CustomErrorHandler';
// import { ProductSchema } from '../../schema';
// import {
//     idValidatorSchema,
//     createValidatorSchema,
//     updateValidatorSchema,
//     idsValidatorSchema,
// } from '../../validators/admin/productValidator';
import { commonHelper } from '../../helper';

let sheetDir = "importcsv";
let sheetDirPath = `./uploads/${sheetDir}/`;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        commonHelper.createDir(sheetDirPath);
        cb(null, sheetDirPath);
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
        console.log(file)
        if (file) {
            if (!file.originalname.match(/\.(csv)$/)) { //Accept csv file only
                console.log("here");
                req.fileValidationError = 'Only csv file are allowed!';
                return cb(null, false);
            }
        }
        cb(null, true);
    }
}).single('importfile');

const productController = {
    async importsheet(req, res, next) {
        try {
            handleMultipartData(req, res, async(err) => { //Multipart form data
                console.log(req.files);
                // if (!req.file) return next(CustomErrorHandler.serverError("Please select product csv sheet!"));
                // if (req.fileValidationError) return next(CustomErrorHandler.serverError(req.fileValidationError));
                if (err instanceof multer.MulterError) return next(CustomErrorHandler.serverError(err.message));
                if (err) return next(CustomErrorHandler.serverError(err.message));

                try {
                    console.log(req.file);
                    return res.json({ message: "Data saved successful!" });
                } catch (err) {
                    return next(err);
                }
            });
        } catch (err) {
            return next(err);
        }
    }
};

export default productController;