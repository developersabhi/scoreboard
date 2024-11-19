-- Create User Table
(
    `CREATE TABLE IF NOT EXISTS User (
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
    FOREIGN KEY (created_by) REFERENCES User (user_id)
);`
) -- Create Country Table
(
    `CREATE TABLE IF NOT EXISTS Country (
    country_id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(50) NOT NULL UNIQUE,
    country_code VARCHAR(3) NOT NULL UNIQUE,
    country_num INT NOT NULL UNIQUE,
    country_logo VARCHAR(250) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`
) -- Create Player Table
(
    `CREATE TABLE Player (
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    skills ENUM(
        'BOWLER',
        'BATSMAN',
        'WICKET_KEEPER',
        'ALL_ROUNDER'
    ) DEFAULT 'ALL_ROUNDER',
    gender ENUM('MALE','FEMALE') DEFAULT 'MALE',
    profile_pic VARCHAR(500) NOT NULL,
    country_id INT,
    team_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (country_id) REFERENCES Country (country_id),
    FOREIGN KEY (team_id) REFERENCES Team (team_id)
);`
) -- Create Team Table
(
    `CREATE TABLE IF NOT EXISTS Team (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender ENUM('MALE', 'FEMALE') DEFAULT 'MALE',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`
) -- Create Tournament Table
(
    `CREATE TABLE IF NOT EXISTS Tournament (
    tournament_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender_type ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'MALE',
    format_type ENUM('ODI', 'TEST', 'T20') NOT NULL DEFAULT 'TEST',
    num_of_innings ENUM ('2', '4') NOT NULL DEFAULT '2',
    start_date DATE,
    end_date DATE,
    tournament_type ENUM('DOMESTIC', 'INTERNATIONAL') NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
);`
) -- Create Matches Table
(
    `CREATE TABLE IF NOT EXISTS Matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    squad_a INT,
    squad_b INT,
    tournament_id INT,
    match_date DATE DEFAULT CURRENT_TIMESTAMP,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    FOREIGN KEY (squad_a) REFERENCES Squad (squad_id),
    FOREIGN KEY (squad_b) REFERENCES Squad (squad_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournament (tournament_id)
);`
) -- Create Balls Table
(
    `CREATE TABLE Balls (
    ball_id INT AUTO_INCREMENT PRIMARY KEY,
    ball_no INT NOT NULL,
    inning ENUM('1', '2', '3', '4') DEFAULT '1',
    total_runs INT DEFAULT 0,
    match_id INT NOT NULL,
    bowled_by INT,
    played_by INT,
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
    FOREIGN KEY (match_id) REFERENCES Matches (match_id),
    FOREIGN KEY (bowled_by) REFERENCES Squad_Match_Players (smp_id),
    FOREIGN KEY (played_by) REFERENCES Squad_Match_Players (smp_id),
    FOREIGN KEY (sup_ply_id) REFERENCES Squad_Match_Players (smp_id)
);`
) -- Create Squad Table
(
    `CREATE TABLE IF NOT EXISTS Squad (
    squad_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    tournament_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES Team (team_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournament (tournament_id)
);`
) -- Create Team_Players Table
/* (
 `CREATE TABLE IF NOT EXISTS Team_Players (
 team_players_id INT AUTO_INCREMENT PRIMARY KEY,
 team_id INT,
 player_id INT,
 is_deleted BOOLEAN DEFAULT FALSE,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 FOREIGN KEY (team_id) REFERENCES Team (team_id),
 FOREIGN KEY (player_id) REFERENCES Player (player_id)
 );`
 ) -- Create Squad_Team_Players Table */
(
    `CREATE TABLE IF NOT EXISTS Squad_Team_Players (
    sq_tm_ply_id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT,
    squad_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES Player (player_id),
    FOREIGN KEY (squad_id) REFERENCES Squad (squad_id)
);`
) -- Create Tournament_Teams Table
(
    `CREATE TABLE IF NOT EXISTS Tournament_Teams (
    tournament_team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT,
    tournament_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES Team (team_id),
    FOREIGN KEY (tournament_id) REFERENCES Tournament (tournament_id)
);`
) (
    `CREATE TABLE IF NOT EXISTS Match_Assign_User(
    match_assign_user_id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT,
    user_id INT,
    assigned_by INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES Matches(match_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (assigned_by) REFERENCES User(user_id)
);`
) (
    `CREATE TABLE Squad_Match_Players(
    smp_id INT AUTO_INCREMENT PRIMARY KEY,
    sq_tm_ply_id INT,
    match_id INT,
    is_playing BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sq_tm_ply_id) REFERENCES Squad_Team_Players(sq_tm_ply_id),
    FOREIGN KEY (match_id) REFERENCES Matches(match_id)
);`
) -- DB-DIAGRAM :-
-- https://dbdiagram.io/d/scoreboard-1-670e585397a66db9a30a2bc3
--
/* select 
 b.ball_no, b.ball_no, b.inning, b.total_runs, b.match_id, b.bowled_by, b.played_by, b.wicket_taken, b.run_type, b.ball_type, p.name, p.skills, t.name
 from balls b
 
 join squad_match_players smp_bat on smp_bat.smp_id = b.played_by
 join squad_team_players stp_bat on stp_bat.sq_tm_ply_id = smp_bat.sq_tm_ply_id
 join player p_bat on p_bat.player_id = stp_bat.player_id
 join team t_bat on t.team_id = p_bat.team_id 
 
 join squad_match_players smp_bal on smp_bal.smp_id = b.bowled_by
 join squad_team_players stp_bal on stp_bal.sq_tm_ply_id = smp_bal.sq_tm_ply_id
 join player p_bal on p_bal.player_id = stp_bal.player_id
 join team t_bal on t.team_id = p_bal.team_id 
 
 join squad_match_players smp_sup on smp_sup.smp_id = b.sup_ply_id
 join squad_team_players stp_sup on stp_sup.sq_tm_ply_id = smp_sup.sq_tm_ply_id
 join player p_sup on p_sup.player_id = stp_sup.player_id
 join team t_sup on t.team_id = p_sup.team_id 
 
 where b.wicket_taken = true and b.is_deleted = false and b.match_id = 2 and b.inning = 1 */