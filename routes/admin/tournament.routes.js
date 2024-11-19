const {
  createTournament,
  updateTournament,
  getTournaments,
  getTournamentPlayers,
  softDeleteTournament,
  createTournament1,
} = require("../../controller/admin/tournament.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

router.route("/").post(createTournament1).get(getTournaments);
router.route("/:tournament_id").patch(updateTournament);
router.route("/d/:tournament_id").patch(softDeleteTournament);

router.route("/plys").get(getTournamentPlayers);

module.exports = { router };
