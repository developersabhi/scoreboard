const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");
const { SquadTeamPlayers } = require("../../models/app/squadTeamPlayers.model");
const { Squad } = require("../../models/app/squad.model");

const getSquadPlayers = asyncHandler(async (req, res) => {
  const { squad_id } = req.query;

  const squadPlayers = await SquadTeamPlayers.findBySquadId(squad_id);

  return res
    .status(200)
    .send(
      new ApiResponse(200, squadPlayers, "squad players fetched successfully")
    );
});

const createSquadTeamPlayer = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const validFields = ["player_ids", "squad_id"];
  const { player_ids, squad_id } = req.body;

  const { invalidFields, missingFields } = fieldValidator(validFields, {
    player_ids,
    squad_id,
  });

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  if (!player_ids?.length)
    throw new ApiError(400, "player_ids must be an Array");

  let newTuples = [];

  for (let i = 0; i < player_ids.length; i++) {
    let player_id = await SquadTeamPlayers.findByTeamPlayerSquadId({
      player_id: player_ids[i],
      squad_id,
    });

    if (!player_id?.player_id)
      newTuples.push(
        await SquadTeamPlayers.create({ player_id: player_ids[i], squad_id })
      );
  }

  console.log(newTuples);

  if (!newTuples.length)
    throw new ApiError(500, "unable to add to squad, as they already exist");

  return res
    .status(201)
    .send(
      new ApiResponse(201, newTuples, "players added to squad successfully")
    );
});

const addSquadTeamPlayerByTourTeamIds = asyncHandler(async (req, res) => {
  const requestedFields = ({ tournament_id, team_id, player_ids } = req.body);

  if (!Array.isArray(player_ids) || !player_ids.length)
    throw new ApiError(400, "player_ids must be an array");

  const squad = await Squad.findByTeamTournamentId({ tournament_id, team_id });
  console.log(squad);
  if (!squad.squad_id)
    throw new ApiError(
      `squad with tournament id ${tournament_id} and team id ${team_id} not found`
    );
  let newTuples = [];
  let alreadyExists = [];

  for (let i = 0; i < player_ids.length; i++) {
    let player_id = await SquadTeamPlayers.findByTeamPlayerSquadId({
      player_id: requestedFields.player_ids[i],
      squad_id: squad.squad_id,
    });

    if (!player_id?.player_id)
      newTuples.push(
        await SquadTeamPlayers.create({
          player_id: requestedFields.player_ids[i],
          squad_id: squad.squad_id,
        })
      );
    else alreadyExists.push(player_id);
  }

  console.log(newTuples);

  return res
    .status(201)
    .send(
      new ApiResponse(
        201,
        { newTuples, alreadyExists },
        "players added successfully in team_players"
      )
    );
});

const updateSquadTeamPlayer = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const validFields = ["player_id", "team_id", "tournament_id", "status"];
  const { players } = req.body;

  players.forEach((player) => {
    const { invalidFields, missingFields } = fieldValidator(
      validFields,
      player
    );

    if (invalidFields.length || missingFields.length)
      throw new ApiError(400, { invalidFields, missingFields });
  });

  for (const player of players) {
    await SquadTeamPlayers.updateByTeamTourId(player);
  }

  return res
    .status(200)
    .send(new ApiResponse(200, {}, "squad with player updated successfully"));
});

module.exports = {
  getSquadPlayers,
  createSquadTeamPlayer,
  addSquadTeamPlayerByTourTeamIds,
  updateSquadTeamPlayer,
};
