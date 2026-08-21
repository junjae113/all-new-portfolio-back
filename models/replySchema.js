import { Schema, model } from "mongoose";

// 댓글 스키마
const replySchema = new Schema({
  reply_id: { type: String, required: true, unique: true }, // 댓글 ID
  post_id: { type: String, required: true }, // 게시글 ID
  user_id: { type: String, required: true }, // 회원 ID
  user_id2: { type: String }, // 답글 대상 회원 ID (필요시)
  reply_content: { type: String, required: true }, // 댓글 내용
  created_at: { type: Date, default: Date.now }, // 댓글 작성 시간
});

export default model("Reply", replySchema, "replies"); 