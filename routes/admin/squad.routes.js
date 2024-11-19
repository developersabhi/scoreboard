const {
  updateSquad,
  deleteSquad,
  addSquadInTournament,
  getSquads,
  getTournamentSquads,
} = require("../../controller/admin/squad.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

router.route("/").post(addSquadInTournament).get(getSquads);
router.route("/tour").get(getTournamentSquads);
router.route("/:squad_id").patch(updateSquad).delete(deleteSquad);

module.exports = { router };
