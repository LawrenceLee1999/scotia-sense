import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/scat6";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `scat6-${uniqueSuffix}${ext}`);
  },
});

export const uploadScat6 = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("scat6_files", 10);
