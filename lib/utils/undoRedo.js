const { RedisClient } = require("./RedisClient");

class UndoRedo extends RedisClient {
  constructor() {
    super();
  }

  async pushToUndoStack(entity, id, previousState) {
    await this.initRedis();

    const key = `scoreboard:${entity}:undo:${id}`;
    await this.connection.lPush(key, JSON.stringify(previousState));
  }

  async pushToRedoStack(entity, id, currentState) {
    const key = `scoreboard:${entity}:redo:${id}`;
    await this.connection.lPush(key, JSON.stringify(currentState));
  }

  async popFromUndoStack(entity, id) {
    const key = `scoreboard:${entity}:undo:${id}`;
    const state = await this.connection.lPop(key);
    return state ? JSON.parse(state) : null;
  }

  async popFromRedoStack(entity, id) {
    const key = `scoreboard:${entity}:redo:${id}`;
    const state = await this.connection.lPop(key);
    return state ? JSON.parse(state) : null;
  }
}

const undoRedo = new UndoRedo();

module.exports = {
  UndoRedo,
  undoRedo,
};
