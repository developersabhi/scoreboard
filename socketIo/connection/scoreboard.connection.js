const { fieldValidator } = require("../../utils/fieldValidator.utils");
const { redisClient } = require("../../lib/utils/RedisClient");
const { socketAuth } = require("../middlewares/socketAuth.middleware");
const { Balls } = require("../../models/app/balls.model");
const crypto = require("crypto");
const { undoRedo } = require("../../lib/utils/undoRedo");
const { Matches } = require("../../models/app/match.model");

class Scoreboard {
  io;
  roles = ["ADMIN", "MANAGER", "AGENT"];
  matchListKey = `scoreboard:liveMatches`;

  constructor(namespace) {
    this.io = namespace;

    this.io.on("connection", this.onConnect.bind(this));
  }

  async onConnect(clientSocket) {
    console.log("clientsocket ", clientSocket.id);

    clientSocket.on("LIVE_MATCHES", this.liveMatches.bind(this, clientSocket));
    clientSocket.on("JOIN_ROOM", this.joinRoom.bind(this, clientSocket));

    socketAuth(clientSocket);

    clientSocket.on("ADD_BALL", this.addBall.bind(this, clientSocket));
    clientSocket.on("UPDATE_BALL", this.updateBall.bind(this, clientSocket));
    clientSocket.on("UNDO_BALL", this.undoBall.bind(this, clientSocket));
    clientSocket.on("REDO_BALL", this.redoBall.bind(this, clientSocket));
  }

  async liveMatches(clientSocket) {
    try {
      let matchList = await redisClient.getDataFromRedis(this.matchListKey);

      if (!matchList?.length) {
        matchList = await Matches.fetchLiveMatches();
        await redisClient.setDataToRedis(this.matchListKey, matchList);
      }

      console.log("matchList", matchList);
      clientSocket.emit("MESSAGE", matchList);
      return;
    } catch (error) {
      console.error("error during liveMatches", error.message);
    }
  }

  async joinRoom(clientSocket, data) {
    try {
      if (!data?.roomId?.length && !data?.roomId) {
        clientSocket.emit("ERROR", "no room id found");
        return;
      }

      clientSocket.join(data.roomId);

      clientSocket.data.joinedRooms = [...clientSocket.rooms];
      console.log(clientSocket.data);

      clientSocket.emit("MESSAGE", {
        roomsJoined: [...clientSocket.rooms],
      });

      clientSocket
        .in([...clientSocket.rooms])
        .emit("MESSAGE", "USER WITH ID :" + clientSocket.id + " joined");
      console.log([...clientSocket.rooms]);
    } catch (error) {
      console.error("error during joinroom", error?.message);
    }
  }

  async addBall(clientSocket, data) {
    try {
      if (!this.roles.includes(clientSocket.data?.userData?.role))
        throw new Error("FORBIDDEN REQUEST");

      console.log(clientSocket.id, data);

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

      const { missingFields, invalidFields } = fieldValidator(
        validFields,
        data
      );

      if (invalidFields.length || missingFields.length)
        throw new Error(`${(invalidFields, missingFields)}`);

      // TODO : MUST BE VALIDATED WITH CORRECT CONDITIONS
      // if (
      //   data.bowled_by == data.played_by ||
      //   data.played_by == data.sup_ply_id ||
      //   data.bowled_by == data.sup_ply_id
      // )
      //   throw new Error("bowled_by, played_by, sup_ply_id cannot be same");

      const ballExists = await Balls.findBall(data);
      if (ballExists) throw new Error("ball already exists");

      const newBall = await Balls.create(data);

      if (!newBall) throw new Error("unable to create new team");

      clientSocket.to([...clientSocket.rooms]).emit("MESSAGE", newBall);

      clientSocket.emit("MESSAGE", "ball added successfully");

      // let ballKey = `scoreboard:${newBall?.match_id}:balls:${newBall?.ball_no}`; // string
      // await redisClient.setDataToRedis(ballKey, newBall);

      let overNo = parseInt(newBall?.ball_no / 6);
      let overKey = `scoreboard:match_${newBall?.match_id}:over_${overNo}:ball_${newBall?.ball_no}`; // list for ball 0-5,6-11..., etc.
      await redisClient.setDataToRedis(overKey, newBall);

      return;
    } catch (error) {
      console.error("error occured during add ball", error);
      clientSocket.emit("ERROR", error.message);
      return;
    }
  }

