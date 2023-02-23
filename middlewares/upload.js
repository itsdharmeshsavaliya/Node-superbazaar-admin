import multer from 'multer';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "--" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if ((file.mimetype).includes('jpeg') || (file.mimetype).includes('png') || (file.mimetype).includes('jpg')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

let upload = multer({ storage: storage, fileFilter: fileFilter, });
let uploadMultiple = upload.fields([{ name: 'file1', maxCount: 10 }, { name: 'file2', maxCount: 10 }])

export default upload.single('ProfilePicture')