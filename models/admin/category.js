import { APP_URL } from '../../config';
import { CategorySchema } from '../../schema';
import { commonHelper } from '../../helper';

const Category = {
    async list() {
        try {
            let documents = await CategorySchema.aggregate([{
                $lookup: {
                    "from": "subcategories",
                    "localField": "_id",
                    "foreignField": "category",
                    "as": "subcategories"
                },
            }, {
                $lookup: {
                    from: "menus",
                    localField: "menu",
                    foreignField: "_id",
                    as: "menu"
                },
            }, {
                $unwind: "$menu"
            }]).exec();
            documents = (documents) ? await commonHelper.nullToEmptyString(documents) : [];
            if (documents) {
                await Promise.all(documents.map(document => {
                    document.image = (document.image) ? `${APP_URL}${document.image}` : "";
                }));
            }
            return documents;
        } catch (err) {
            return err;
        }
    },
    async isRecordExist(id) {
        try {
            let totalDocuments = await CategorySchema.countDocuments({ _id: id });
            return (totalDocuments > 0) ? true : false;
        } catch (err) {
            return err;
        }
    },
    async isRecordsExist(ids) {
        if (!ids) return false;

        let totalIds = ids.length;
        if (totalIds == 0) return false;

        let totalDocuments = 0;
        try {
            totalDocuments = await CategorySchema.countDocuments({ _id: { $in: ids } });
        } catch (err) {
            return err;
        }
        return (totalDocuments == totalIds) ? true : false;
    },
    async create(payload) {
        try {
            const data = new CategorySchema(payload);
            let document = await data.save();
            return document;
        } catch (err) {
            return err;
        }
    },
    async fetchById(id, needInfo = false) {
        try {
            let document;
            if (needInfo) {
                document = await CategorySchema.aggregate([
                    { $match: { _id: commonHelper.strIdToObjectId(id) } },
                    {
                        $lookup: {
                            "from": "subcategories",
                            "localField": "_id",
                            "foreignField": "category",
                            "as": "subcategories"
                        },
                    },
                    {
                        $lookup: {
                            from: "menus",
                            localField: "menu",
                            foreignField: "_id",
                            as: "menu"
                        },
                    },
                    {
                        $unwind: "$menu"
                    },
                ]).exec();
            } else {
                document = await CategorySchema.findById(id);
            }
            if (document) {
                document.image = (document.image) ? `${APP_URL}${document.image}` : "";
            } else {
                document = {};
            }
            return document;
        } catch (err) {
            return err;
        }
    },
    async update(id, payload) {
        try {
            let document = CategorySchema.findByIdAndUpdate(id, payload, { new: true });
            return document;
        } catch (err) {
            return err;
        }
    },
    async delete(id) {
        try {
            let document = await CategorySchema.findByIdAndDelete(id).lean();
            return document;
        } catch (err) {
            return err;
        }
    },
}
export default Category;