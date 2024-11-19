const { User } = require("../../models/auth/user.model");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { ApiError } = require("../../utils/ApiError.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");

const fetchAllUsers = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthorized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const users = await User.findAll();

  return res
    .status(200)
    .send(new ApiResponse(200, users, "all users fetched successfully"));
});

const fetchUsersByRole = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthorized user");

  if (req.role === "AGENT") throw new ApiError(403, "forbidden request");

  const { role } = req.query;

  if (!role) throw new ApiError(400, "role not selected");

  const users = await User.findByRole(role);

  return res
    .status(200)
    .send(new ApiResponse(200, users, "all users fetched successfully"));
});

const fetchAccUserRef = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthorized user");

  if (req.role === "AGENT") throw new ApiError(403, "forbidden request");

  const users = User.findAccCreatedBy({ created_by: req.user?.user_id });

  return res
    .status(200)
    .send(new ApiResponse(200, users, "all users fetched successfully"));
});

const changeUserPassword = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.user_id)
    throw new ApiError(401, "unauthorized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden action");

  const validFields = ["cust_user_id", "newPassword", "confirmPassword"];
  const requestedFields = ({ cust_user_id, newPassword, confirmPassword } =
    req.body);

  const { invalidFields, missingFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  if (newPassword !== confirmPassword)
    throw new ApiError(400, "newPassword and confirmPassword must be same");

  let userExists = await User.findByCustId(cust_user_id);

  if (!userExists) throw new ApiError(404, "user with cust_user_id not found");

  let updatedUser = await User.updatePass({ cust_user_id, newPassword });

  if (!updatedUser) throw new ApiError(500, "unable to update password");

  return res
    .status(200)
    .send(new ApiResponse(200, updatedUser, "password updated successfully"));
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthorized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const { cust_user_id } = req.params;
  let { status } = req.query;

  if (!cust_user_id)
    throw new ApiError(400, "cust_user_id is invalid or not selected");

  if (status == "true") status = 1;
  else status = 0;

  await User.toggleStatus(cust_user_id, status);

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        { cust_user_id, status },
        "user status updated successfully"
      )
    );
});

module.exports = {
  fetchAllUsers,
  fetchUsersByRole,
  fetchAccUserRef,
  changeUserPassword,
  toggleUserStatus,
};
