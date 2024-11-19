const {
  assignMatchToUser,
  updateMatchAssignedUser,
  getAgentsOfMatch,
  getassignMatchToUser,
} = require("../../controller/admin/matchAssignUser.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

router.route("/").post(assignMatchToUser).get(getAgentsOfMatch);
router.route("/:match_assign_user_id").patch(updateMatchAssignedUser);
router.route("/matches").get(getassignMatchToUser)
// router.route("/:mth_usr_id").patch(updateMatchAssignedUser);

module.exports = { router };
