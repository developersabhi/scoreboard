const { Player } = require("../../models/app/player.model");
const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");

const getTeamPlayers = asyncHandler(async (req, res) => {
  const { team_id } = req.query;

  if (!team_id) throw new ApiError(400, "team_id not sent or invalid");

  const teamPlayers = await Player.findByTeamId(team_id);

  return res
    .status(200)
    .send(
      new ApiResponse(200, teamPlayers, "team players fetched successfully")
    );
});

const createPlayer = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const validFields = [
    "name",
    "age",
    "country_id",
    "skills",
    "team_id",
    "gender",
  ];
  const requestedFields = req.body;

  //   must complete file upload stuff
  const profile_pic = req.file || { path: "x" };

  // if (!profile_pic || !profile_pic.path)
  //   throw new ApiError(400, "profile_pic is requried");

  const { invalidFields, missingFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, {
      invalidFields,
      missingFields,
    });

  const playerExists = await Player.findByName(requestedFields.name);

  if (playerExists && playerExists.country_id == requestedFields.country_id)
    throw new ApiError(409, "player with name and country_id already exists");

  const newPlayer = await Player.create({
    ...requestedFields,
    profile_pic: profile_pic.path,
  });

  if (!newPlayer) throw new ApiError(500, "unable to create new player");

  return res
    .status(201)
    .send(new ApiResponse(201, newPlayer, "new player created successfully"));
});

// these two below should be declared in app section and should be public route
// const getPlayerInfo = asyncHandler(async (req, res) => {});
const getAllPlayersInfo = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const players = await Player.find();

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        players,
        "all players with info fetched successfully"
      )
    );
});

const updatePlayer = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const { player_id } = req.params;

  if (!player_id) throw new ApiError(400, "player_id not sent");

  const validFields = [
    "name",
    "age",
    "country_id",
    "skills",
    "team_id",
    "gender",
  ];
  let requestedFields = req.body;

  //   must complete file upload stuff
  let profile_pic = req.file;

  const { invalidFields } = fieldValidator(validFields, requestedFields);

  if (invalidFields.length) throw new ApiError(400, invalidFields);

  // if (profile_pic)
  //   requestedFields = {
  //     ...requestedFields,
  //     profile_pic: profile_pic.path ||,
  //   };

  requestedFields["profile_pic"] = "x";

  const playerExists = await Player.findById(player_id);
  console.log(playerExists);

  // if (!playerExists || playerExists.country_id != requestedFields.country_id)
  //   throw new ApiError(404, "player with name and country_id not found");

  const updatedPlayer = await Player.update(player_id, requestedFields);

  if (!updatedPlayer) throw new ApiError(500, "unable to update player info");

  return res
    .status(200)
    .send(
      new ApiResponse(200, updatedPlayer, "player profile updated successfully")
    );
});

// this action is distructive and cannot be performed due to distructive data loss
const deletePlayer = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const { player_id } = req.params;

  if (!player_id) throw new ApiError(400, "player_id in not valid or not sent");

  const player = await Player.delete(player_id);

  if (player) throw new ApiError(400, "unable to delete player");

  return res
    .status(200)
    .send(new ApiResponse(204, player, "player deleted successfully"));
});

module.exports = {
  createPlayer,
  getAllPlayersInfo,
  getTeamPlayers,
  updatePlayer,
  deletePlayer,
};
