const redis = require("redis");

class RedisClient {
  connection;
  constructor() {
    this.initRedis();
  }

  async initRedis() {
    this.connection = redis.createClient({
      url: "redis://localhost:6379",
    });

    await this.connection.connect();
  }

  async getDataFromRedis(key) {
    if (!this.connection) await this.initRedis();

    if (this.connection) {
      let res = await this.connection.get(key);

      return JSON.parse(res);
    } else return null;
  }

  async setDataToRedis(key, data, ttl = 3600) {
    if (!this.connection) await this.initRedis();

    if (this.connection) {
      data = JSON.stringify(data);
      let res = await this.connection.set(key, data, { EX: ttl });

      return res;
    } else return 0;
  }

  async delDataFromRedis(key) {
    if (!this.connection) await this.initRedis();

    if (this.connection) {
      let res = await this.connection.del(key);

      return res;
    } else return null;
  }

  async pushToList(key, data) {
    if (!this.connection) await this.initRedis();

    if (this.connection) {
      let res = await this.connection.lPush(key, data);

      return res;
    } else return null;
  }

  async popFromList(key) {
    if (!this.connection) await this.initRedis();

    if (this.connection) {
      let res = await this.connection.rpop(key);

      return res;
    } else return null;
  }
}

let redisClient = new RedisClient();
module.exports = { RedisClient, redisClient };
