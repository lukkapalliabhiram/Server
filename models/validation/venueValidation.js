const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateVenueInput(data) {
  let errors = {};// Convert empty fields to an empty string so we can use validator functions
  data.venueOwnerEmail = !isEmpty(data.venueOwnerEmail) ? data.venueOwnerEmail : "";
  data.venueName = !isEmpty(data.venueName) ? data.venueName : "";
  data.location = !isEmpty(data.location) ? data.location : "";
  data.description = !isEmpty(data.description) ? data.description : "";
  data.sportName = !isEmpty(data.sportName) ? data.sportName : "";
  data.image = !isEmpty(data.image) ? data.image : "";
  data.date = !isEmpty(data.date) ? data.date : "";
  data.maxCapacity = !isEmpty(data.maxCapacity) ? data.maxCapacity : "";
  data.cost = !isEmpty(data.cost) ? data.cost : "";
  if (Validator.isEmpty(data.venueOwnerEmail)) {
    errors.message = "Email field is required";
  } else if (!Validator.isEmail(data.venueOwnerEmail)) {
    errors.message = "Email is invalid";
  }// Password checks
  if (Validator.isEmpty(data.venueName)) {
    errors.message = "Venue Name field is required";
  }if (Validator.isEmpty(data.location)) {
    errors.message = "Location field is required";
  } if (Validator.isEmpty(data.description)) {
    errors.message = "Description field is required";
  } if (Validator.isEmpty(data.sportName)) {
    errors.message = "Sports Name field is required";
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