const systemSettingsHelper = {
    CMSDATA(key) {
        const CMSDATA = {
            "ADMIN_TITLE_TEXT": "Admin",
            "SYSTEM_NAME": "Superbazaar",
            "SYSTEM_FROM_EMAIL_NAME": "Superbazaar",
            "ADMIN_FOOTER_TEXT": "©Superbazaar",
            "DOMAIN_NAME": "",
            "SYSTEM_FROM_EMAIL": "setblue.dharmesh@gmail.com",
            "TIMEZONE": ""
        };
        const cmsvalue = (CMSDATA[key]) ? CMSDATA[key] : "";
        return cmsvalue;
    },
    isGenderField() {
        return true; //set true if user has username field, otherwise false
    },
    isDobField() { //dob: Date of Birth
        return true; //set true if user has dob field, otherwise false
    },
    isUsernameField() {
        return true; //set true if user has username field, otherwise false
    },
    isPhoneField() {
        return true; //set true if user has phone_code_country_id, phone_number, phone fields, otherwise false
    },
    loginFromTypes(action = "all") {
        let types = [];
        if (action === "all") {
            types = ["manually", "google", "facebook"];
        } else if (action === "social") {
            types = ["google", "facebook"];
        } else {}
        return types;
    },
    isAutoActiveNewUserAccount() {
        return false; //false means we nned to send verification email and than user account will be activated.
    },
    getSettingsOfBusinessRecordId() {
        const settingsBusinessId = "633192c907f43aa036fdabfb";
        return settingsBusinessId;
    },
    getB2BVisibleOption() {
        const visibleOptionB2B = {};
        visibleOptionB2B[1] = "Password Protected";
        visibleOptionB2B[2] = "Open for Price";
        return visibleOptionB2B;
    },
};
export default systemSettingsHelper;