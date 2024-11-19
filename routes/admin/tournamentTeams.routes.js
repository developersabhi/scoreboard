const {
  getTournamentTeams,
  addTeamToTournamet,
  updateTeamOfTournament,
  deleteTournamentTeam,
} = require("../../controller/admin/tournamentTeams.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

router.route("/").post(addTeamToTournamet).get(getTournamentTeams);
router
  .route("/:tournament_team_id")
  .patch(updateTeamOfTournament)
  .delete(deleteTournamentTeam);

module.exports = { router };
