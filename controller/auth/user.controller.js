const { logger } = require("../../lib/utils/logger");
const { User } = require("../../models/auth/user.model");
const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const signUp = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.user_id)
    throw new ApiError(401, "unauthorized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden action");

  const validFields = ["name", "mobile_no", "passwd", "role"];
  let requestedFields = req.body;

  let { invalidFields, missingFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(
      400,
      `${invalidFields.length ? invalidFields : ""} are invalid, ${
        missingFields ? missingFields : ""
      } are missing`
    );

  if (requestedFields.role.toUpperCase() === "ADMIN")
    throw new ApiError(400, "ADMIN roles cannot be created");

  if (req.role === "MANAGER" && requestedFields.role.toUpperCase() !== "AGENT")
    throw new ApiError(400, "ADMIN or MANAGER roles cannot be created");

  let cust_user_id = await User.generateCustUsrId(requestedFields);

  if (!cust_user_id) throw new ApiError(400, "name length must be more than 3");

  // name, mobile_no, passwd, cust_user_id, status, role, created_by
  requestedFields = {
    ...requestedFields,
    cust_user_id: cust_user_id,
    status: true,
    created_by: req.user.user_id,
  };

  let newUser = await User.create(requestedFields);

  if (!newUser) throw new ApiError(500, "unable to create new user");

  logger.info("user created successfully");

  delete requestedFields["passwd"];

  return res
    .status(201)
    .send(new ApiResponse(201, requestedFields, "sign-up  success"));
});

const signIn = asyncHandler(async (req, res) => {
  const validFields = ["cust_user_id", "passwd"];

  const requestedFields = req.body;

  const { missingFields, invalidFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (missingFields.length || invalidFields.length) {
    console.log(missingFields, invalidFields);
    throw new ApiError(
      400,
      `${missingFields.length ? missingFields.toString() : ""}, ${
        invalidFields.length ? invalidFields.toString() : ""
      }`
    );
  }

  let userExists = await User.findByCustId(requestedFields.cust_user_id);

  if (!userExists || !userExists.user_id)
    throw new ApiError(404, "user with name not found");

  if (
    !(await User.checkUserPassword(requestedFields.passwd, userExists.passwd))
  )
    throw new ApiError(400, "invalid password");

  const accessToken = await User.generateAccessToken(userExists);

  if (!accessToken) throw new ApiError(500, "unable to login");

  delete userExists["passwd"];
  console.log(userExists);

  return res
    .cookie("accessToken", accessToken, options)
    .status(200)
    .send(new ApiResponse(200, { userExists, accessToken }, "sign-in success"));
});

const signOut = asyncHandler(async (req, res) => {
  if (!req.user || !req.role) throw new ApiError(401, "unauthorized user");

  logger.info("user signed out");

  return res
    .clearCookie("accessToken")
    .status(200)
    .send(new ApiResponse(200, {}, "sign-out success"));
});

module.exports = { signUp, signIn, signOut };
