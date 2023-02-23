import { SettingsBusinessSchema } from '../../schema';
import { commonHelper } from '../../helper';

const SettingsBusiness = {
    async findById(id) {
        try {
            let document = await SettingsBusinessSchema.findById(id);
            document = (document) ? await commonHelper.nullToEmptyString(document) : {};
            return document;
        } catch (err) {
            return err;
        }
    },
    async save(id, updateSet) {
        try {
            let document = await SettingsBusinessSchema.findOneAndUpdate({ _id: id }, updateSet, { new: true, runValidators: true });
            document = (document) ? await commonHelper.nullToEmptyString(document) : {};
            return document;
        } catch (err) {
            return err;
        }
    }
}
export default SettingsBusiness;