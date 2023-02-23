import { MenuSchema } from '../../schema';
import { commonHelper } from '../../helper';

const Menu = {
    async list() {
        try {
            let documents = await MenuSchema.find({});
            documents = (documents) ? await commonHelper.nullToEmptyString(documents) : [];
            return documents;
        } catch (err) {
            return err;
        }
    },
    async isRecordExist(id) {
        try {
            let totalDocuments = await MenuSchema.countDocuments({ _id: id });
            return (totalDocuments > 0) ? true : false;
        } catch (err) {
            return err;
        }
    },
    async create({ type }) {
        try {
            const data = new MenuSchema({ type });
            let document = await data.save();
            return document;
        } catch (err) {
            return err;
        }
    },
}
export default Menu;