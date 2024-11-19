const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");
const { MatchAssignUser } = require("../../models/app/matchAssignUser.model");

const assignMatchToUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const { match_id, user_id } = req.body;

  if (!Array.isArray(user_id))
    throw new ApiError(400, "user_ids must be an array");

  if (!match_id) throw new ApiError(400, "match_id not sent");

  const assignedUser = [];
  const alreadyAssignedUser = [];

  for (let i = 0; i < user_id.length; i++) {
    let alreadyAssigned = await MatchAssignUser.findAssignedUser({
      match_id,
      user_id: user_id[i],
    });

    if (alreadyAssigned)
      alreadyAssignedUser.push(
        `user with id: ${user_id} is already assigned to match`
      );
    else
      assignedUser.push(
        await MatchAssignUser.create({
          match_id,
          user_id: user_id[i],
          assigned_by: req.user?.user_id,
        })
      );
  }

  return res
    .status(201)
    .send(
      new ApiResponse(
        201,
        { assignedUser, alreadyAssignedUser },
        "user assigned to match successfully"
      )
    );
});

const updateMatchAssignedUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const { match_assign_user_id } = req.params;

  if (!match_assign_user_id)
    throw new ApiError(400, "match_assign_user_id is invalid or not sent");

  const validFields = ["match_id", "user_id"];
  const { match_id, user_id } = req.body;

  const { invalidFields } = fieldValidator(validFields, {
    match_id,
    user_id,
  });

  if (invalidFields.length) throw new ApiError(400, invalidFields);

  const tupleExists = await MatchAssignUser.findById(match_assign_user_id);

  if (!tupleExists)
    throw new ApiError(404, "tuple with match_assign_user_id not found");

  const updatedTuple = await MatchAssignUser.update(match_assign_user_id, {
    match_id,
    user_id,
    assigned_by: req.user.user_id,
  });

  return res
    .status(200)
    .send(new ApiResponse(200, updatedTuple, "tuple updated successfully"));
});

const getAgentsOfMatch = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const { match_id } = req.query;

  const agentsIds = await MatchAssignUser.fetchAssignedAgents({ match_id });

  return res
    .status(200)
    .send(new ApiResponse(200, agentsIds, "agents fetched successfully"));
});

const getassignMatchToUser = asyncHandler(async (req, res) => {
  const teams = await MatchAssignUser.find();

  return res
    .status(200)
    .send(new ApiResponse(200, teams, "Match Assign User fetched successfully"));
});

module.exports = {
  assignMatchToUser,
  updateMatchAssignedUser,
  getAgentsOfMatch,
  getassignMatchToUser
};
