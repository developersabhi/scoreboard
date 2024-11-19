const {
  createPlayer,
  updatePlayer,
  deletePlayer,
  getAllPlayersInfo,
  getTeamPlayers,
} = require("../../controller/admin/player.controller");
const { auth } = require("../../middlewares/auth.middleware");
const { upload } = require("../../middlewares/multer.middleware");

const router = require("express").Router();

router.use(auth);
router.use(upload.single("profile_pic"));

router.route("/").post(createPlayer).get(getAllPlayersInfo);
router.route("/:player_id").patch(updatePlayer).delete(deletePlayer);
router.route("/team").get(getTeamPlayers);

module.exports = { router };
