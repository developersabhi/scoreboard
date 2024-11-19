const { pool } = require("../../db/dbConnect");

class Matches {
  static async create({
    event_name,
    squad_a,
    squad_b,
    tournament_id,
    match_date,
    start_time,
    venue,
  }) {
    const query = `INSERT INTO matches (event_name, squad_a, squad_b, tournament_id, match_date, start_time, venue) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [
      event_name,
      squad_a,
      squad_b,
      tournament_id,
      match_date,
      start_time,
      venue,
    ]);
    return await this.findById(result.insertId);
  }

  static async findById(matchId) {
    const [rows] = await pool.execute(
      `SELECT * FROM matches WHERE match_id = ? AND is_cancelled = false`,
      [matchId]
    );
    return rows[0];
  }

  static async fetch() {
    const [rows] = await pool.execute(
      `SELECT * FROM matches WHERE is_cancelled = false`
    );
    return rows;
  }

  static async fetchLiveMatches() {
    const [rows] = await pool.execute(
      `SELECT * FROM matches WHERE is_live = true AND is_cancelled = false`
    );
    console.log("rows ", rows);
    return rows;
  }

  static async fetchTodaysMatches() {
    const [rows] = await pool.execute(
      // `SELECT * FROM matches WHERE match_date <= UNIX_TIMESTAMP() AND is_cancelled = false`
      
      `SELECT * 
FROM matches 
WHERE FROM_UNIXTIME(match_date / 1000) BETWEEN CURDATE() AND CURDATE() + INTERVAL 1 DAY
AND is_cancelled = false;
`
    );
    return rows;
  }
  static async fetchTomarrowMatches() {
    const [rows] = await pool.execute(
      // `SELECT * FROM matches WHERE match_date <= UNIX_TIMESTAMP() AND is_cancelled = false`

      `SELECT * 
FROM matches 
WHERE FROM_UNIXTIME(match_date / 1000) BETWEEN CURDATE() + INTERVAL 1 DAY AND CURDATE() + INTERVAL 2 DAY
AND is_cancelled = false;
`
    );
    return rows;
  }

  static async fetchMatchByDate(match_Date) {
    const [rows] = await pool.execute(
      `SELECT * FROM matches WHERE match_date = ? AND is_cancelled = false`,
      [match_Date]
    );
    return rows;
  }

  static async update(matchId, matchData) {
    const {
      event_name,
      squad_a,
      squad_b,
      tournament_id,
      match_date,
      start_time,
      venue,
      inning_started_by,
      toss_winner,
      toss_result,
      toss_winner_selected,
      match_result,
      match_status,
      is_live,
      is_cancelled,
    } = matchData;
    let [res] = await pool.execute(
      `UPDATE matches SET event_name = ?, squad_a = ?, squad_b = ?, tournament_id = ?, match_date = ?, start_time = ?, venue = ?, inning_started_by = ?, toss_winner = ?, toss_result = ?, toss_winner_selected = ?, match_result = ?, match_status = ?, is_live = ?, is_cancelled = ? WHERE match_id = ?`,
      [
        event_name,
        squad_a,
        squad_b,
        tournament_id,
        match_date,
        start_time,
        venue,
        inning_started_by,
        toss_winner,
        toss_result,
        toss_winner_selected,
        match_result,
        match_status,
        is_live,
        is_cancelled,
        matchId,
      ]
    );
    if (res.affectedRows) res = await this.findById(matchId);
    return res;
  }

  static async updateMatchResult(matchId, matchData) {
    const { match_result, match_status } = matchData;
    let [res] = await pool.execute(
      `UPDATE matches SET  match_result = ?, match_status = ? WHERE match_id = ?`,
      [match_result, match_status, matchId]
    );
    if (res.affectedRows) res = await this.findById(matchId);
    return res;
  }

  static async tossUpdate(
    { toss_winner, toss_result, toss_winner_selected, inning_started_by },
    match_id
  ) {
    const [rows] = await pool.execute(
      `UPDATE matches SET toss_winner = ?, toss_result = ?, toss_winner_selected = ?, inning_started_by = ? WHERE match_id = ?`,
      [
        toss_winner,
        toss_result,
        toss_winner_selected,
        inning_started_by,
        match_id,
      ]
    );
    console.log(rows);
    return rows;
  }

  static async toggleStatus({ match_id, status }) {
    await pool.execute(`UPDATE matches SET is_live = ? WHERE match_id = ?`, [
      status,
      match_id,
    ]);
  }

  static async delete(matchId) {
    await pool.execute(
      `UPDATE matches SET is_cancelled = true WHERE match_id = ?`,
      [matchId]
    );
  }
}

module.exports = { Matches };
