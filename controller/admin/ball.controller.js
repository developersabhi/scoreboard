const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { asyncHandler } = require("../../utils/asyncHandler.utils");
const { fieldValidator } = require("../../utils/fieldValidator.utils");
const { Balls } = require("../../models/app/balls.model");
const { redisClient } = require("../../lib/utils/RedisClient");
const { undoRedo } = require("../../lib/utils/undoRedo");

// const createBall = asyncHandler(async (req, res) => {
//   if (!req.user || !req.user?.user_id)
//     throw new ApiError(401, "unauthroized user");

//   if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

//   const validFields = [
//     "inning",
//     "total_runs",
//     "match_id",
//     "bowled_by",
//     "played_by",
//     "sup_ply_id",
//     "ball_no",
//     "wicket_taken",
//     "ball_type",
//   ];
//   const requestedFields = req.body;

//   const { invalidFields, missingFields } = fieldValidator(
//     validFields,
//     requestedFields
//   );

//   if (invalidFields.length || missingFields.length)
//     throw new ApiError(400, { invalidFields, missingFields });

//   if (
//     requestedFields.bowled_by == requestedFields.played_by ||
//     requestedFields.played_by == requestedFields.sup_ply_id ||
//     requestedFields.bowled_by == requestedFields.sup_ply_id
//   )
//     throw new ApiError(400, "bowled_by, played_by, sup_ply_id cannot be same");

//   const ballExists = await Balls.findBall(requestedFields);

//   if (ballExists) throw new ApiError(409, "ball already exists");

//   const newBall = await Balls.create(requestedFields);

//   if (!newBall) throw new ApiError(500, "unable to create new team");

//   return res
//     .status(201)
//     .send(new ApiResponse(201, newBall, "new team created successfully"));
// });

const updateBall = asyncHandler(async (req, res) => {
  if (!req.user || !req.user?.user_id)
    throw new ApiError(401, "unauthroized user");

  if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

  const { ball_id } = req.params;

  if (!ball_id) throw new ApiError(400, "ball_id is invalid or not sent");

  const validFields = [
    "inning",
    "total_runs",
    "match_id",
    "bowler_id",
    "stricker_id",
    "non_stricker_id",
    "sup_ply_id",
    "ball_no",
    "wicket_taken",
    "ball_type",
  ];
  let requestedFields = req.body;

  const { invalidFields } = fieldValidator(validFields, requestedFields);

  if (invalidFields.length) throw new ApiError(400, invalidFields);

  // TODO: must be updated with valid case
  if (
    requestedFields?.bowler_id == requestedFields?.stricker_id ||
    requestedFields?.stricker_id == requestedFields?.non_stricker_id ||
    requestedFields?.stricker_id == requestedFields?.sup_ply_id
  )
    throw new ApiError(400, "bowler_id, played_by, sup_ply_id cannot be same");

  if (
    requestedFields?.wicket_taken === true &&
    requestedFields.ball_type !== "NORMAL"
  )
    throw new ApiError(400, "if wicket taken ball_type must be normal");

  const ballExists = await Balls.findById(ball_id);

  if (!ballExists) throw new ApiError(404, "ball with ball_id not found");

  if (!requestedFields?.sup_ply_id && !ballExists.sup_ply_id)
    requestedFields = { ...requestedFields, sup_ply_id: null };

  const updatedBall = await Balls.update(ball_id, requestedFields);

  if (!updatedBall) throw new ApiError(500, "unable to update ball");

  return res
    .status(200)
    .send(
      new ApiResponse(200, updatedBall, "association updated successfully")
    );
});

const addBall = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user?.user_id)
      throw new ApiError(401, "unauthroized user");

    if (req.role !== "ADMIN") throw new ApiError(403, "forbidden request");

    const data = req.body;

    const validFields = [
      "inning",
      "total_runs",
      "match_id",
      "bowler_id",
      "stricker_id",
      "non_stricker_id",
      "sup_ply_id",
      "ball_no",
      "wicket_taken",
      "ball_type",
      "run_type",
    ];

    const { missingFields, invalidFields } = fieldValidator(validFields, data);

    if (invalidFields.length || missingFields.length)
      throw new ApiError(400, { ...invalidFields, ...missingFields });

    if (
      data.bowler_id === data.stricker_id ||
      data.stricker_id === data.sup_ply_id ||
      data.bowler_id === data.sup_ply_id
    )
      throw new ApiError(
        400,
        "bowled_by, played_by, sup_ply_id cannot be same"
      );

    const ballExists = await Balls.findBall(data);
    if (ballExists) throw new ApiError(409, "ball already exists");

    const newBall = await Balls.create(data);
    if (!newBall) throw new ApiError(500, "unable to create ball");

    let overNo = Math.floor(newBall.ball_no / 6);
    let overKey = `scoreboard:match_${newBall.match_id}:over_${overNo}:ball_${newBall.ball_no}`;
    await redisClient.setDataToRedis(overKey, newBall);

    res.status(201).json({ message: "Ball added successfully", ball: newBall });

    // Optionally handle Redis storage if needed
  } catch (error) {
    console.error("Error occurred during add ball:", error.message);
    res.status(500).json({ message: error.message });
  }
});

