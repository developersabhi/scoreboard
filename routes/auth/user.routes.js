const {
  signIn,
  signOut,
  signUp,
} = require("../../controller/auth/user.controller");
const { auth } = require("../../middlewares/auth.middleware.js");

const router = require("express").Router();

router.route("/sign-in").post(signIn);

router.use(auth);

router.route("/sign-up").post(signUp);
router.route("/sign-out").get(signOut);

module.exports = { router };
