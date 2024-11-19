const { pool } = require("../../db/dbConnect");

class Dashboard {
  static async dashboardData() {
    let [ballSumm] = await pool.execute(`
      select count(*) as total_balls,
		  sum(b.total_runs) as total_runs,
      sum(b.wicket_taken = true) as total_wickets,
		  sum(b.run_type = "FOUR") as total_fours,
      sum(b.run_type = "SIX") as total_sixes
      from balls b
      where b.match_id = 1 and inning = 1 and b.is_deleted = false`);

    let [b1Data] = await pool.execute(
      `select count(*) as balls_played,
        sum(b.total_runs) as runs,
        sum(b.run_type = "SIX") as sixes,
        sum(b.run_type = "FOUR") as fours,
        sum(b.run_type = "RUN_BTW_WIC") as singles
        from balls b
        where  b.stricker_id = 12 and b.match_id = 1 and b.inning = 1 and b.is_deleted = false`
    );
    let [b2Data] = await pool.execute(
      `select count(*) as balls_played,
        sum(b.total_runs) as runs,
        sum(b.run_type = "SIX") as sixes,
        sum(b.run_type = "FOUR") as fours,
        sum(b.run_type = "RUN_BTW_WIC") as singles
        from balls b
        where  b.stricker_id = 13 and b.match_id = 1 and b.inning = 1 and b.is_deleted = false`
    );

    let [bwlData] = await pool.execute(
      `select
        count(*) as balls_dilivered,
        sum(b.wicket_taken = true) as wickets_taken,
        sum(b.ball_type = "NO_BALL") as no_balls,
        sum(b.ball_type = "WIDE") as wide_balls,
        sum(b.total_runs) as runs_given
        from balls b
        where  b.bowler_id = 1 and b.match_id = 1 and b.inning = 1 and b.is_deleted = false`
    );

    let [extras] = await pool.execute(
      `SELECT
         SUM(CASE WHEN ball_type != 'NORMAL' THEN 1 ELSE 0 END) AS extraballs,
         SUM(CASE WHEN ball_type = 'WIDE' THEN 1 ELSE 0 END) AS wideballs,
         SUM(CASE WHEN ball_type = 'NO_BALL' THEN 1 ELSE 0 END) AS noballs,
         SUM(CASE WHEN ball_type = 'LEG_BYE' THEN 1 ELSE 0 END) AS legbyeballs,
         SUM(CASE WHEN ball_type = 'BYE' THEN 1 ELSE 0 END) AS byeballs,
         SUM(CASE WHEN ball_type = 'PENALTY' THEN 1 ELSE 0 END) AS penaltyballs
       FROM balls WHERE match_id = 2 AND inning = '1' AND is_deleted = false`
    );

    // Calculations and data formatting

    b1Data = b1Data[0];
    b1Data["strikeRate"] = (parseInt(b1Data?.runs) / b1Data.balls_played) * 100;
    b2Data = b2Data[0];
    b2Data["strikeRate"] = (parseInt(b2Data?.runs) / b2Data.balls_played) * 100;
    bwlData = bwlData[0];
    bwlData["eco"] =
      parseInt(bwlData.runs_given) / (bwlData.balls_dilivered / 6);
    bwlData["overs"] = parseInt(bwlData.balls_dilivered) / 6;
    extras = extras[0];

    let currentRunRate =
      parseInt(ballSumm[0].total_runs) /
      (parseInt(ballSumm[0].total_balls) / 6);

    let resultObj = {
      ...ballSumm,
      currentRunRate,
      b1Data,
      b2Data,
      bwlData,
      extras,
    };
    return resultObj;
  }

