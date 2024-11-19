const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");
const { Team } = require("../../models/app/team.model");

// this should be a public route and belongs to app
// const getTeam = asyncHandler(async (req, res) => {});

const getTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find();

  return res
    .status(200)
    .send(new ApiResponse(200, teams, "teams fetched successfully"));
});

const createTeam = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const validFields = ["name", "gender"];
  const requestedFields = req.body;

  const { invalidFields, missingFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  const teamExists = await Team.findByNameAndGender(
    requestedFields.name,
    requestedFields.gender
  );

  if (teamExists) throw new ApiError(409, "team already exists");

  console.log(req.body);
  const newTeam = await Team.create(requestedFields);

  if (!newTeam) throw new ApiError(500, "unable to create new team");

  return res
    .status(201)
    .send(new ApiResponse(201, newTeam, "new team created successfully"));
});

const updateTeam = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const { team_id } = req.params;

  if (!team_id) throw new ApiError(404, "team_id is invalid or not sent");

  const validFields = ["name", "gender"];
  const requestedFields = req.body;

  const { invalidFields } = fieldValidator(validFields, requestedFields);

  if (invalidFields.length) throw new ApiError(400, invalidFields);

  const updatedTeam = await Team.update(team_id, requestedFields);

  if (!updatedTeam)
    throw new ApiError(404, "team with id not found to be updated");

  return res
    .status(201)
    .send(new ApiResponse(201, updatedTeam, "team updated successfully"));
});

module.exports = {
  getTeams,
  createTeam,
  updateTeam,
};
