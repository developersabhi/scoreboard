const { pool } = require("../../db/dbConnect");

class SquadMatchPlayers {
  // Create a new Squad_Match_Player entry (Insert)
  static async create({ sq_tm_ply_id, match_id, is_playing }) {
    try {
      const [result] = await pool.execute(
        `INSERT INTO squad_match_players (sq_tm_ply_id, match_id, is_playing) VALUES (?, ?, ?)`,
        [sq_tm_ply_id, match_id, is_playing]
      );
      return result.insertId; // Return the ID of the inserted row
    } catch (error) {
      console.error("Error inserting Squad_Match_Player:", error);
      throw error;
    }
  }

  // Retrieve Squad_Match_Player by ID (Read)
  static async findById(smp_id) {
    try {
      const [result] = await pool.execute(
        `SELECT * FROM squad_match_players WHERE smp_id = ? AND is_deleted = false`,
        [smp_id]
      );
      return result.length ? result[0] : null; // Return the first row or null if not found
    } catch (error) {
      console.error("Error fetching Squad_Match_Player:", error);
      throw error;
    }
  }

  // Retrieve all squad_match_players for a specific match (Read)
  static async getByMatchId(match_id) {
    try {
      const [result] = await pool.execute(
        `SELECT * FROM squad_match_players WHERE match_id = ? AND is_deleted = false`,
        [match_id]
      );
      return result;
    } catch (error) {
      console.error("Error fetching squad_match_players by match_id:", error);
      throw error;
    }
  }

  // Retrieve all squad_match_players for a specific player (Read)
  static async getByPlayerId(player_id) {
    try {
      const [result] = await pool.execute(
        `SELECT smp.* 
         FROM squad_match_players smp
         JOIN Squad_Team_Players stp ON smp.sq_tm_ply_id = stp.sq_tm_ply_id
         WHERE stp.player_id = ? AND smp.is_deleted = false`,
        [player_id]
      );
      return result; // Return all matches for this player
    } catch (error) {
      console.error("Error fetching squad_match_players by player_id:", error);
      throw error;
    }
  }

  static async findByStpId({ sq_tm_ply_id, match_id }) {
    const [res] = await pool.execute(
      `SELECT * FROM squad_match_players WHERE sq_tm_ply_id = ? AND match_id = ? AND is_deleted = false`,
      [sq_tm_ply_id, match_id]
    );

    return res[0];
  }

  // Update an existing Squad_Match_Player (Update)
  static async update(smp_id, updateData) {
    const { sq_tm_ply_id, match_id, is_playing } = updateData;
    try {
      const [result] = await pool.execute(
        `UPDATE squad_match_players SET sq_tm_ply_id = ?, match_id = ?, is_playing = ?, updated_at = CURRENT_TIMESTAMP WHERE smp_id = ? AND is_deleted = false`,
        [sq_tm_ply_id, match_id, is_playing, smp_id]
      );
      return result.affectedRows; // Return number of rows affected (1 if successful)
    } catch (error) {
      console.error("Error updating Squad_Match_Player:", error);
      throw error;
    }
  }

  // Soft delete a Squad_Match_Player (Delete)
  static async delete(smp_id) {
    const [result] = await pool.execute(
      `UPDATE squad_match_players SET is_deleted = true WHERE smp_id = ?`,
      [smp_id]
    );
    return result.affectedRows; // Return number of rows affected (1 if successful)
  }

  // Hard delete a Squad_Match_Player (Remove the row completely)
  static async hardDelete(smp_id) {
    try {
      const [result] = await pool.execute(
        `DELETE FROM squad_match_players WHERE smp_id = ?`,
        [smp_id]
      );
      return result.affectedRows; // Return number of rows affected (1 if successful)
    } catch (error) {
      console.error("Error permanently deleting Squad_Match_Player:", error);
      throw error;
    }
  }
}

module.exports = { SquadMatchPlayers };
