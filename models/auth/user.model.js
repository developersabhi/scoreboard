const jsonwebtoken = require("jsonwebtoken");
const { pool } = require("../../db/dbConnect");
const bcrypt = require("bcrypt");

class User {
  static async create(userData) {
    const { name, mobile_no, passwd, cust_user_id, status, role, created_by } =
      userData;

    const query = `INSERT INTO user (name, mobile_no, passwd, cust_user_id, status, role, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const hashPass = await this.generateHash(passwd);
    const [result] = await pool.execute(query, [
      name,
      mobile_no,
      hashPass,
      cust_user_id,
      status,
      role,
      created_by,
    ]);
    return result.insertId;
  }

  static async generateHash(value) {
    return await bcrypt.hash(value, 10);
  }

  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT user_id, name, mobile_no, cust_user_id, status, role, created_by, created_at FROM user`
    );
    return rows;
  }

  static async findByRole(role) {
    const [rows] = await pool.execute(
      `SELECT user_id, name, mobile_no, cust_user_id, status, role, created_by, created_at FROM user WHERE role = ?`,
      [role]
    );
    return rows;
  }

  static async findAccCreatedBy({ created_by }) {
    const [rows] = await pool.execute(
      `SELECT user_id, name, mobile_no, cust_user_id, status, role, created_by, created_at FROM user Where created_by = ?`,
      [created_by]
    );
    return rows;
  }

  static async findById(userId) {
    const [rows] = await pool.execute(`SELECT * FROM user WHERE user_id = ?`, [
      userId,
    ]);
    return rows[0];
  }

  static async findByName(name) {
    const [rows] = await pool.execute(`SELECT * FROM user WHERE name = ?`, [
      name,
    ]);
    return rows[0];
  }

  static async findByCustId(cust_user_id) {
    const [rows] = await pool.execute(
      `SELECT * FROM user WHERE cust_user_id = ?`,
      [cust_user_id]
    );
    return rows[0];
  }

  static async generateCustUsrId(requestedFields) {
    if (!requestedFields.name || requestedFields.name.length < 3) return false;

    let user;
    let cust_user_id;
    do {
      const randomSuffix = Math.floor(Math.random() * 1000); // Add randomness
      cust_user_id =
        requestedFields.name.slice(0, 3) +
        "@" +
        Date.now().toString().slice(5) +
        randomSuffix; // Append random number

      user = await this.findByCustId(cust_user_id);
    } while (user);

    return cust_user_id;
  }

  static async checkUserPassword(passwd, hash) {
    return await bcrypt.compare(passwd, hash);
  }

  static async generateAccessToken({
    user_id,
    name,
    mobile_no,
    cust_user_id,
    status,
    role,
  }) {
    return await jsonwebtoken.sign(
      { user_id, name, mobile_no, cust_user_id, status, role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
  }

  static async update(userId, userData) {
    const { name, mobile_no, passwd, status, role } = userData;
    await pool.execute(
      `UPDATE user SET name = ?, mobile_no = ?, passwd = ?, status = ?, role = ? WHERE user_id = ?`,
      [name, mobile_no, passwd, status, role, userId]
    );
  }

  static async toggleStatus(cust_user_id, status) {
    await pool.execute(`UPDATE user SET status = ? WHERE cust_user_id = ?`, [
      status,
      cust_user_id,
    ]);
  }

  static async updatePass({ cust_user_id, newPassword }) {
    let hash = await this.generateHash(newPassword);

    let res = await pool.execute(
      `UPDATE user SET passwd = ? WHERE cust_user_id = ?`,
      [hash, cust_user_id]
    );

    return res;
  }

  static async delete(userId) {
    await pool.execute(`DELETE FROM user WHERE user_id = ?`, [userId]);
  }
}

module.exports = { User };
