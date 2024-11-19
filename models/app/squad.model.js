const { pool } = require("../../db/dbConnect");

class Squad {
  static async create({ team_id, tournament_id }) {
    const query = `INSERT INTO squad (team_id, tournament_id) VALUES (?, ?)`;
    const [result] = await pool.execute(query, [team_id, tournament_id]);
    return await this.findById(result.insertId);
  }

  static async findById(squadId) {
    const [rows] = await pool.execute(
      `SELECT * FROM squad WHERE squad_id = ? AND is_deleted = false`,
      [squadId]
    );
    return rows[0];
  }

  static async findByTournamentId(tournament_id) {
    const [rows] = await pool.execute(
      `SELECT  t.name, t.gender,s.* FROM squad s 
      join team t on t.team_id = s.team_id
      WHERE s.is_deleted = false and t.is_deleted = false and s.tournament_id = ?`,
      [tournament_id]
    );
    return rows;
  }

  static async findByTeamTournamentId({ tournament_id, team_id }) {
    const [rows] = await pool.execute(
      `SELECT * FROM squad WHERE  tournament_id = ? AND team_id = ? `,
      [tournament_id, team_id]
    );
    return rows[0];
  }

  static async update(squadId, squadData) {
    const { team_id, tournament_id } = squadData;
    let [res] = await pool.execute(
      `UPDATE squad SET team_id = ?, tournament_id = ? WHERE squad_id = ?`,
      [team_id, tournament_id, squadId]
    );
    if (res.affectedRows) res = await this.findById(squadId);
    return res;
  }

  static async delete(squadId) {
    await pool.execute(
      `UPDATE squad SET is_deleted = true WHERE squad_id = ?`,
      [squadId]
    );
    return this.findById(squadId);
  }

  static async find() {
    const [rows] = await pool.execute(
      `SELECT  t.name, t.gender,s.* FROM squad s 
      join team t on t.team_id = s.team_id
      WHERE s.is_deleted = false and t.is_deleted = false`
    );
    return rows;
  }
}

module.exports = { Squad };
