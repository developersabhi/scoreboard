const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");
const { Matches } = require("../../models/app/match.model");
// const fetch = require("node-fetch");
const { redisClient } = require("../../lib/utils/RedisClient");

let realDataCric, realDataZpl;

// const createMatch = asyncHandler(async (req, res) => {
//   const dataCric = await fetch(
//     "https://api.cricfast.co/user/v1/match/detail?match_key=a-rz--cricket--s71800415101111754753"
//   );

//   const dataZpl = await fetch(
//     "https://zplay1.in/sports/api/v1/events/matches/4"
//   );

//   realDataCric = await dataCric.json();
//   realDataZpl = await dataZpl.json();
//   realDataZpl = realDataZpl.data[0];

//   // Function to safely format the date for MySQL
//   const formatDateToMySQL = (date) => {
//     if (!date || isNaN(new Date(date).getTime())) {
//       return null; // return null if date is invalid
//     }
//     const d = new Date(date);
//     const yyyy = d.getFullYear();
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     const dd = String(d.getDate()).padStart(2, "0");
//     const hh = String(d.getHours()).padStart(2, "0");
//     const min = String(d.getMinutes()).padStart(2, "0");
//     const ss = String(d.getSeconds()).padStart(2, "0");
//     return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
//   };

//   console.log("cric --------------", realDataCric.data.start_at);
//   // console.log("zpl ---------------", realDataZpl);

//   // Safely parse and format match date and start time
//   const matchDateRaw = parseInt(realDataCric.data?.start_at) || null;

//   const matchDate = formatDateToMySQL(matchDateRaw);
//   const startTime = formatDateToMySQL(matchDateRaw);

//   if (!matchDate || !startTime) {
//     throw new ApiError(400, "Invalid match date or start time");
//   }

//   const filteredData = {
//     league_name: realDataZpl.league_name,
//     event_name: realDataCric.data.name,
//     event_short_name: realDataCric.data.short_name,
//     team_a: realDataCric.data.team.a,
//     team_b: realDataCric.data.team.b,
//     match_date: matchDate,
//     start_time: startTime,
//     venue: realDataCric.data.venue,
//     gender: realDataCric.data.gender,
//     format_type: realDataCric.data.format.toUpperCase(),
//     toss_winner: realDataCric.toss?.winner === "a" ? "TEAM_A" : "TEAM_B",
//     inning_started_by: realDataCric.toss?.winner === "a" ? "TEAM_A" : "TEAM_B",
//     toss_result: "HEAD", // assuming "HEAD" for now
//     toss_winner_selected:
//       realDataCric.toss?.elected === "bat" ? "BATTING" : "BALLING",
//     is_live: true,
//   };

//   const validFields = [
//     "league_name",
//     "event_name",
//     "event_short_name",
//     "team_a",
//     "team_b",
//     "match_date",
//     "start_time",
//     "venue",
//     "gender",
//     "format_type",
//     "toss_winner",
//     "inning_started_by",
//     "toss_winner_selected",
//     "toss_result",
//     "is_live",
//   ];

//   const data = filteredData;

//   const { invalidFields, missingFields } = fieldValidator(validFields, data);

//   if (invalidFields.length || missingFields.length)
//     throw new ApiError(400, { invalidFields, missingFields });

//   const matchExists = await Matches.find(data);
//   if (matchExists) throw new ApiError(409, "match already exists");

//   const id = await Matches.create(filteredData);

//   if (!id) throw new ApiError(500, "unable to create match");

//   return res
//     .status(201)
//     .send(new ApiResponse(201, id, "match created successfully"));
// });

const getMatches = asyncHandler(async (req, res) => {
  const matches = await Matches.fetch();

  return res
    .status(200)
    .send(new ApiResponse(200, matches, "matches fetched successfully"));
});

const getTodaysMatches = asyncHandler(async (req, res) => {
  const result = await Matches.fetchTodaysMatches();
  return res
    .status(200)
    .send(new ApiResponse(200, result, "today's matches fetched successfully"));
});

const getTomarroMatches = asyncHandler(async (req, res) => {
  const result = await Matches.fetchTomarrowMatches();

  return res
    .status(200)
    .send(new ApiResponse(200, result, "tomorrow's matches fetched successfully"));
});


const getLiveMatches = asyncHandler(async (req, res) => {
  const result = await Matches.fetchLiveMatches();
  return res
    .status(200)
    .send(new ApiResponse(200, result, "live matches fetched successfully"));
});

