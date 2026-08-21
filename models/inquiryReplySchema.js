import { Schema, model } from "mongoose";
import { getCurrentTime } from "../utils/utils.js";

const inquiryReplySchema = new Schema({
 reply_id : { type: String, required: true, unique: true }, // 답변 id
 inquiry_id : { type: String, required: true }, // 문의글 id
 user_id : { type: String, required: true }, // 회원 id
 user_name : { type: String, required: true }, //회원 이름
 reply_content : { type: String, required: true }, // 답변 내용
 created_at : { type: Date, default: getCurrentTime } // 생성 시간
});

export default model("InquiryReply", inquiryReplySchema, "inquiryReply")