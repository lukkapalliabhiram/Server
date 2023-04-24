const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateActivityInput(data) {
  let errors = {};// Convert empty fields to an empty string so we can use validator functions
  data.activityCreatedBy = !isEmpty(data.activityCreatedBy) ? data.activityCreatedBy : "";
  data.activityName = !isEmpty(data.activityName) ? data.activityName : "";
  data.activityLocation = !isEmpty(data.activityLocation) ? data.activityLocation : "";
  data.ageRange = !isEmpty(data.ageRange) ? data.ageRange : "";
  data.cost = !isEmpty(data.cost) ? data.cost : -1;
  data.description = !isEmpty(data.description) ? data.description : "";
  data.image = !isEmpty(data.image) ? data.image : "";
  data.maxCapacity = !isEmpty(data.maxCapacity) ? data.maxCapacity : "";
  data.date = !isEmpty(data.date) ? data.date : "";
  if (Validator.isEmpty(data.activityCreatedBy)) {
    errors.message = "Email field is required";
  } else if (!Validator.isEmail(data.activityCreatedBy)) {
    errors.message = "Email is invalid";
  }// Password checks
  if (Validator.isEmpty(data.activityName)) {
    errors.message = "Venue Name field is required";
  }if (Validator.isEmpty(data.activityLocation)) {
    errors.message = "Location field is required";
  } if (Validator.isEmpty(data.description)) {
    errors.message = "Description field is required";
  } if (Validator.isEmpty(data.ageRange)) {
    errors.message = "Age Range field is required";
  } if (Validator.isEmpty(data.image)) {
    errors.message = "Image field is required";
  } if (Validator.isEmpty(data.date)) {
    errors.message = "Date field is required";
  } if (Validator.isEmpty(data.maxCapacity)) {
    errors.message = "Max Capacity field is required";
  } if (Validator.isEmpty(data.cost)) {
    errors.message = "Cost field is required";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};