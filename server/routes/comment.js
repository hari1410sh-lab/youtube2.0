import express from "express";
import { addComment, getComments, deleteComment } from "../models/controller/comment.js";

const router = express.Router();

router.post("/:videoId", addComment);
router.get("/:videoId", getComments);
router.delete("/:id", deleteComment);

export default router;