  static async matchInnSumm({ match_id, inning }) {
    const [matchInfo] = await pool.query(`
        SELECT
            m.event_name,
            tm_a.name AS team_a_name,
            tm_b.name AS team_b_name,
            m.venue,
            m.start_time,
            m.match_status,
            m.is_live,
            m.toss_winner,
            m.toss_result,
            m.toss_winner_selected,
            m.inning_started_by,
            m.match_result
        FROM
            matches m
                JOIN
            squad sq_a ON sq_a.squad_id = m.squad_a
                JOIN
            squad sq_b ON sq_b.squad_id = m.squad_b
                JOIN
            team tm_a ON tm_a.team_id = sq_a.team_id
                JOIN
            team tm_b ON tm_b.team_id = sq_b.team_id`);

    const [ballSummary] = await pool.query(`
        SELECT
            b.ball_no,
            b.inning,
            b.match_id,
            b.total_runs,
            b.wicket_taken,
            b.run_type,
            b.ball_type,
            p_bal.name AS bowler_name,
            p_stricker.name AS stricker_name,
            p_non_stricker.name AS non_stricker_name,
            p_sup.name AS support_player_name,
            m.event_name AS event_name
        FROM balls b

        LEFT JOIN squad_match_players smp_stricker ON smp_stricker.smp_id = b.stricker_id
        LEFT JOIN squad_team_players stp_stricker ON stp_stricker.sq_tm_ply_id = smp_stricker.sq_tm_ply_id
        LEFT JOIN player p_stricker ON p_stricker.player_id = stp_stricker.player_id

        LEFT JOIN squad_match_players smp_non_stricker ON smp_non_stricker.smp_id = b.non_stricker_id
        LEFT JOIN squad_team_players stp_non_stricker ON stp_non_stricker.sq_tm_ply_id = smp_non_stricker.sq_tm_ply_id
        LEFT JOIN player p_non_stricker ON p_non_stricker.player_id = stp_non_stricker.player_id

        LEFT JOIN squad_match_players smp_bal ON smp_bal.smp_id = b.bowler_id
        LEFT JOIN squad_team_players stp_bal ON stp_bal.sq_tm_ply_id = smp_bal.sq_tm_ply_id
        LEFT JOIN player p_bal ON p_bal.player_id = stp_bal.player_id

        LEFT JOIN squad_match_players smp_sup ON smp_sup.smp_id = b.sup_ply_id
        LEFT JOIN squad_team_players stp_sup ON stp_sup.sq_tm_ply_id = smp_sup.sq_tm_ply_id
        LEFT JOIN player p_sup ON p_sup.player_id = stp_sup.player_id

        LEFT JOIN matches m ON m.match_id = b.match_id

        WHERE b.match_id = 1 AND b.inning = 1 AND b.is_deleted = false`);

    let [allBatsmenData] = await pool.query(`
      -- batsman data
      SELECT
          p.name AS player_name,
          p.skills as player_skills,
          t.name AS team_name,
          COUNT(*) AS balls_played,
          SUM(b.total_runs) AS runs,
          SUM(b.run_type = "SIX") AS sixes,
          SUM(b.run_type = "FOUR") AS fours,
          SUM(b.run_type = "RUN_BTW_WIC") AS singles
      FROM balls b
      JOIN squad_match_players smp ON b.stricker_id = smp.smp_id
      JOIN squad_team_players stp ON smp.sq_tm_ply_id = stp.sq_tm_ply_id
      JOIN player p ON stp.player_id = p.player_id
      JOIN squad sq ON stp.squad_id = sq.squad_id
      JOIN team t ON sq.team_id = t.team_id
      WHERE
          b.match_id = 1
          AND b.inning = 1
          AND b.is_deleted = FALSE
      GROUP BY
          p.name, t.name, p.skills`);

    let [allBallerData] = await pool.query(`
            SELECT 	p.name AS player_name,
            p.skills as player_skills,
            t.name AS team_name,
            count(*) as total_balls,
            sum(b.total_runs) as total_runs,
            sum(b.wicket_taken = true) as total_wickets,
            sum(b.run_type = "FOUR") as total_fours,
            sum(b.run_type = "SIX") as total_sixes

            from balls b

            JOIN squad_match_players smp ON b.bowler_id = smp.smp_id
            JOIN squad_team_players stp ON smp.sq_tm_ply_id = stp.sq_tm_ply_id
            JOIN player p ON stp.player_id = p.player_id
            JOIN squad sq ON stp.squad_id = sq.squad_id
            JOIN team t ON sq.team_id = t.team_id

            where b.match_id = 1 and b.is_deleted = false
            group by p.name, t.name, p.skills`);

    let [fallOfWicketsWithoutRuns] = await pool.query(`
            SELECT
                b.ball_no,
                b.inning,
                b.total_runs as runs,
                b.match_id,
                b.wicket_taken,
                b.run_type,
                b.ball_type,

                -- Batsman details
                p_bat.name AS batsman_name,
                p_bat.skills AS batsman_skills,
                t_bat.name AS batsman_team,

                -- Bowler details
                p_bal.name AS bowler_name,
                p_bal.skills AS bowler_skills,
                t_bal.name AS bowler_team,

                -- Supporting player (fielder) details
                p_sup.name AS fielder_name,
                p_sup.skills AS fielder_skills,
                t_sup.name AS fielder_team

            FROM balls b

            -- Join for the batsman (stricker_id)
            JOIN squad_match_players smp_bat ON smp_bat.smp_id = b.stricker_id
            JOIN squad_team_players stp_bat ON stp_bat.sq_tm_ply_id = smp_bat.sq_tm_ply_id
            JOIN player p_bat ON p_bat.player_id = stp_bat.player_id
            JOIN team t_bat ON t_bat.team_id = p_bat.team_id

            -- Join for the bowler (bowler_id)
            JOIN squad_match_players smp_bal ON smp_bal.smp_id = b.bowler_id
            JOIN squad_team_players stp_bal ON stp_bal.sq_tm_ply_id = smp_bal.sq_tm_ply_id
            JOIN player p_bal ON p_bal.player_id = stp_bal.player_id
            JOIN team t_bal ON t_bal.team_id = p_bal.team_id

            -- Join for the supporting player (fielder, sup_ply_id)
            LEFT JOIN squad_match_players smp_sup ON smp_sup.smp_id = b.sup_ply_id
            LEFT JOIN squad_team_players stp_sup ON stp_sup.sq_tm_ply_id = smp_sup.sq_tm_ply_id
            LEFT JOIN player p_sup ON p_sup.player_id = stp_sup.player_id
            LEFT JOIN team t_sup ON t_sup.team_id = p_sup.team_id

            WHERE
                b.wicket_taken = true
                AND b.is_deleted = false
                AND b.match_id = 1  -- Filter for the specific match
                AND b.inning = 1  -- Filter for first inning
            ORDER BY b.ball_no`);

    let [fallOfWicketsWithRuns] = await pool.query(`
        SELECT
            b.ball_no,
            b.inning,
            b.total_runs,
            b.match_id,
            b.wicket_taken,

            -- Calculate cumulative runs up to the point where the wicket fell
            (
                SELECT SUM(b2.total_runs)
                FROM balls b2
                WHERE
                    b2.match_id = b.match_id
                    AND b2.inning = b.inning
                    AND b2.ball_no <= b.ball_no
            ) AS runs_at_wicket,

            -- Batsman details
            p_bat.name AS batsman_name,
            p_bat.skills AS batsman_skills,
            t_bat.name AS batsman_team,

            -- Bowler details
            p_bal.name AS bowler_name,
            p_bal.skills AS bowler_skills,
            t_bal.name AS bowler_team

        FROM balls b

        -- Join for the batsman (stricker_id)
        JOIN squad_match_players smp_bat ON smp_bat.smp_id = b.stricker_id
        JOIN squad_team_players stp_bat ON stp_bat.sq_tm_ply_id = smp_bat.sq_tm_ply_id
        JOIN player p_bat ON p_bat.player_id = stp_bat.player_id
        JOIN team t_bat ON t_bat.team_id = p_bat.team_id

        -- Join for the bowler (bowler_id)
        JOIN squad_match_players smp_bal ON smp_bal.smp_id = b.bowler_id
        JOIN squad_team_players stp_bal ON stp_bal.sq_tm_ply_id = smp_bal.sq_tm_ply_id
        JOIN player p_bal ON p_bal.player_id = stp_bal.player_id
        JOIN team t_bal ON t_bal.team_id = p_bal.team_id

        WHERE
            b.wicket_taken = TRUE
            AND b.is_deleted = FALSE
            AND b.match_id = 1  -- Filter for the specific match
            AND b.inning = 1  -- Filter for first inning
        ORDER BY b.ball_no`);

    let [squadsData] = await pool.query(`
        SELECT m.event_name,
        (SELECT GROUP_CONCAT(p.name) FROM player p
        JOIN squad_team_players stp ON p.player_id = stp.player_id
        WHERE stp.squad_id = m.squad_a) AS team_a_players,
        (SELECT GROUP_CONCAT(p.name) FROM player p
        JOIN squad_team_players stp ON p.player_id = stp.player_id
        WHERE stp.squad_id = m.squad_b) AS team_b_players
        FROM matches m
        `);

    let [team_a] = await pool.query(`
            select
            p_a.*
            from matches m
            join squad sq_a on sq_a.squad_id = m.squad_a
            join squad_team_players stp_a on stp_a.squad_id = sq_a.squad_id
            join player p_a on p_a.player_id = stp_a.player_id`);

    let [team_b] = await pool.query(`
            select
           p_b.*
            from matches m
            join squad sq_b on sq_b.squad_id = m.squad_b
            join squad_team_players stp_b on stp_b.squad_id = sq_b.squad_id
            join player p_b on p_b.player_id = stp_b.player_id`);

    let [squad_a] = await pool.query(`
      select 
        p.*, m.match_id, m.event_name  from matches m
        join squad sa on sa.squad_id = m.squad_a
        join squad_team_players stp_a on stp_a.squad_id = sa.squad_id
        join player p on p.player_id = stp_a.player_id
        join squad_match_players smp_a on stp_a.sq_tm_ply_id = smp_a.sq_tm_ply_id
        where smp_a.is_playing = true and smp_a.is_deleted = false`);

    let [squad_b] = await pool.query(`
      select 
        p.*, m.match_id, m.event_name  from matches m
        join squad sa on sa.squad_id = m.squad_b
        join squad_team_players stp_a on stp_a.squad_id = sa.squad_id
        join player p on p.player_id = stp_a.player_id
        join squad_match_players smp_a on stp_a.sq_tm_ply_id = smp_a.sq_tm_ply_id
        where smp_a.is_playing = true and smp_a.is_deleted = false`);

    let [partnership] = await pool.query(`
      select 
        count(*) as ball_count, sum(b.total_runs) as total_runs, str.name as stricker, nstr.name as non_stricker
        from balls b
        join player str on str.player_id = b.stricker_id
        join player nstr on nstr.player_id = b.non_stricker_id
        where ((str.player_id = 12 and nstr.player_id = 13) or (str.player_id = 13 and nstr.player_id = 12)) 
        and b.match_id = 1 and b.is_deleted = false 
        group by str.name , nstr.name`);

    let [lastFallenWicket] = await pool.query(`select  
      b.ball_no, b.inning, b.match_id, 
      pbl.name as bowler, 
      pstr.name as stricker,
      pnstr.name as non_stricker
      -- pspp.name as support_player 
      from balls b
      join player pbl on b.bowler_id = pbl.player_id
      join player pstr on b.stricker_id = pstr.player_id
      join player pnstr on b.non_stricker_id = pnstr.player_id
      -- join player pspp on b.sup_ply_id = pspp.player_id
      where b.wicket_taken = true and b.is_deleted = false and b.inning = 1 and b.match_id = 1
      order by b.ball_no DESC limit 1`);

    return {
      matchInfo,
      squadsData,
      ballSummary,
      allBallerData,
      allBatsmenData,
      fallOfWicketsWithoutRuns,
      fallOfWicketsWithRuns,
      partnership,
      lastFallenWicket,
      team_a,
      team_b,
      squad_a,
      squad_b,
    };
  }
}

module.exports = {
  Dashboard,
};
