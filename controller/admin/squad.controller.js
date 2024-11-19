const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");
const { Squad } = require("../../models/app/squad.model");
const { TournamentTeams } = require("../../models/app/tournamentTeams.model");

const getSquads = asyncHandler(async (req, res) => {
  const squads = await Squad.find();

  return res
    .status(200)
    .send(new ApiResponse(200, squads, "squads fetched successfully"));
});

const getTournamentSquads = asyncHandler(async (req, res) => {
  const { tournament_id } = req.query;

  if (!tournament_id)
    throw new ApiError(400, "tournament_id not sent or invalid");

  const squadIds = await Squad.findByTournamentId(tournament_id);

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        squadIds,
        "tournament's squadIds fetched successfully"
      )
    );
});

const addSquadInTournament = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const validFields = ["team_ids", "tournament_id"];
  const { tournament_id, team_ids } = req.body;

  if (!Array.isArray(team_ids))
    throw new ApiError(400, "team_ids must be an array");

  const { invalidFields, missingFields } = fieldValidator(validFields, {
    tournament_id,
    team_ids,
  });

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  const tournamentTeams = await TournamentTeams.fetchTeamIdByTournamentId(
    tournament_id
  );

  let teamids = [];

  tournamentTeams.forEach(({ team_id }) => {
    teamids.push(team_id);
  });

  team_ids.forEach((team_id) => {
    if (!teamids.includes(parseInt(team_id)))
      throw new ApiError(400, "team doesn't exists in tournament");
  });

  let alreadyExists = [];
  let squads = [];

  for (let i = 0; i < team_ids.length; i++) {
    if (
      await Squad.findByTeamTournamentId({
        tournament_id,
        team_id: team_ids[i],
      })
    )
      alreadyExists.push(team_ids[i]);
    else
      squads.push(await Squad.create({ tournament_id, team_id: team_ids[i] }));
  }

  return res
    .status(201)
    .send(
      new ApiResponse(
        201,
        { squads, alreadyExists },
        "new squad created successfully"
      )
    );
});

const updateSquad = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const { squad_id } = req.params;

  if (!squad_id) throw new ApiError(400, "squad_id is invalid or not sent");

  const validFields = ["tournament_id", "team_id"];
  const { tournament_id, team_id } = req.body;

  const { invalidFields } = fieldValidator(validFields, {
    tournament_id,
    team_id,
  });

  if (invalidFields.length) throw new ApiError(400, invalidFields);

  const squadWithIdExists = await Squad.findById(squad_id);

  if (!squadWithIdExists)
    throw new ApiError(404, "tuple with squad_id not found");

  const updatedTuple = await Squad.update(squad_id, {
    tournament_id,
    team_id,
  });

  return res
    .status(201)
    .send(new ApiResponse(201, updatedTuple, "squad updated successfully"));
});

const deleteSquad = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const { squad_id } = req.params;

  if (!squad_id) throw new ApiError(400, "squad_id in not valid or not sent");

  const squad = await Squad.delete(squad_id);

  if (squad) throw new ApiError(400, "unable to delete squad");

  return res
    .status(200)
    .send(new ApiResponse(204, squad, "squad deleted successfully"));
});

module.exports = {
  getSquads,
  getTournamentSquads,
  addSquadInTournament,
  updateSquad,
  deleteSquad,
};
