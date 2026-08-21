// 커뮤니티 관련 라우터 (ES6 import/export)

import express from 'express';
import { getPosts, registerPost, removePost, registerReply, removeReply,toggleLike } from '../../controllers/community/communityController.js';
import jwt from 'jsonwebtoken';

const communityRoutes = express.Router();

const requireAuth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if(!token) return res.status(401).json({message : '인증 토큰이 필요합니다.'});
    
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    const userId = payload.user_id || payload.sub || payload.userId || payload.id;
    if(!userId) return res.status(401).json({message : '유효한 사용자 정보가 없습니다.'});

    req.user = {id: userId};
    next();
  } catch {
    return res.status(401).json({message: "토큰 검증 실패"});
  }
}

// 게시글 목록 조회 라우트
communityRoutes.get('/api/get-posts', getPosts);

// 게시글 등록
communityRoutes.post('/api/register-post', requireAuth, registerPost);

// 게시글 삭제
communityRoutes.delete('/api/remove-post/:post_id', requireAuth, removePost);

// 댓글 등록
communityRoutes.post('/api/register-reply', requireAuth, registerReply);

// 댓글 삭제
communityRoutes.delete('/api/remove-reply/:reply_id', requireAuth, removeReply);

// 좋아요 수 
communityRoutes.post('/api/toggle-like/:post_id', requireAuth, toggleLike);



export default communityRoutes; 