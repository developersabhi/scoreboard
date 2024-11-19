const {
  createSquadTeamPlayer,
  updateSquadTeamPlayer,
  getSquadPlayers,
  addSquadTeamPlayerByTourTeamIds,
} = require("../../controller/admin/squadTeamPlayers.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

router
  .route("/")
  .post(createSquadTeamPlayer)
  .get(getSquadPlayers)
  .patch(updateSquadTeamPlayer);
router.route("/add").post(addSquadTeamPlayerByTourTeamIds);

module.exports = { router };