const update = asyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user?.user_id) {
      return res.status(403).json({ message: "FORBIDDEN REQUEST" });
    }

    const data = req.body;
    console.log(req.user.id, data);

    const validFields = [
      "ball_id",
      "inning",
      "total_runs",
      "match_id",
      "bowler_id",
      "stricker_id",
      "non_stricker_id",
      "sup_ply_id",
      "ball_no",
      "wicket_taken",
      "ball_type",
      "run_type",
    ];

    const { invalidFields } = fieldValidator(validFields, data);

    if (invalidFields.length) {
      return res.status(400).json({ message: invalidFields.join(", ") });
    }

    const ballExists = await Balls.findById(data.ball_id);

    if (!ballExists) {
      return res.status(404).json({ message: "Ball not found to update" });
    }

    const updated = await Balls.update(data.ball_id, data);

    if (!updated?.ball_id) {
      return res.status(500).json({ message: "Unable to update ball" });
    }

    res
      .status(200)
      .json({ message: "Ball updated successfully", ball: updated });

    await undoRedo.pushToUndoStack("balls", updated.ball_id, updated);

    let overNo = Math.floor(updated.ball_no / 6);
    let overKey = `scoreboard:match_${updated.match_id}:over_${overNo}:ball_${updated.ball_no}`;
    await redisClient.setDataToRedis(overKey, updated);
  } catch (error) {
    console.error("Error occurred during update ball:", error.message);
    res.status(500).json({ message: error.message });
  }
});

const undoBall = asyncHandler(async (req, res) => {
  try {
    const { ball_id } = req.params;
    const previousState = await undoRedo.popFromUndoStack("balls", ball_id);

    if (previousState) {
      const currentState = await Balls.findById(ball_id);

      let resp = await undoRedo.pushToRedoStack("balls", ball_id, currentState);

      const updated = await Balls.update(ball_id, previousState);

      if (!updated) {
        return res.status(500).json({ message: "Undo failed" });
      }

      let overNo = Math.floor(updated.ball_no / 6);
      let overKey = `scoreboard:match_${updated.match_id}:over_${overNo}:ball_${updated.ball_no}`;
      await redisClient.setDataToRedis(overKey, updated);

      return res
        .status(200)
        .json({ message: "Ball state reverted successfully", ball: updated });
    } else {
      return res
        .status(404)
        .json({ message: "No previous state found to undo" });
    }
  } catch (error) {
    console.error("Error occurred during undo ball:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

const redoBall = asyncHandler(async (req, res) => {
  try {
    const { ball_id } = req.params; // Get ball_id from request body
    const previousState = await undoRedo.popFromRedoStack("balls", ball_id);
    console.log("previousState:", previousState);

    if (previousState) {
      const currentState = await Balls.findById(ball_id);
      console.log("currentState:", currentState);

      await undoRedo.pushToUndoStack("balls", ball_id, currentState);

      const updated = await Balls.update(ball_id, previousState);
      console.log("Updated state:", updated);
      if (!updated) {
        return res.status(500).json({ message: "Redo failed" });
      }

      let overNo = Math.floor(updated.ball_no / 6);
      let overKey = `scoreboard:match_${updated.match_id}:over_${overNo}:ball_${updated.ball_no}`;
      await redisClient.setDataToRedis(overKey, updated);

      // Respond with the updated ball data
      return res
        .status(200)
        .json({ message: "Ball state redone successfully", ball: updated });
    } else {
      return res
        .status(404)
        .json({ message: "No previous state found to redo" });
    }
  } catch (error) {
    console.error("Error occurred during redo ball:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

module.exports = {
  // createBall,
  updateBall,
  addBall,
  update,
  undoBall,
  redoBall,
};
