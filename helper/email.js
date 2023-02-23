import ejs from 'ejs';
import nodemailer from 'nodemailer';
import { SMTP_EMAIL, SMTP_PASSWORD } from '../config';
import { systemSettingsHelper } from './';

const emailHelper = {
    async sendEmail(params) {
        return new Promise(async(resolve, reject) => {
            let { fromEmail, email, subject, templateFile } = params;
            fromEmail = (fromEmail) ? fromEmail : systemSettingsHelper.CMSDATA("SYSTEM_FROM_EMAIL");
            const html = await ejs.renderFile(`./views/${templateFile}.ejs`, params, { async: true });
            var mailOptions = {
                from: fromEmail,
                to: email,
                subject,
                html,
                // attachments : [{filename:req.file.filename,path:req.file.path}]
            };
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: SMTP_EMAIL,
                    pass: SMTP_PASSWORD
                }
            });
            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    // console.log("error is ", error);
                    reject(error);
                } else {
                    // console.log('Email sent: ' + info.response);
                    resolve(true);
                }
            });
        });
    }
};
export default emailHelper;