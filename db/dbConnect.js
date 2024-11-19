const { createPool } = require("mysql2/promise");
const { config } = require("dotenv");
const { logger } = require("../lib/utils/logger");

config();

const pool = createPool({
  port: process.env.MYSQL_PORT,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

const createTables = async () => {
  try {
    if (await pool.getConnection()) logger.info("db connection successful");

    await pool.query(`CREATE DATABASE IF NOT EXISTS scoreboard`);

    // -- Create User Table
    await pool.query(
      `CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile_no VARCHAR(100) NOT NULL UNIQUE,
    passwd VARCHAR(100) NOT NULL,
    cust_user_id VARCHAR(100) NOT NULL UNIQUE,
    status BOOLEAN DEFAULT FALSE,
    role ENUM('ADMIN', 'MANAGER', 'AGENT') DEFAULT 'AGENT',
    created_by INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES user (user_id)
    );`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS country (
      country_id INT AUTO_INCREMENT PRIMARY KEY,
      country_name VARCHAR(50) NOT NULL UNIQUE,
      country_code VARCHAR(3) NOT NULL UNIQUE,
      country_num INT NOT NULL UNIQUE,
      country_logo VARCHAR(250) NOT NULL,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`
    );

    // -- Create Team Table
    await pool.query(
      `CREATE TABLE IF NOT EXISTS team (
      team_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      gender ENUM('MALE', 'FEMALE') DEFAULT 'MALE',
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`
    );

    // -- Create Player Table
    await pool.query(`
    CREATE TABLE IF NOT EXISTS player (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    gender ENUM('MALE','FEMALE') DEFAULT 'MALE',
    skills ENUM(
        'BOWLER',
        'BATSMAN',
        'WICKET_KEEPER',
        'ALL_ROUNDER'
    ) DEFAULT 'ALL_ROUNDER',
    profile_pic VARCHAR(500) NOT NULL,
    country_id INT,
    team_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES country (country_id),
    FOREIGN KEY (team_id) REFERENCES team (team_id)
    );`);

    // -- Create Tournament Table
    await pool.query(
      `CREATE TABLE IF NOT EXISTS tournament (
      tournament_id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      gender_type ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'MALE',
      format_type ENUM('ODI', 'TEST', 'T20') NOT NULL DEFAULT 'TEST',
      num_of_innings ENUM ('2', '4') NOT NULL DEFAULT '2',
      start_date BIGINT NOT NULL,
      end_date BIGINT NOT NULL,
      tournament_type ENUM('DOMESTIC', 'INTERNATIONAL') NOT NULL,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`
    );

    // -- Create Squad Table
    await pool.query(
      `CREATE TABLE IF NOT EXISTS squad (
      squad_id INT AUTO_INCREMENT PRIMARY KEY,
      team_id INT,
      tournament_id INT,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES team (team_id),
      FOREIGN KEY (tournament_id) REFERENCES tournament (tournament_id)
  );`
    );

    // -- Create Matches Table
    await pool.query(
      `CREATE TABLE IF NOT EXISTS matches (
      match_id INT AUTO_INCREMENT PRIMARY KEY,
      event_name VARCHAR(100) NOT NULL,
      squad_a INT,
      squad_b INT,
      tournament_id INT,
      match_date BIGINT NOT NULL,
      start_time BIGINT NOT NULL,
      venue VARCHAR(250),
      inning_started_by ENUM('TEAM_A', 'TEAM_B') DEFAULT NULL,
      toss_winner ENUM('TEAM_A', 'TEAM_B') DEFAULT NULL,
      toss_result ENUM('HEAD', 'TAIL') DEFAULT NULL,
      toss_winner_selected ENUM('BATTING', 'BALLING') DEFAULT NULL,
      match_result ENUM('DRAW', 'TEAM_A_WON', 'TEAM_B_WON', 'CANCELLED') DEFAULT NULL,
      match_status ENUM(
          'STARTED',
          'ENDED',
          'CANCELLED',
          'NOT_STARTED',
          'ABANDONED',
          'POSTPONED',
          'IN_PROGRESS',
          'REVIEW'
      ) DEFAULT 'NOT_STARTED',
      is_live BOOLEAN DEFAULT FALSE,
      is_cancelled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (squad_a) REFERENCES squad (squad_id),
      FOREIGN KEY (squad_b) REFERENCES squad (squad_id),
      FOREIGN KEY (tournament_id) REFERENCES tournament (tournament_id)
  );`
    );

    // -- Create Squad_Team_Players Table
    await pool.query(
      `CREATE TABLE IF NOT EXISTS squad_team_players (
      sq_tm_ply_id INT AUTO_INCREMENT PRIMARY KEY,
      player_id INT,
      squad_id INT,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES player (player_id),
      FOREIGN KEY (squad_id) REFERENCES squad (squad_id)
  );`
    );

    await pool.execute(
      `CREATE TABLE IF NOT EXISTS squad_match_players(
    smp_id INT AUTO_INCREMENT PRIMARY KEY,
    sq_tm_ply_id INT,
    match_id INT,
    is_playing BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sq_tm_ply_id) REFERENCES squad_team_players(sq_tm_ply_id),
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);`
    );

    // -- Create Tournament_Teams Table
    await pool.query(
      `CREATE TABLE IF NOT EXISTS tournament_teams (
      tournament_team_id INT AUTO_INCREMENT PRIMARY KEY,
      team_id INT,
      tournament_id INT,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES team (team_id),
      FOREIGN KEY (tournament_id) REFERENCES tournament (tournament_id)
  );`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS match_assign_user(
      match_assign_user_id INT AUTO_INCREMENT PRIMARY KEY,
      match_id INT,
      user_id INT,
      assigned_by INT,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES matches(match_id),
      FOREIGN KEY (user_id) REFERENCES user(user_id),
      FOREIGN KEY (assigned_by) REFERENCES user(user_id)
  )`
    );

    // -- Create Balls Table
    await pool.query(`
    CREATE TABLE IF NOT EXISTS balls (
    ball_id INT AUTO_INCREMENT PRIMARY KEY,
    ball_no INT NOT NULL,
    inning ENUM('1', '2', '3', '4') DEFAULT '1',
    total_runs INT DEFAULT 0,
    match_id INT NOT NULL,
    bowler_id INT,
    stricker_id INT,
    non_stricker_id INT,
    sup_ply_id INT,
    wicket_taken BOOLEAN DEFAULT FALSE,
    run_type ENUM('RUN_BTW_WIC', 'FOUR', 'SIX', 'NO_RUN') DEFAULT 'NO_RUN',
    ball_type ENUM(
        'DOT_BALL',
        'NORMAL',
        'WIDE',
        'NO_BALL',
        'DEAD',
        'BYE',
        'LEG_BYE',
        'PENALTY',
        'OVERTHROW',
        'FREE_HIT',
        'BEAMER',
        'BOUNCER',
        'SPINNER',
        'SWING'
    ) DEFAULT 'DOT_BALL',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches (match_id),
    FOREIGN KEY (stricker_id) REFERENCES squad_match_players (smp_id),
    FOREIGN KEY (non_stricker_id) REFERENCES squad_match_players (smp_id),
    FOREIGN KEY (bowler_id) REFERENCES squad_match_players (smp_id),
    FOREIGN KEY (sup_ply_id) REFERENCES squad_match_players (smp_id)
    );`);

    logger.info("tables created successfully");
  } catch (error) {
    await pool.end();
    logger.error("error during creating tables");
    logger.error(error);
  }
};

module.exports = {
  pool,
  createTables,
};

//   // -- Create Team_Players Table
//   await pool.query(
//     `CREATE TABLE IF NOT EXISTS Team_Players (
//     team_players_id INT AUTO_INCREMENT PRIMARY KEY,
//     team_id INT,
//     player_id INT,
//     is_deleted BOOLEAN DEFAULT FALSE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (team_id) REFERENCES Team (team_id),
//     FOREIGN KEY (player_id) REFERENCES Player (player_id)
// );`
//   );

// await pool.query(
//     `CREATE TABLE IF NOT EXISTS Tournament_Squad (
//     tournament_squad_id INT AUTO_INCREMENT PRIMARY KEY,
//     tournament_id INT,
//     squad_id INT,
//     is_deleted BOOLEAN DEFAULT FALSE,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//     FOREIGN KEY (tournament_id) REFERENCES Tournament (tournament_id),
//     FOREIGN KEY (squad_id) REFERENCES Squad (squad_id)
// );`
// );
