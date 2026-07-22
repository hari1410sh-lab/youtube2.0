import express from "express";
import { 
  addComment, 
  getComments, 
  deleteComment,
  likeComment,
  dislikeComment,
  reportComment,
  translateComment,
} from "../models/controller/comment.js";

const router = express.Router();

router.post("/:videoId", addComment);
router.get("/:videoId", getComments);
router.delete("/:id", deleteComment);
router.patch("/:id/like", likeComment);
router.patch("/:id/dislike", dislikeComment);
router.post("/:id/report", reportComment);
router.post("/:id/translate", translateComment);

export default router;
