function fieldValidator(validFields, data) {
  const missingFields = [];
  const invalidFields = [];

  // Check for missing fields from validFields
  validFields.forEach((field) => {
    if (data[field] === undefined) {
      missingFields.push(field);
    } else {
      // Specific validation logic for email

      // Specific validation logic for password
      if (
        field === "password" &&
        typeof data[field] === "string" &&
        data[field].length < 6
      ) {
        invalidFields.push({
          field: "password",
          message: "Password must be at least 6 characters long",
        });
      }

      // Specific validation logic for username
      if (
        field === "name" &&
        (typeof data[field] !== "string" || data[field].length < 3)
      ) {
        invalidFields.push({
          field: "username",
          message: "Username must be a string with at least 3 characters",
        });
      }

      // Add other specific validation logic as needed
    }
  });

  // Check for any extra fields in data that are not in validFields
  Object.keys(data).forEach((field) => {
    if (!validFields.includes(field)) {
      invalidFields.push({ field, message: "Field is not allowed" });
    }
  });

  return { missingFields, invalidFields };
}

module.exports = { fieldValidator };
