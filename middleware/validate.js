const { validationResult } = require("express-validator");

exports.validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors = {};
    errors.array().forEach((err) => {
      if (!extractedErrors[err.path]) {
        extractedErrors[err.path] = [];
      }
      extractedErrors[err.path].push(err.msg);
    });
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: extractedErrors,
    });
  };
};
