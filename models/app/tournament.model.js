const { pool } = require("../../db/dbConnect");

class Tournament {
  static async create({
    name,
    gender_type,
    format_type,
    num_of_innings,
    start_date,
    end_date,
    tournament_type,
  }) {
    const query = `INSERT INTO tournament (name, gender_type, format_type, num_of_innings, start_date, end_date, tournament_type) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [
      name,
      gender_type,
      format_type,
      num_of_innings,
      start_date,
      end_date,
      tournament_type,
    ]);
    return await this.findById(result.insertId);
  }

  static async findById(tournamentId) {
    const [rows] = await pool.execute(
      `SELECT * FROM tournament WHERE tournament_id = ? AND is_deleted = false`,
      [tournamentId]
    );
    return rows[0];
  }

  static async findTournamentExists({
    name,
    gender_type,
    format_type,
    num_of_innings,
    start_date,
    end_date,
    tournament_type,
  }) {
    const [rows] = await pool.execute(
      `SELECT * FROM tournament WHERE name = ? AND gender_type = ? AND format_type = ? AND num_of_innings = ? AND start_date = ? AND end_date = ? AND tournament_type = ? AND is_deleted = false`,
      [
        name,
        gender_type,
        format_type,
        num_of_innings,
        start_date,
        end_date,
        tournament_type,
      ]
    );
    return rows[0];
  }

  static async fetchTournamentPlayers(tournament_id) {
    const [rows] = await pool.query(
      // `select p.team_id,p.player_id,p.name,if(isnull(stp.sq_tm_ply_id),0,1) as status from player p left join squad_team_players stp on stp.player_id=p.player_id and stp.squad_id in (select sq.squad_id from squad sq where sq.tournament_id=?) where p.team_id in (select tt.team_id from tournament_teams tt where tt.tournament_id=?);`,
      `SELECT 
          p.team_id,
          p.player_id,
          p.name AS player_name,
          t.name AS team_name,  -- Get the team name from the team table
          IF(ISNULL(stp.sq_tm_ply_id), 0, 1) AS status
      FROM 
          player p
      LEFT JOIN 
          squad_team_players stp ON stp.player_id = p.player_id 
          AND stp.squad_id IN (
              SELECT sq.squad_id 
              FROM squad sq 
              WHERE sq.tournament_id = ?
          )
      INNER JOIN 
          team t ON t.team_id = p.team_id  -- Join with the team table to get the team name
      WHERE 
          p.team_id IN (
              SELECT tt.team_id 
              FROM tournament_teams tt 
              WHERE tt.tournament_id = ?
          );
      `,
      [tournament_id, tournament_id]
    );
    return rows;
  }

  static async update(tournamentId, tournamentData) {
    const {
      name,
      gender_type,
      format_type,
      num_of_innings,
      start_date,
      end_date,
      tournament_type,
    } = tournamentData;
    console.log(tournamentId, tournamentData);
    let [res] = await pool.execute(
      `UPDATE tournament SET name = ?, gender_type = ?, format_type = ?, num_of_innings = ?, start_date = ?, end_date = ?, tournament_type = ? WHERE tournament_id = ?`,
      [
        name,
        gender_type,
        format_type,
        num_of_innings,
        start_date,
        end_date,
        tournament_type,
        tournamentId,
      ]
    );
    if (res.affectedRows) res = await this.findById(tournamentId);
    return res;
  }

  static async delete(tournamentId) {
    await pool.execute(
      `UPDATE tournament SET is_deleted = true WHERE tournament_id = ?`,
      [tournamentId]
    );
  }

  static async find() {
    const [rows] = await pool.execute(
      `SELECT * FROM tOURNAMENT WHERE is_deleted= false`
    );
    return rows;
  }
}

module.exports = { Tournament };