  async updateBall(clientSocket, data) {
    try {
      if (!this.roles.includes(clientSocket.data?.userData?.role))
        throw new Error("FORBIDDEN REQUEST");

      console.log(clientSocket.id, data);

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

      if (invalidFields.length)
        throw new Error(invalidFields.join(",").toString());

      const ballExists = await Balls.findById(data.ball_id);

      if (!ballExists) throw new Error("ball not found to update");

      const updated = await Balls.update(data.ball_id, data);

      if (!updated?.ball_id) throw new Error("unable to update ball");

      clientSocket.to([...clientSocket.rooms]).emit("MESSAGE", updated);
      clientSocket.emit("MESSAGE", "ball updated successfully");

      await undoRedo.pushToUndoStack("balls", updated.ball_id, updated);

      let overNo = parseInt(updated?.ball_no / 6);
      let overKey = `scoreboard:match_${updated?.match_id}:over_${overNo}:ball_${updated?.ball_no}`; // list for ball 0-5,6-11..., etc.
      await redisClient.setDataToRedis(overKey, updated);

      // await undoRedo.popFromRedoStack("balls", ballExists.ball_id);
      return;
    } catch (error) {
      console.error("error occured during update ball", error?.message);
      clientSocket.emit("ERROR", error.message);
      return;
    }
  }

  async undoBall(clientSocket, { ball_id }) {
    try {
      const previousState = await undoRedo.popFromUndoStack("balls", ball_id);

      if (previousState) {
        const currentState = await Balls.findById(ball_id);
        console.log("currentState uno", currentState);

        let resp = await undoRedo.pushToRedoStack(
          "balls",
          ball_id,
          currentState
        );
        console.log("resp", resp);

        let updated = await Balls.update(ball_id, previousState);
        console.log("updated-----------", updated);

        if (!updated) throw new Error("undo failed");

        clientSocket.to([...clientSocket.rooms]).emit("MESSAGE", updated);

        let overNo = parseInt(updated?.ball_no / 6);
        let overKey = `scoreboard:match_${updated?.match_id}:over_${overNo}:ball_${updated?.ball_no}`; // list for ball 0-5,6-11..., etc.
        await redisClient.setDataToRedis(overKey, updated);

        clientSocket.emit("MESSAGE", updated);

        return;
      } else {
        clientSocket.emit("ERROR", "no previous state found to undo");
        return;
      }
    } catch (error) {
      console.error("error occured during undo ball", error?.message);
      clientSocket.emit("ERROR", error.message);
      return;
    }
  }

  async redoBall(clientSocket, { ball_id }) {
    try {
      const previousState = await undoRedo.popFromRedoStack("balls", ball_id);
      console.log("previousState", previousState);

      if (previousState) {
        let currentState = await Balls.findById(ball_id);
        console.log("currentState---------", currentState);

        await undoRedo.pushToUndoStack("balls", ball_id, currentState);

        let updated = await Balls.update(ball_id, previousState);
        console.log("updated---------", updated);
        if (!updated) throw new Error("redo failed");

        clientSocket.to([...clientSocket.rooms]).emit("MESSAGE", updated);

        let overNo = parseInt(updated?.ball_no / 6);
        let overKey = `scoreboard:match_${updated?.match_id}:over_${overNo}:ball_${updated?.ball_no}`; // list for ball 0-5,6-11..., etc.
        await redisClient.setDataToRedis(overKey, updated);

        clientSocket.emit("MESSAGE", updated);

        return;
      } else {
        clientSocket.emit("ERROR", "no previous state found to redo");
        return;
      }
    } catch (error) {
      console.error("error occured during redo ball", error?.message);
      clientSocket.emit("ERROR", error.message);
      return;
    }
  }
}

module.exports = {
  Scoreboard,
};
