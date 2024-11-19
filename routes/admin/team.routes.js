const {
  createTeam,
  updateTeam,
  getTeams,
} = require("../../controller/admin/team.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

router.route("/").post(createTeam).get(getTeams);
router.route("/:team_id").patch(updateTeam);

module.exports = { router };
