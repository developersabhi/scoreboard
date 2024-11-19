const {
  createSquadMatchPlayer,
  updateSquadMatchPlayer,
  deleteSquadMatchPlayer,
} = require("../../controller/admin/squadMatchPlayers.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

router.route("/").post(createSquadMatchPlayer);
router
  .route("/:smp_id")
  .patch(updateSquadMatchPlayer)
  .delete(deleteSquadMatchPlayer);

module.exports = { router };
