const { pool } = require("../../db/dbConnect");

class Country {
  static async create({
    country_name,
    country_code,
    country_num,
    country_logo,
  }) {
    const query = `INSERT INTO country (country_name, country_code, country_num, country_logo) VALUES (?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [
      country_name,
      country_code,
      country_num,
      country_logo,
    ]);
    return await this.findById(result.insertId);
  }

  static async find() {
    const [rows] = await pool.execute(
      `SELECT * FROM country WHERE is_deleted = false`
    );
    return rows;
  }

  static async findById(countryId) {
    const [rows] = await pool.execute(
      `SELECT * FROM country WHERE country_id = ? AND is_deleted = false`,
      [countryId]
    );
    return rows[0];
  }

  static async findByName(country_name) {
    const [rows] = await pool.execute(
      `SELECT * FROM country WHERE country_name = ? AND is_deleted = false`,
      [country_name]
    );
    return rows[0];
  }

  static async findByCode(country_code) {
    const [rows] = await pool.execute(
      `SELECT * FROM country WHERE country_code = ? AND is_deleted = false`,
      [country_code]
    );
    return rows[0];
  }

  static async findByNum(country_num) {
    const [rows] = await pool.execute(
      `SELECT * FROM country WHERE country_num = ? AND is_deleted = false`,
      [country_num]
    );
    return rows[0];
  }

  static async update(countryId, countryData) {
    const { country_name, country_code, country_num, country_logo } =
      countryData;
    let [res] = await pool.execute(
      `UPDATE country SET country_name = ?, country_code = ?, country_num = ?, country_logo = ? WHERE country_id = ?`,
      [country_name, country_code, country_num, country_logo, countryId]
    );
    if (res.affectedRows) res = await this.findById(countryId);
    return res;
  }

  static async delete(countryId) {
    await pool.execute(
      `UPDATE country SET is_deleted = true WHERE country_id = ?`,
      [countryId]
    );
  }
}

module.exports = { Country };
