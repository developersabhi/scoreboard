const {
  createMatch,
  updateMatchResult,
  toggleMatchStatus,
  tossUpdate,
  getAllMatches,
  getLiveMatches,
  getTodaysMatches,
  getTomarroMatches,
  getMatchesByDate,
} = require("../../controller/admin/match.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

router.get("/live", getLiveMatches);
router.get("/tdy", getTodaysMatches);
router.get("/tmrro", getTomarroMatches);
router.get("/dte", getMatchesByDate);
router.route("/").post(createMatch).get(getAllMatches);
router.route("/:match_id").patch(toggleMatchStatus);
router.route("/:match_id/res").patch(updateMatchResult);
router.route("/toss/:match_id").patch(tossUpdate);
module.exports = { router };
