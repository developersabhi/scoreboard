const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");
const { TournamentTeams } = require("../../models/app/tournamentTeams.model");

const getTournamentTeams = asyncHandler(async (req, res) => {
  const { tournament_id } = req.query;

  if (!tournament_id)
    throw new ApiError(400, "tournament_id not sent or invalid");

  const teams = await TournamentTeams.fetchTeamByTournamentId(tournament_id);

  return res
    .status(200)
    .send(
      new ApiResponse(200, teams, "tournament's teamIds fetched successfully")
    );
});

const addTeamToTournamet = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const validFields = ["team_id", "tournament_id"];
  const { tournament_id, team_id } = req.body;

  const { invalidFields, missingFields } = fieldValidator(validFields, {
    tournament_id,
    team_id,
  });

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  const tournamentwithTeamExists = await TournamentTeams.findByTeamId({
    tournament_id,
    team_id,
  });

  if (tournamentwithTeamExists.length)
    throw new ApiError(409, "team already exists with tournament");

  const addedTeam = await TournamentTeams.create({ tournament_id, team_id });

  if (!addedTeam) throw new ApiError(500, "unable to add team to tournament");

  return res
    .status(201)
    .send(
      new ApiResponse(
        201,
        addedTeam,
        "new team added to tournament successfully"
      )
    );
});

const updateTeamOfTournament = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const validFields = ["tournament_id", "team_id", "status"];
  const { teams } = req.body;

  if (!Array.isArray(teams)) throw new ApiError(400, "teams must be an array");

  teams.forEach((team) => {
    const { invalidFields, missingFields } = fieldValidator(validFields, team);

    if ((invalidFields.length, missingFields.length))
      throw new ApiError(400, { invalidFields, missingFields });
  });

  for (let i = 0; i < teams.length; i++) {
    await TournamentTeams.updateByTmTourId(teams[i]);
  }

  return res
    .status(200)
    .send(new ApiResponse(201, {}, "tournament_teams updated successfully"));
});

const deleteTournamentTeam = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const { tournament_team_id } = req.params;

  if (!tournament_team_id)
    throw new ApiError(400, "tournament_team_id in not valid or not sent");

  const tournamentTeam = await TournamentTeams.delete(tournament_team_id);

  if (tournamentTeam) throw new ApiError(400, "unable to delete player");

  return res
    .status(200)
    .send(
      new ApiResponse(
        204,
        tournamentTeam,
        "tournamentTeam deleted successfully"
      )
    );
});

module.exports = {
  getTournamentTeams,
  addTeamToTournamet,
  updateTeamOfTournament,
  deleteTournamentTeam,
};
