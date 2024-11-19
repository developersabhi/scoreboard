const { pool } = require("../../db/dbConnect");

class Player {
  static async create({
    name,
    age,
    skills,
    profile_pic,
    country_id,
    team_id,
    gender,
  }) {
    const query = `INSERT INTO player (name, age, skills, profile_pic, country_id, team_id, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [
      name,
      age,
      skills,
      profile_pic,
      country_id,
      team_id,
      gender,
    ]);
    return await this.findById(result.insertId);
  }

  static async findById(playerId) {
    const [rows] = await pool.execute(
      `SELECT * FROM player WHERE player_id = ? AND is_deleted = false`,
      [playerId]
    );
    return rows[0];
  }

  static async findByTeamId(team_id) {
    const [rows] = await pool.execute(
      `SELECT * FROM player WHERE team_id = ? AND is_deleted = false`,
      [team_id]
    );
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await pool.execute(
      `SELECT * FROM player WHERE name = ? AND is_deleted = false`,
      [name]
    );
    return rows[0];
  }

  static async find() {
    const [rows] = await pool.execute(
      `SELECT t.name as team_name, p.*  FROM player p join team t on p.team_id = t.team_id WHERE p.is_deleted = false`
    );
    return rows;
  }

  static async update(playerId, playerData) {
    const { name, age, skills, gender, profile_pic, country_id, team_id } =
      playerData;

    console.log(name, age, skills, gender, profile_pic, country_id, team_id);

    let [res] = await pool.execute(
      `UPDATE player SET name = ?, age = ?, gender = ?, skills = ?, profile_pic = ?, country_id = ?, team_id = ? WHERE player_id = ?`,
      [name, age, gender, skills, profile_pic, country_id, team_id, playerId]
    );
    console.log(res);
    if (res.affectedRows) res = await this.findById(playerId);
    return res;
  }

  static async delete(playerId) {
    await pool.execute(
      `UPDATE player SET is_deleted = true WHERE player_id = ?`,
      [playerId]
    );

    return this.findById(playerId);
  }
}

module.exports = { Player };
