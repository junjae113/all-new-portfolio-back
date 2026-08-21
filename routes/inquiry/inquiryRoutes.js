import express from 'express';
import { getInquiryReply, getInquiry, postInquiry, postInquiryReply, getInquiryById } from '../../controllers/inquiry/inquiryController.js';
import jwt from 'jsonwebtoken';
const inquiryRoutes = express.Router();

const requireAuth = (req, res, next) => {
 try {
  const auth = req.headers.authorization || '';
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if(!token) {
   return res.status(401).json({message : '인증 토큰이 필요합니다'});
  }

  const payload = jwt.verify(token, process.env.SECRET_KEY);
  const user_id = payload.user_id;
  if(!user_id) {
   return res.status(401).json({message : '유효한 사용자 정보가 없습니다'})
  }

  req.user = {
   user_id : user_id,
  }
  next();
 } catch {
  return res.status(401).json({message : '토큰 검증 실패'})
 }
}

// 문의글 등록
// http://localhost:8000/inquiry/api/post-inquiry
inquiryRoutes.post('/post-inquiry', requireAuth, postInquiry)

// 문의글 전체 조회
// http://localhost:8000/inquiry/api/get-inquiry
inquiryRoutes.get('/get-inquiry', getInquiry)

// 문의글 하나만 조회
// http://localhost:8000/inquiry/api/get-inquiry-detail/:id
inquiryRoutes.get('/get-inquiry-detail/:id', getInquiryById)

// 문의글 답글 등록
// http://localhost:8000/inquiry/api/post-inquiry-reply
inquiryRoutes.post('/post-inquiry-reply', requireAuth, postInquiryReply)

// 문의글 답글 조회
// http://localhost:8000/inquiry/api/get-inquiry-reply
inquiryRoutes.get('/get-inquiry-reply/:id', getInquiryReply)



export default inquiryRoutes