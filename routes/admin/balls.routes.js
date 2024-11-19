const {
  createBall,
  updateBall,
  addBall,
  update,
  undoBall,
  redoBall,
} = require("../../controller/admin/ball.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

// router.route("/").post(createBall);
router.route("/:ball_id").patch(updateBall);
router.route("/add").post(addBall);
router.route("/update/:ball_id").patch(update);
router.route("/undo_ball/:ball_id").put(undoBall);
router.route("/redo_ball/:ball_id").put(redoBall);

module.exports = { router };
