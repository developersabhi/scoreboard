const { pool } = require("../../db/dbConnect");

class Balls {
  static async create({
    inning,
    total_runs,
    match_id,
    bowler_id,
    stricker_id,
    non_stricker_id,
    sup_ply_id,
    ball_no,
    wicket_taken,
    ball_type,
    run_type,
  }) {
    console.log(
      inning,
      total_runs,
      match_id,
      bowler_id,
      stricker_id,
      non_stricker_id,
      sup_ply_id,
      ball_no,
      wicket_taken,
      ball_type,
      run_type
    );
    const query = `INSERT INTO balls (inning, total_runs, match_id, bowler_id, stricker_id, non_stricker_id, sup_ply_id, ball_no, wicket_taken, ball_type, run_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [
      inning,
      total_runs,
      match_id,
      bowler_id,
      stricker_id,
      non_stricker_id,
      sup_ply_id,
      ball_no,
      wicket_taken,
      ball_type,
      run_type,
    ]);

    return await this.findById(result.insertId);
  }

  static async findById(ballId) {
    const [rows] = await pool.execute(`SELECT * FROM balls WHERE ball_id = ?`, [
      ballId,
    ]);
    return rows[0];
  }

  static async findBall({ match_id, inning, ball_no }) {
    let query = `SELECT * FROM balls WHERE match_id = ? AND inning = ? AND ball_no = ?`;
    let [res] = await pool.execute(query, [match_id, inning, ball_no]);

    return res[0];
  }

  static async update(ballId, ballData) {
    const {
      inning,
      total_runs,
      match_id,
      bowler_id,
      stricker_id,
      non_stricker_id,
      sup_ply_id,
      ball_no,
      wicket_taken,
      ball_type,
      run_type,
    } = ballData;
    let [res] = await pool.execute(
      `UPDATE balls SET inning = ?, total_runs = ?, match_id = ?, bowler_id = ?, stricker_id = ?, non_stricker_id = ?, sup_ply_id = ?, ball_no = ?, wicket_taken = ?, ball_type = ?, run_type = ? WHERE ball_id = ?`,
      [
        inning,
        total_runs,
        match_id,
        bowler_id,
        stricker_id,
        non_stricker_id,
        sup_ply_id,
        ball_no,
        wicket_taken,
        ball_type,
        run_type,
        ballId,
      ]
    );

    if (res.affectedRows) res = await this.findById(ballId);

    return res;
  }

  static async delete(ballId) {
    await pool.execute(`DELETE FROM balls WHERE ball_id = ?`, [ballId]);
  }
}

module.exports = { Balls };
