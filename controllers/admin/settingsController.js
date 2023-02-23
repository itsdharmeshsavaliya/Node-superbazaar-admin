import _ from 'underscore';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import {
    systemSettingsHelper,
    validate
} from '../../helper';
import {
    businessValidatorSchema,
    businessIdValidatorSchema,
} from '../../validators';
import {
    Business,
    SettingsBusiness
} from '../../models';

const settingsController = {
    async businessInfo(req, res, next) {
        try {
            const settingsBusinessId = systemSettingsHelper.getSettingsOfBusinessRecordId(); //Business setting record ID
            await validate(businessIdValidatorSchema, { id: settingsBusinessId });

            let businessInfo = await SettingsBusiness.findById(settingsBusinessId);
            if (_.isEmpty(businessInfo)) return next(CustomErrorHandler.recordNotFound("Business setting not found!"));

            return res.json(businessInfo);
        } catch (err) {
            return next(err);
        }
    },
    async saveBusiness(req, res, next) {
        try {
            const settingsBusinessId = systemSettingsHelper.getSettingsOfBusinessRecordId(); //Business setting record ID
            req.body = await validate(businessValidatorSchema, {...req.body, id: settingsBusinessId });

            let businessInfo = await SettingsBusiness.findById(settingsBusinessId);
            if (_.isEmpty(businessInfo)) return next(CustomErrorHandler.recordNotFound("Business setting not found!"));

            let { type } = req.body;
            let isRecordExist = false;
            isRecordExist = await Business.isRecordExist(type);
            if (!isRecordExist) return next(CustomErrorHandler.recordNotFound("Invalid business type!"));

            let document;
            try {
                let { visibleOption, minimumPieces, minimumCart } = req.body;
                visibleOption = (type === '632da5c42ae0801ff7c2a0ff') ? visibleOption : "";
                minimumPieces = (type === '632da5c52ae0801ff7c2a103') ? minimumPieces : "";
                minimumCart = (type === '632da5c52ae0801ff7c2a103') ? minimumCart : "";

                const updateSet = {
                    type,
                    visibleOption,
                    minimumPieces,
                    minimumCart,
                };
                document = await SettingsBusiness.save(settingsBusinessId, updateSet);
            } catch (err) {
                return next(err);
            }
            res.json(document);
        } catch (err) {
            return next(err);
        }
    },
};
export default settingsController;