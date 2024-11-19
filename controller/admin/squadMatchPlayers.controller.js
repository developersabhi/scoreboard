const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");
const {
  SquadMatchPlayers,
} = require("../../models/app/squadMatchPlayers.model");

const createSquadMatchPlayer = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const validFields = ["sq_tm_ply_ids", "match_id", "is_playing"];
  const { sq_tm_ply_ids, match_id, is_playing } = req.body;

  const { invalidFields, missingFields } = fieldValidator(validFields, {
    sq_tm_ply_ids,
    match_id,
    is_playing,
  });

  if (invalidFields.length || missingFields.length)
    throw new ApiError(400, { invalidFields, missingFields });

  if (!sq_tm_ply_ids?.length)
    throw new ApiError(400, "player_ids must be an Array");

  let newTuples = [];

  for (let i = 0; i < sq_tm_ply_ids.length; i++) {
    let player = await SquadMatchPlayers.findByStpId({
      sq_tm_ply_id: sq_tm_ply_ids[i],
      match_id,
    });

    console.log(player);

    if (!player?.match_id)
      newTuples.push(
        await SquadMatchPlayers.create({
          match_id,
          sq_tm_ply_id: sq_tm_ply_ids[i],
          is_playing,
        })
      );
  }

  console.log(newTuples);

  if (!newTuples.length)
    throw new ApiError(409, "unable to add to squad, as they already exist");

  return res
    .status(201)
    .send(
      new ApiResponse(201, newTuples, "players added to squad successfully")
    );
});

const updateSquadMatchPlayer = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const { smp_id } = req.params;

  if (!smp_id) throw new ApiError(400, "smp_id is invalid or not sent");

  const validFields = ["sq_tm_ply_id", "match_id", "is_playing"];
  const { sq_tm_ply_id, match_id, is_playing } = req.body;

  const { invalidFields } = fieldValidator(validFields, {
    sq_tm_ply_id,
    match_id,
    is_playing,
  });

  if (invalidFields.length) throw new ApiError(400, invalidFields);

  const tupleWithExists = await SquadMatchPlayers.findById(smp_id);

  if (!tupleWithExists) throw new ApiError(404, "tuple with id not found");

  const updatedTuple = await SquadMatchPlayers.update(smp_id, {
    sq_tm_ply_id,
    match_id,
    is_playing,
  });

  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        updatedTuple,
        "squad with player updated successfully"
      )
    );
});

const deleteSquadMatchPlayer = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const { smp_id } = req.params;

  if (!smp_id) throw new ApiError(400, "smp_id is invalid or not sent");

  const deletedTuple = await SquadMatchPlayers.delete(smp_id);

  if (!deletedTuple) throw new ApiError(500, "unable to delete the tuple");

  return res
    .status(200)
    .send(new ApiResponse(200, deletedTuple, "tuple deleted successfully"));
});

module.exports = {
  createSquadMatchPlayer,
  updateSquadMatchPlayer,
  deleteSquadMatchPlayer,
};
