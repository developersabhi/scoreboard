const { pool } = require("../../db/dbConnect");

class Team {
  static async create({ name, gender }) {
    const query = `INSERT INTO team (name, gender) VALUES (?, ?)`;
    const [result] = await pool.execute(query, [name, gender]);
    return await this.findById(result.insertId);
  }

  static async findById(teamId) {
    const [rows] = await pool.execute(
      `SELECT * FROM team WHERE team_id = ? AND is_deleted = false`,
      [teamId]
    );
    return rows[0];
  }

  static async findByNameAndGender(name, gender) {
    const [rows] = await pool.execute(
      `SELECT * FROM team WHERE name = ? AND gender = ? AND is_deleted = false`,
      [name, gender]
    );
    return rows[0];
  }

  static async update(teamId, teamData) {
    const { name, gender } = teamData;
    let [res] = await pool.execute(
      `UPDATE team SET name = ?, gender = ? WHERE team_id = ?`,
      [name, gender, teamId]
    );
    if (res.affectedRows) res = await this.findById(teamId);
    return res;
  }

  static async delete(teamId) {
    await pool.execute(`UPDATE team SET is_deleted = true WHERE team_id = ?`, [
      teamId,
    ]);
  }

  static async find() {
    const [rows] = await pool.execute(
      `SELECT * FROM team WHERE is_deleted= false`
    );
    return rows;
  }
}

module.exports = { Team };

`select p.team_id,p.player_id,p.name,if(isnull(stp.sq_tm_ply_id),0,1) as status from player p left join squad_team_players stp on stp.player_id=p.player_id and stp.squad_id in (select sq.squad_id from squad sq where sq.tournament_id=?) where p.team_id in (select tt.team_id from tournament_teams tt where tt.tournament_id=?);`;
