const { pool } = require("../../db/dbConnect");
const { Squad } = require("./squad.model");

class TournamentTeams {
  static async create({ team_id, tournament_id }) {
    const query = `INSERT INTO tournament_teams (team_id, tournament_id) VALUES (?, ?)`;
    const [result] = await pool.execute(query, [team_id, tournament_id]);
    return await this.findById(result.insertId);
  }

  static async createTourTeamAndSquad({ team_id, tournament_id, is_deleted }) {
    const query = `INSERT INTO tournament_teams (team_id, tournament_id, is_deleted) VALUES (?, ?, ?);
                  INSERT INTO squad (team_id, tournament_id, is_deleted) VALUES (?, ?, ?);`;
    const [res] = await pool.query(query, [
      team_id,
      tournament_id,
      is_deleted,
      team_id,
      tournament_id,
      is_deleted,
    ]);
    return await Squad.findByTeamTournamentId({ tournament_id, team_id });
  }

  static async findById(tournamentTeamId) {
    const [rows] = await pool.execute(
      `SELECT * FROM tournament_teams WHERE tournament_team_id = ? AND is_deleted = false`,
      [tournamentTeamId]
    );
    return rows[0];
  }

  static async findByTeamId({ tournament_id, team_id }) {
    const [rows] = await pool.execute(
      `SELECT * FROM tournament_teams WHERE tournament_id = ? AND team_id = ? AND is_deleted = false`,
      [tournament_id, team_id]
    );
    return rows;
  }

  static async findByTeamTourId({ tournament_id, team_id }) {
    const [rows] = await pool.execute(
      `SELECT * FROM tournament_teams WHERE tournament_id = ? AND team_id = ?`,
      [tournament_id, team_id]
    );
    return rows;
  }

  static async fetchTeamIdByTournamentId(tournament_id) {
    const [rows] = await pool.execute(
      `SELECT team_id FROM tournament_teams WHERE tournament_id = ? AND is_deleted = false`,
      [tournament_id]
    );
    return rows;
  }

  static async fetchTourTeamSquadByJoin({ tournament_id, team_id }) {
    const [rows] = await pool.execute(
      `select t.tournament_id, tt.tournament_team_id, tt.team_id, s.squad_id from tournament t
      join tournament_teams tt on t.tournament_id = tt.tournament_id
      join squad s on tt.team_id = s.team_id 
      where t.is_deleted = false and tt.is_deleted = false and s.is_deleted = false and t.tournament_id = ? and tt.team_id = ?`,
      [tournament_id, team_id]
    );
    return rows[0];
  }

  static async fetchTeamByTournamentId(tournament_id) {
    const [rows] = await pool.query(
      `select t.team_id,t.name,if(isnull(tt.tournament_team_id),0,1) as status  from team t
      left join tournament_teams tt on t.team_id=tt.team_id and tt.tournament_id = ?`,
      [tournament_id]
    );
    return rows;
  }

  static async updateByTmTourId({ team_id, tournament_id, is_deleted }) {
    let [res] = await pool.query(
      `UPDATE tournament_teams SET is_deleted = ? WHERE team_id = ? AND tournament_id = ?;
       UPDATE squad SET is_deleted = ? WHERE team_id = ? AND tournament_id = ?;`,
      [is_deleted, team_id, tournament_id, is_deleted, team_id, tournament_id]
    );
    return res;
  }

  static async update(tournamentTeamId, tournamentTeamData) {
    const { team_id, tournament_id } = tournamentTeamData;
    let [res] = await pool.execute(
      `UPDATE tournament_teams SET team_id = ?, tournament_id = ? WHERE tournament_team_id = ?`,
      [team_id, tournament_id, tournamentTeamId]
    );
    if (res.affectedRows) res = await this.findById(tournamentTeamId);
    return res;
  }

  static async delete(tournamentTeamId) {
    await pool.execute(
      `UPDATE tournament_teams SET is_deleted = true WHERE tournament_team_id = ?`,
      [tournamentTeamId]
    );

    return this.findById(tournamentTeamId);
  }
}

module.exports = { TournamentTeams };
