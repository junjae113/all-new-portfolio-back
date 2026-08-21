import { Schema, model } from "mongoose";

// 게시글 스키마
const postSchema = new Schema({
  post_id: { type: String, required: true, unique: true }, // 게시글 ID
  user_id: { type: String, required: true }, // 회원 ID
  created_at: { type: Date, default: Date.now }, // 게시글 작성 시간
  title: { type: String, required: true }, // 게시글 제목
  content: { type: String, required: true }, // 게시글 내용
  like_count: { type: Number, default: 0 }, // 좋아요 수
  comment_count: { type: Number, default: 0 }, // 댓글 수
});

export default model("Post", postSchema, "posts"); 