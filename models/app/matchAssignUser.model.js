const { pool } = require("../../db/dbConnect");

class MatchAssignUser {
  static async create({ match_id, user_id, assigned_by }) {
    const query = `INSERT INTO match_assign_user (match_id, user_id, assigned_by) VALUES (?, ?, ?)`;
    const [result] = await pool.execute(query, [
      match_id,
      user_id,
      assigned_by,
    ]);
    return await this.findById(result.insertId);
  }

  static async findById(matchAssignUserId) {
    const [rows] = await pool.execute(
      `SELECT * FROM match_assign_user WHERE match_assign_user_id = ? AND is_deleted = false`,
      [matchAssignUserId]
    );
    return rows[0];
  }

  static async findAssignedUser({ match_id, user_id }) {
    const [rows] = await pool.execute(
      `SELECT * FROM match_assign_user WHERE match_id = ? AND user_id = ? AND is_deleted = false`,
      [match_id, user_id]
    );
    return rows[0];
  }

  static async fetchAssignedAgents({ match_id }) {
    const [rows] = await pool.execute(
      `SELECT * FROM match_assign_user WHERE match_id = ? AND is_deleted = false`,
      [match_id]
    );
    return rows;
  }

  static async update(matchAssignUserId, matchAssignUserData) {
    const { match_id, user_id, assigned_by } = matchAssignUserData;
    let [res] = await pool.execute(
      `UPDATE match_assign_user SET match_id = ?, user_id = ?, assigned_by = ? WHERE match_assign_user_id = ?`,
      [match_id, user_id, assigned_by, matchAssignUserId]
    );
    if (res.affectedRows) res = await this.findById(matchAssignUserId);
    return res;
  }

  static async delete(matchAssignUserId) {
    await pool.execute(
      `UPDATE match_assign_user SET is_deleted = true WHERE match_assign_user_id = ?`,
      [matchAssignUserId]
    );
  }

  static async find() {
    const [rows] = await pool.execute(
      `SELECT * FROM match_assign_user WHERE is_deleted= false`
    );
    return rows;
  }
}

module.exports = { MatchAssignUser };
