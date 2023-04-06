const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateRegisterInput(data) {
  let errors = {};// Convert empty fields to an empty string so we can use validator functions
  console.log("Data",data);
  data.role = !isEmpty(data.role) ? data.role : "";
  data.fname = !isEmpty(data.fname) ? data.fname : "";
  data.lname = !isEmpty(data.lname) ? data.lname : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
//   if (Validator.isEmpty(data.role)) {
//     errors.role = "Role not initialized";
//   }// Email checks
  if (Validator.isEmpty(data.role)) {
    errors.message = "User Role not selected!";
  }
  if(parseInt(data.role)==-1){
    errors.message = "User Role not selected!";
  }
  if (Validator.isEmpty(data.fname)) {
    errors.message = "First Name field is required";
  }
  if (Validator.isEmpty(data.lname)) {
    errors.message = "Last Name field is required";
  }// Email checks
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