import express from "express";
import { upload } from "../../middleware/multer.js";
import { uploadProfileImage, uploadImage } from "../../controllers/images/imagesController.js";

const imageRouter = express.Router();

// 프로필 이미지 업로드
imageRouter.post("/profile", upload.single('profileImage'), uploadProfileImage);


export default imageRouter;