import moment from 'moment/moment';
import * as Joi from 'joi';

import JoiObjectId from "joi-objectid";
Joi.objectId = JoiObjectId(Joi);

import JoiPhoneNumber from "joi-phone-number";
const PhoneNumber = Joi.extend(JoiPhoneNumber);

import date from '@joi/date';
const JoiDate = Joi.extend(date);

import { systemSettingsHelper } from '../helper';
const isGenderField = systemSettingsHelper.isGenderField();
const isDobField = systemSettingsHelper.isDobField();
const isUsernameField = systemSettingsHelper.isUsernameField();
const isPhoneField = systemSettingsHelper.isPhoneField();

import { countriesJSON } from './../staticdata';
let countryCodes = countriesJSON.map(function(country) {
    return country.phonecode;
});

const dobMaxDate = moment.utc().format("YYYY-MM-DD");

const registerValidatorFields = {
    loginFrom: Joi.string().required().label("Login from"),
    fullname: Joi.string().trim().required().min(3).max(100).label("Fullname"),
    email: Joi.when('loginFrom', {
        is: "manually",
        then: Joi.string().trim().required().email().label("Email"),
        otherwise: Joi.string().trim().optional().email().allow('').label("Emaill"),
    }),
    password: Joi.string().trim().required().pattern(new RegExp('^[a-zA-Z0-9]{3,40}$')).label("Password"),

    //Gender
    isGenderField: Joi.boolean().default(isGenderField),
    gender: Joi.when('isGenderField', {
        is: true,
        then: Joi.string().trim().valid('male', 'female').required().label("Gender").messages({
            'any.only': "Select valid gender value (male/female)!"
        }),
        otherwise: Joi.string().trim().valid('male', 'female', '').optional().allow('').default('').label("Gender").messages({
            'any.only': "Select valid gender value (male/female)!"
        }),
    }),

    //Date of Birth    
    isDobField: Joi.boolean().default(isDobField),
    dob: Joi.when('isDobField', {
        is: true,
        then: JoiDate.date().required().format("YYYY-MM-DD").raw().max(dobMaxDate).label("Date of birth").messages({
            'date.max': `{{#label}} must be today's or past date!`
        }),
        otherwise: JoiDate.date().optional().allow('').default('').format("YYYY-MM-DD").raw().max(dobMaxDate).label("Date of birth").messages({
            'date.max': `{{#label}} must be today's or past date!`
        }),
    }),

    //Username
    isUsernameField: Joi.boolean().default((parent) => (parent.loginFrom == 'manually') ? isUsernameField : false),
    username: Joi.when('isUsernameField', {
        is: true,
        then: Joi.string().trim().required().label("Username"),
        otherwise: Joi.string().optional().allow('').default('').label("Username")
    }),

    //Phone Number
    isPhoneField: Joi.boolean().default(isPhoneField),
    phoneCountryCode: Joi.when('isPhoneField', {
        is: true,
        then: Joi.string().trim().required().valid(...countryCodes).label("Country code of phone").messages({
            'any.only': "Select valid {{#label}}!"
        }),
        otherwise: Joi.string().trim().optional().valid(...countryCodes, '').allow('').default('').label("Country code of phone").messages({
            'any.only': "Select valid {{#label}}!"
        })
    }),
    phoneNumber: Joi.when('isPhoneField', {
        is: true,
        then: Joi.number().integer().required().label("Phone number"),
        otherwise: Joi.number().optional().allow('').default('').label("Phone number")
    }),
    phone: Joi.when('isPhoneField', {
        is: true,
        then: PhoneNumber.string().trim().min(8).max(14).phoneNumber({ defaultCountry: 'BE', format: 'e164' }).required().label("Phone number"),
        otherwise: PhoneNumber.string().min(8).max(14).phoneNumber({ defaultCountry: 'BE', format: 'e164' }).optional().allow('').default('').label("Phone number")
    }),
};
const registerValidatorSchema = Joi.object(registerValidatorFields).unknown();

const verifyAccountValidatorFields = {
    userId: Joi.objectId().required().label("User Id").messages({
        'string.pattern.name': "Invalid {{#label}}!"
    }),
    email: Joi.string().trim().required().email().label("Email"),
};
const verifyAccountValidatorSchema = Joi.object(verifyAccountValidatorFields).unknown();

export {
    registerValidatorFields,
    registerValidatorSchema,
    verifyAccountValidatorSchema
};