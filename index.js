const { createTables } = require("./db/dbConnect");

const userRouter = require("./routes/auth/user.routes");
const adminRouter = require("./routes/admin/admin.routes");
const adBallRouter = require("./routes/admin/balls.routes");

// xxxxxxx
const adCountryRouter = require("./routes/admin/country.routes");
const adTeamRouter = require("./routes/admin/team.routes");
const adTournamentRouter = require("./routes/admin/tournament.routes");
const adPlayerRouter = require("./routes/admin/player.routes");
const adMatchRouter = require("./routes/admin/match.routes");
const adSquadRouter = require("./routes/admin/squad.routes");
const adMatchAssignRouter = require("./routes/admin/matchAssignUser.routes");
const adTournamentTeamsRouter = require("./routes/admin/tournamentTeams.routes");
const adsqdTmPlyRouter = require("./routes/admin/squadTeamPlayers.routes");
const adPlayingSquadPlayers = require("./routes/admin/squadMatchPlayers.routes");

const { httpServer, app } = require("./socketIo/index.socketIo");
const { logger } = require("./lib/utils/logger");
const { Dashboard } = require("./models/app/dashboard.model");

createTables();

app.get("/", async (req, res) => {
  let dashboardData = await Dashboard.dashboardData();
  let matchSummary = await Dashboard.matchInnSumm({ match_id: 2, inning: 1 });
  let ip = req.ip;
  let ips = req.ips;

  return res
    .status(200)
    .send({
      message: "x home page",
      status: 200,
      dashboardData,
      matchSummary,
      ip,
      ips,
    });
});

app.use("/api/v1/auth", userRouter.router);
app.use("/api/v1/admin", adminRouter.router);
app.use("/api/v1/admin/match", adMatchRouter.router);
app.use("/api/v1/admin/assign-usr", adMatchAssignRouter.router);
app.use("/api/v1/admin/ball", adBallRouter.router);
app.use("/api/v1/admin/country", adCountryRouter.router);
app.use("/api/v1/admin/team", adTeamRouter.router);
app.use("/api/v1/admin/tournament", adTournamentRouter.router);
app.use("/api/v1/admin/player", adPlayerRouter.router);
app.use("/api/v1/admin/tour-team", adTournamentTeamsRouter.router);
app.use("/api/v1/admin/squad", adSquadRouter.router);
app.use("/api/v1/admin/sq-tm-ply", adsqdTmPlyRouter.router);
app.use("/api/v1/admin/sq-mtch-ply", adPlayingSquadPlayers.router);

httpServer.listen(process.env.PORT, async () => {
  logger.info(`SERVER RUNNING ON PORT ${process.env.PORT}`);
});

// removed
// const adTeamPlayerRouter = require("./routes/admin/teamPlayers.routes");
// app.use("/api/v1/admin/team-ply", adTeamPlayerRouter.router);
// app.use("/api/v1/public", publicApisRouter.router);
// const publicApisRouter = require("./routes/app/publicApis.routes");
