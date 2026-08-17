import express from 'express'
import { addCourse, getCourseDetails, listCourse, removeCourse, updateCourseQuantity } from '../controllers/CourseController'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const courseRouter = express.Router();

const uploadDir = process.env.VERCEL
  ? "/tmp"
  : path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage });

courseRouter.post("/add", upload.single("image"), addCourse);
courseRouter.get("/list", listCourse);
courseRouter.get("/:id", getCourseDetails);
courseRouter.post("/update-quantity", updateCourseQuantity);
courseRouter.post("/remove", removeCourse);

export default courseRouter;