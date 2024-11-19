const {
  fetchAllUsers,
  fetchUsersByRole,
  fetchAccUserRef,
  changeUserPassword,
  toggleUserStatus,
} = require("../../controller/admin/admin.controller");
const { auth } = require("../../middlewares/auth.middleware");

const router = require("express").Router();

router.use(auth);

router.route("/fetch/all").get(fetchAllUsers);
router.route("/fetch/by-role").get(fetchUsersByRole);
router.route("/fetch/by-ref").get(fetchAccUserRef);
router.route("/chng-usr-pswd").patch(changeUserPassword);
router.route("/tgl-usr-sts/:cust_user_id").patch(toggleUserStatus);

module.exports = { router };
