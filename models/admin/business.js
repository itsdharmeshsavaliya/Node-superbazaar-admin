import { BusinessSchema } from '../../schema';
import { commonHelper } from '../../helper';

const Business = {
    async list() {
        let documents = await new Promise((resolve, reject) => {
            BusinessSchema.find((err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
        documents = (documents) ? await commonHelper.nullToEmptyString(documents) : [];
        return documents;
    },
    async create() {
        return new Promise((resolve, reject) => {
            BusinessSchema.insertMany([
                { name: 'B2B1' },
                { name: 'B2B + B2C1' },
                { name: 'B2B + Semi B2B(Assorted)1' },
                { name: 'B2B + Semi B2B(Assorted) + B2C1' },
                { name: 'B2C1' }
            ], (err, result) => {
                if (err) return reject(err);
                resolve(result); //insertMany returns array of all newly added documents from collection
            });
        });
    },
    async isRecordExist(id) {
        let totalDocs = await new Promise((resolve, reject) => {
            BusinessSchema.countDocuments({ _id: id }, (err, count) => {
                if (err) return reject(err);
                resolve(count);
            });
        });
        return (totalDocs > 0) ? true : false;
    },
    async isRecordsExist(ids) {
        if (!ids) return false;

        let totalIds = ids.length;
        if (totalIds === 0) return false;

        let totalDocs = await new Promise((resolve, reject) => {
            BusinessSchema.countDocuments({ _id: { $in: ids } }, (err, count) => {
                if (err) return reject(err);
                resolve(count);
            });
        });
        return (totalDocs === totalIds) ? true : false;
    },
    async fetchIds() {
        return new Promise((resolve, reject) => {
            BusinessSchema.find({}, { _id: 1 }, (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    },
}
export default Business;