const getAllMatches = asyncHandler(async (req, res) => {
  const result = await Matches.fetch();
  return res
    .status(200)
    .send(new ApiResponse(200, result, "all matches fetched successfully"));
});

const getSingleMatch = asyncHandler(async (req, res) => {
  const { match_id } = req.query;

  if (!match_id) throw new ApiError(400, "no match id selected");

  const match = await Matches.findById(match_id);

  return res
    .status(200)
    .send(new ApiResponse(200, match, "match data fetched successfully"));
});

const getMatchesByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) throw new ApiError(400, "date not sentor is invalid");
  const matches = await Matches.fetchMatchByDate(date);

  return res
    .status(200)
    .send(
      new ApiResponse(200, matches, "matches by date fetched successfully")
    );
});

const createMatch = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const validFields = [
    "event_name",
    "squad_a",
    "squad_b",
    "tournament_id",
    "match_date",
    "start_time",
    "venue",
  ];

  const requestedFields = ({} = req.body);

  const { invalidFields, missingFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { ...invalidFields, ...missingFields });

  const match = await Matches.create(requestedFields);

  if (!match) throw new ApiError(500, "unable to create match");

  return res
    .status(200)
    .send(new ApiResponse(201, match, "match created successfully"));
});

const toggleMatchStatus = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN" && req.role !== "MANAGER")
    throw new ApiError(403, "forbidden request");

  const { match_id } = req.params;
  const { status } = req.query;

  const result = await Matches.toggleStatus({ match_id, status });

  let matchExists = await Matches.findById(match_id);

  if (!matchExists) throw new ApiError(404, "match with id not found");

  let matchKey = `scoreboard:liveMatchInfo:${match_id}`;

  if (matchExists?.is_live) {
    await redisClient.setDataToRedis(matchKey, matchExists);
  } else {
    await redisClient.delDataFromRedis(matchKey);
  }

  return res
    .status(200)
    .send(new ApiResponse(200, result, "match status updated successfully"));
});

const tossUpdate = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthorized user");

  const validRoles = ["ADMIN", "MANAGER", "AGENT"];

  if (!validRoles.includes(req.role))
    throw new ApiError(403, "forbidden request");

  const { match_id } = req.params;

  if (!match_id)
    throw new ApiError(400, "invalid match_id or match_id not selected");

  const validFields = [
    "toss_winner",
    "toss_result",
    "toss_winner_selected",
    "inning_started_by",
  ];
  const requestedFields = req.body;

  const { invalidFields, missingFields } = fieldValidator(
    validFields,
    requestedFields
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  const updatedMatch = await Matches.tossUpdate(
    {
      ...requestedFields,
    },
    match_id
  );

  console.log(updatedMatch);
  if (!updatedMatch.affectedRows)
    throw new ApiError(500, "unable to make toss updates to match");

  if (updatedMatch.affectedRows) {
    let updtMth = await Matches.findById(match_id);
    let matchKey = `scoreboard:liveMatchInfo:${match_id}`;
    await redisClient.setDataToRedis(matchKey, updtMth);
  }

  return res
    .status(200)
    .send(new ApiResponse(200, updatedMatch, "toss updates made successfully"));
});

const updateMatchResult = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.user_id)
    throw new ApiError(401, "unauthroized user");

  const validRoles = ["ADMIN", "MANAGER", "AGENT"];

  if (!validRoles.includes(req.role))
    throw new ApiError(403, "forbidden request");

  const { match_id } = req.params;

  if (!match_id)
    throw new ApiError(400, "invalid match_id or match_id not selected");

  const matchData = ({ match_result, match_status } = req.body);

  const validFields = ["match_result", "match_status"];

  const { invalidFields, missingFields } = fieldValidator(
    validFields,
    matchData
  );

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { ...missingFields, ...invalidFields });

  const updatedRes = await Matches.updateMatchResult(match_id, matchData);

  if (!updatedRes)
    throw new ApiError(404, "match with match_id not found to be updated");

  return res
    .status(200)
    .send(
      new ApiResponse(200, updatedRes, "match results updated successfully")
    );
});

module.exports = {
  getTodaysMatches,
  getTomarroMatches,
  getSingleMatch,
  getMatchesByDate,
  getAllMatches,
  getLiveMatches,
  getMatches,
  createMatch,
  updateMatchResult,
  toggleMatchStatus,
  tossUpdate,
};
