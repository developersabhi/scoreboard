const { Country } = require("../../models/app/country.model");
const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");

// get must be public and should be in app
const getCountry = asyncHandler(async (req, res) => {
  let countries = await Country.find();
  return res
    .status(200)
    .send(new ApiResponse(200, countries, "countries fetched successfully"));
});

const createCountry = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const validFields = [
    "country_name",
    "country_code",
    "country_num",
    "country_logo",
  ];
  let requestedFields = req.body;

  //   must complete file upload stuff
  const logo = req.file || { path: "x" };

  if (!logo || !logo?.path)
    throw new ApiError(400, "logo for country is required");

  requestedFields = { ...requestedFields, country_logo: logo?.path };

  const { invalidFields, missingFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  const countryWithNameExists = await Country.findByName(
    requestedFields.country_name
  );

  if (countryWithNameExists)
    throw new ApiError(409, "country with name already exists");

  const countryWithCodeExists = await Country.findByCode(
    requestedFields.country_code
  );

  if (countryWithCodeExists)
    throw new ApiError(409, "country with code already exists");

  const countryWithNumExists = await Country.findByNum(
    requestedFields.country_num
  );

  if (countryWithNumExists)
    throw new ApiError(409, "country with iso_num already exists");

  const newCountry = await Country.create(requestedFields);

  if (!newCountry) throw new ApiError(500, "unable to create country");

  return res
    .status(201)
    .send(new ApiResponse(201, newCountry, "country created successfully"));
});

const updateCountry = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.user_id) {
    throw new ApiError(401, "Unauthorized user");
  }

  if (req.role !== "ADMIN") {
    throw new ApiError(403, "Forbidden request");
  }

  const { country_id } = req.params;

  if (!country_id) {
    throw new ApiError(400, "country_id is invalid or not sent");
  }

  const validFields = [
    "country_name",
    "country_code",
    "country_num",
    "country_logo",
  ];
  let requestedFields = req.body;

  // if (logo && logo?.path)
  requestedFields = {
    ...requestedFields,
    country_logo: "logo.path",
    ...requestedFields,
  };

  const { invalidFields } = fieldValidator(validFields, requestedFields);

  if (invalidFields.length) {
    throw new ApiError(400, invalidFields);
  }

  const countryExists = await Country.findById(country_id);

  if (!countryExists) {
    throw new ApiError(404, "Country with the given ID not found");
  }

  // if (requestedFields.country_name) {
  //   const countryWithNameExists = await Country.findByName(
  //     requestedFields.country_name
  //   );
  //   if (
  //     countryWithNameExists &&
  //     countryWithNameExists._id !== countryExists._id
  //   ) {
  //     throw new ApiError(409, "Another country with this name already exists");
  //   }
  // }

  // if (requestedFields.country_code) {
  //   const countryWithCodeExists = await Country.findByCode(
  //     requestedFields.country_code
  //   );
  //   if (
  //     countryWithCodeExists &&
  //     countryWithCodeExists._id !== countryExists._id
  //   ) {
  //     throw new ApiError(409, "Another country with this code already exists");
  //   }
  // }

  // if (requestedFields.country_num) {
  //   const countryWithNumExists = await Country.findByNum(
  //     requestedFields.country_num
  //   );
  //   if (
  //     countryWithNumExists &&
  //     countryWithNumExists._id !== countryExists._id
  //   ) {
  //     throw new ApiError(
  //       409,
  //       "Another country with this number already exists"
  //     );
  //   }
  // }

  if (
    requestedFields.country_code &&
    requestedFields.country_code !== countryExists.country_code
  ) {
    const countryWithCodeExists = await Country.findByCode(
      requestedFields.country_code
    );
    if (countryWithCodeExists) {
      throw new ApiError(409, "Another country with this code already exists");
    }
  }


  // if (requestedFields.country_code && requestedFields.country_code !== countryExists.country_code) {
  //   const countryWithCodeExists = await Country.findByCode(requestedFields.country_code);
  //   if (countryWithCodeExists) {
  //     throw new ApiError(409, "Another country with this code already exists");
  //   }
  // }

  console.log(requestedFields);
  const updatedCountry = await Country.update(country_id, requestedFields);

  return res
    .status(200)
    .send(new ApiResponse(200, updatedCountry, "Country updated successfully"));
});

module.exports = { getCountry, createCountry, updateCountry };
