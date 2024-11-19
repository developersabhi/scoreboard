const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadFolderPath = "./public/temp";

    if (!fs.existsSync(uploadFolderPath))
      fs.mkdirSync(uploadFolderPath, { recursive: true });

    cb(null, uploadFolderPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "file_" + uniqueSuffix + file.originalname.replace(" ", "_"));
  },
});

const upload = multer({ storage: storage });

module.exports = { upload };
