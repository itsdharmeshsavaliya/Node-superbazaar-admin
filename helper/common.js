import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { JWT_COOKIE_EXPIRES_IN } from '../config';

const commonHelper = {
    getCookieOptions() {
        const cookieOptions = {
            expires: new Date(Date.now() + parseInt(JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000),
            httpOnly: true,
            // secure: true
        };
        return cookieOptions;
    },
    nullToObject(obj) {
        obj = (obj === null) ? {} : obj;
        return obj;
    },
    nullToEmptyString(someObj, replaceValue = "") {
        const replacer = (key, value) => String(value) === "null" || String(value) === "undefined" ? replaceValue : value;
        return JSON.parse(JSON.stringify(someObj, replacer));
    },
    validMenuTypes() {
        const menuTypes = ["Simple Category", "Multi Level Category", "Mega Menu Filter", "Mega Menu Filter1"];
        return menuTypes;
    },
    ucfirst(str) {
        const string = str.charAt(0).toUpperCase() + str.slice(1);
        return string;
    },
    createDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    },
    async deleteFile(filePath) {
        filePath = './' + filePath;
        if (fs.existsSync(filePath)) { //check file exist
            await fs.unlinkSync(filePath);
        }
    },
    async deleteFiles(files) {
        if (files && files.length > 0) {
            let filePath;
            await Promise.all(files.map(async file => {
                filePath = './' + file.path;
                if (fs.existsSync(filePath)) { //check file exist
                    await fs.unlinkSync(filePath);
                }
            }));
        }
    },
    uniqueFilename(file) {
        let uniqueName = "";
        if (file) {
            uniqueName = `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${path.extname(file.originalname)}`; //for i.e 3746674586-836534453.png
        }
        return uniqueName;
    },
    getUniqueUUID() {
        return uuidv4();
    },
    convertFilePathSlashes(path) {
        let filePath = path.replace(/\\/g, "/");
        return filePath;
    },
    strIdToObjectId(strId) {
        const ObjectId = mongoose.Types.ObjectId;
        return ObjectId(strId);
    },
    isValidObjectId(id) {
        const isValid = mongoose.Types.ObjectId.isValid(id);
        return isValid;
    },
    parseString(str, parseTo = "array") { //parse string to Array OR Json
        let data = (str) ? JSON.parse(str) : ((parseTo == "array") ? [] : {});
        return data;
    },
    mergeArray(arr1, arr2) {
        let finalArr = [];
        arr1.concat(arr2).forEach(item => {
            if (finalArr.indexOf(item) == -1)
                finalArr.push(item);
        });
        return finalArr;
    },
    fetchUniqueValues(arr) { //remove duplicate values from array
        var uniqueArr = [];
        for (var i = 0; i < arr.length; i++) {
            if (!uniqueArr.includes(arr[i])) {
                uniqueArr.push(arr[i]);
            }
        }
        return uniqueArr;
    },
    mergeArrayAndDeDuplicateElements(arr1, arr2) {
        var finalArray = [...new Set([...arr1, ...arr2])];
        return finalArray;
    },
    arrayUnique(arr) {
        for (var i = 0; i < arr.length; ++i) {
            for (var j = i + 1; j < arr.length; ++j) {
                if (arr[i] === arr[j])
                    arr.splice(j--, 1);
            }
        }
        return arr;
    },
    convertArrayOfobjectIdsToStringArray(objectIds) {
        return (objectIds) ? objectIds.map(x => x.toString()) : [];
    },
    convertArrayOfStringElementsToNumber(arrOfStr) {
        const arrOfNum = arrOfStr.map(str => {
            return Number(str);
        });
        return arrOfNum;
    },
    convertSpecialCharacters(text, replaceWith = '_') {
        text = text.replace(/[^a-zA-Z0-9]+/ig, replaceWith);
        text = text.replace(/(^\_+|\_+$)/g, '');
        return text;
    },
    isSameObjects(obj, source) {
        //source keys & its values must be match with the obj
        //all keys & its values of both objects are same?        
        return Object.keys(source).every(key => obj.hasOwnProperty(key) && obj[key] === source[key]);
    },
    isSameKeys(obj, source) { //source keys must be match with the obj
        //all keys of both objects are same? 
        return Object.keys(source).every(key => {
            obj.hasOwnProperty(key)
        });
    },
    parseDateTime(datetime) {
        return datetime.replace('.000', '').replace('T', ' ').replace('Z', '');
    },
    getMatchedObjectByKeyValue(arr, keyname, val) {
        let obj = arr.filter(item => item[keyname] == val);
        obj = (obj) ? obj[0] : {}
        return obj;
    },
    getKeyValueFromMatchedObject(arr, keyname, val, reqKey) {
        let obj = arr.filter(item => item[keyname] == val);
        let value = (obj) ? ((obj[0]) ? obj[0][reqKey] : '') : '';
        return value;
    },
    zeroToNULL(value) {
        return (value == 0) ? null : value;
    },
    emptyDateToNULL(value) {
        return (value == '') ? null : value;
    }
};
export default commonHelper;