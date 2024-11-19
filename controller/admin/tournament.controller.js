const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");
const { Tournament } = require("../../models/app/tournament.model");
const { TournamentTeams } = require("../../models/app/tournamentTeams.model");

const getTournaments = asyncHandler(async (req, res) => {
  const tournaments = await Tournament.find();

  return res
    .status(200)
    .send(
      new ApiResponse(200, tournaments, "tournaments fetched successfully")
    );
});

const getTournamentPlayers = asyncHandler(async (req, res) => {
  const { tournament_id } = req.query;
  const tournamentPlayers = await Tournament.fetchTournamentPlayers(
    tournament_id
  );

  const formattedData = Object.values(
    tournamentPlayers.reduce((result, player) => {
      const { team_id, player_id, player_name, status, team_name } = player;

      if (!result[team_id]) {
        result[team_id] = {
          team_id,
          team_name,
          players: [],
        };
      }

      result[team_id].players.push({
        player_name: player_name.trim(),
        player_id,
        status,
      });

      return result;
    }, {})
  );
  console.log(formattedData);

  return res
    .status(200)
    .send(new ApiResponse(200, formattedData, "data fetched successfully"));
});

const createTournament = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const validFields = [
    "name",
    "gender_type",
    "format_type",
    "start_date",
    "end_date",
    "tournament_type",
    "teams",
  ];
  let requestedFields = req.body;

  const { invalidFields, missingFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  if (!Array.isArray(req.body["teams"]))
    throw new ApiError(400, "teams must be an array");

  if (requestedFields.format_type === "T20")
    requestedFields["num_of_innings"] = "2";
  else requestedFields["num_of_innings"] = "4";

  const tournamentExists = await Tournament.findTournamentExists(
    requestedFields
  );

  let newTournament;
  if (!tournamentExists) {
    newTournament = await Tournament.create(requestedFields);
  } else newTournament = tournamentExists;

  if (!newTournament)
    throw new ApiError(500, "unable to create new tournament");

  let newTuples = [];
  let teamAlreadyExists = [];

  for (let i = 0; i < requestedFields.teams.length; i++) {
    let tupleExists = await TournamentTeams.findByTeamTourId({
      tournament_id: newTournament.tournament_id,
      team_id: requestedFields.teams[i].team_id,
    });
    console.log(newTournament.tournament_id, requestedFields.teams[i].team_id);

    if (tupleExists.length) {
      tupleExists.forEach((tuple) => {
        teamAlreadyExists.push(tuple);
      });
    } else {
      let res = await TournamentTeams.createTourTeamAndSquad({
        team_id: requestedFields.teams[i].team_id,
        tournament_id: newTournament.tournament_id,
        is_deleted: requestedFields.teams[i].status,
      });
      newTuples.push(res);
    }
  }

  return res
    .status(201)
    .send(
      new ApiResponse(
        201,
        { newTournament, newTuples, teamAlreadyExists },
        "new tournament created successfully"
      )
    );
});

const updateTournament = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const { tournament_id } = req.params;

  if (!tournament_id) throw new ApiError(404, "team_id is invalid or not sent");

  const validFields = [
    "name",
    "gender_type",
    "format_type",
    "start_date",
    "end_date",
    "tournament_type",
    "teams",
  ];

  const requestedFields = req.body;

  const { invalidFields } = fieldValidator(validFields, requestedFields);

  if (invalidFields.length) throw new ApiError(400, invalidFields);

  if (requestedFields.format_type === "T20")
    requestedFields["num_of_innings"] = "2";
  else requestedFields["num_of_innings"] = "4";

  const updatedTournament = await Tournament.update(
    tournament_id,
    requestedFields
  );

  if (!updateTournament)
    throw new ApiError(404, "tournament not found to update");

  for (let i = 0; i < requestedFields?.teams?.length; i++) {
    await TournamentTeams.updateByTmTourId({
      tournament_id,
      team_id: requestedFields.teams[i].team_id,
      is_deleted: requestedFields.teams[i].status,
    });
  }

  return res.status(201).send(
    new ApiResponse(
      201,
      {
        ...updatedTournament,
      },
      "tournament updated successfully"
    )
  );
});

const createTournament1 = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const validFields = [
    "name",
    "gender_type",
    "format_type",
    "start_date",
    "end_date",
    "tournament_type",
    "teams",
  ];
  let requestedFields = req.body;

  const { invalidFields, missingFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  if (!Array.isArray(req.body["teams"]))
    throw new ApiError(400, "teams must be an array");

  if (requestedFields.format_type === "T20")
    requestedFields["num_of_innings"] = "2";
  else requestedFields["num_of_innings"] = "4";

  const tournamentExists = await Tournament.findTournamentExists(
    requestedFields
  );

  if (tournamentExists) throw new ApiError(409, "tournament already exists");

  const newTournament = await Tournament.create(requestedFields);

  if (!newTournament)
    throw new ApiError(500, "unable to create new tournament");

  let newTuples = [];

  for (let i = 0; i < requestedFields.teams.length; i++) {
    let res = await TournamentTeams.createTourTeamAndSquad({
      team_id: requestedFields.teams[i].team_id,
      tournament_id: newTournament.tournament_id,
      is_deleted: requestedFields.teams[i].status,
    });
    newTuples.push(res);
  }

  return res
    .status(201)
    .send(
      new ApiResponse(
        201,
        { ...newTournament, teams: newTuples },
        "new tournament created successfully"
      )
    );
});

const softDeleteTournament = asyncHandler(async (req, res) => {
  const { tournament_id } = req.params;

  await Tournament.delete(tournament_id);
  return res
    .status(200)
    .send(new ApiResponse(200, {}, "tournament deleted successfully"));
});

module.exports = {
  getTournaments,
  createTournament,
  updateTournament,
  getTournamentPlayers,
  softDeleteTournament,
  createTournament1,
};
