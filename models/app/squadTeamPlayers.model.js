const { pool } = require("../../db/dbConnect");

class SquadTeamPlayers {
  static async create({ player_id, squad_id }) {
    const query = `INSERT INTO squad_team_players (player_id, squad_id) VALUES (?, ?)`;
    const [result] = await pool.execute(query, [player_id, squad_id]);
    return await this.findById(result.insertId);
  }

  static async findById(squadTeamPlayerId) {
    const [rows] = await pool.execute(
      `SELECT * FROM squad_team_players WHERE sq_tm_ply_id = ? AND is_deleted = false`,
      [squadTeamPlayerId]
    );
    return rows[0];
  }

  findBySquadId;

  static async findBySquadId(squad_id) {
    const [rows] = await pool.execute(
      `SELECT * FROM squad_team_players WHERE squad_id = ? AND is_deleted = false`,
      [squad_id]
    );
    return rows;
  }

  static async findByTeamPlayerSquadId({ player_id, squad_id }) {
    const [rows] = await pool.execute(
      `SELECT * FROM squad_team_players WHERE player_id = ? AND squad_id = ? AND is_deleted = false`,
      [player_id, squad_id]
    );
    return rows[0];
  }

  static async update(squadTeamPlayerId, squadTeamPlayerData) {
    const { player_id, squad_id } = squadTeamPlayerData;
    let [res] = await pool.execute(
      `UPDATE squad_team_players SET player_id = ?, squad_id = ? WHERE sq_tm_ply_id = ?`,
      [player_id, squad_id, squadTeamPlayerId]
    );
    if (res.affectedRows) res = await this.findById(squadTeamPlayerId);
    return res;
  }

  static async updateByTeamTourId({
    player_id,
    team_id,
    tournament_id,
    status,
  }) {
    await pool.execute(
      `update squad_team_players set is_deleted = ? where player_id = ? and squad_id = (select squad_id from squad where team_id = ? and tournament_id = ?)`,
      [status, player_id, team_id, tournament_id]
    );
  }

  static async delete(squadTeamPlayerId) {
    await pool.execute(
      `UPDATE squad_team_players SET is_deleted = true WHERE sq_tm_ply_id = ?`,
      [squadTeamPlayerId]
    );
  }
}

module.exports = { SquadTeamPlayers };
