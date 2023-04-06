const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateResetPasswordInput(data) {
  console.log("data:");
  console.log(data);
  let errors = {};// Convert empty fields to an empty string so we can use validator functions
  data.email = !isEmpty(data.email) ? data.email : "";
  data.new_password = !isEmpty(data.password) ? data.password : "";
  data.new_password2 = !isEmpty(data.password2) ? data.password2 : "";// Name checks
  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.message = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.message = "Email is invalid";
  }// Password checks
  if (Validator.isEmpty(data.password)) {
    errors.message = "Password field is required";
  }if (Validator.isEmpty(data.password2)) {
    errors.message = "Confirm password field is required";
  }if (data.password.length < 8) {
    errors.message = "Password must be at least 8 characters";
  }if (!Validator.equals(data.password, data.password2)) {
    errors.message = "Passwords must match";
  }return {
    errors,
    isValid: isEmpty(errors)
  };
};