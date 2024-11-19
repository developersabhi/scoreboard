const {
  createCountry,
  updateCountry,
  getCountry,
} = require("../../controller/admin/country.controller");
const { auth } = require("../../middlewares/auth.middleware");
const { upload } = require("../../middlewares/multer.middleware");

const router = require("express").Router();

router.use(auth);
router.use(upload.single("logo"));

router.route("/").post(createCountry).get(getCountry);
router.route("/:country_id").patch(updateCountry);

module.exports = { router };
