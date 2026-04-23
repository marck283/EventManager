import { _ } from 'core-js';
import { Validator } from 'node-input-validator';

var _validate = async function (fields, rules, res, msg, next) {
    const v = new Validator(fields, rules);
    try {
        const matched = await v.check();

        if (!matched) {
            return res.status(400).json({ errors: msg || v.errors });
        }
        next();
    } catch(error) {
        console.log(error);
        return res.status(500).json({error: "Internal server error"});
    }
};

var validate_body = function (rules, msg) {
    return async function (req, res, next) {
        _validate(req.body, rules, res, msg, next);
    };
};

var validate_hdrs = function (rules, msg) {
    return async function (req, res, next) {
        _validate(req.headers, rules, res, msg, next);
    };
};

var validate_params = function (rules, msg) {
    return async function (req, res, next) {
        _validate(req.params, rules, res, msg, next);
    };
};

export { validate_body, validate_hdrs, validate_params };