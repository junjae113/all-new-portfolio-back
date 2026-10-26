# 🐶 멍픽 MungPick — Backend

멍픽의 Express API 서버입니다. 프로젝트 소개 · 개발 스토리 · 트러블슈팅은 [프론트엔드 레포 README](https://github.com/junjae113/all-new-portfolio)에 정리되어 있습니다.

![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Passport](https://img.shields.io/badge/Passport-34E27A?style=flat-square&logo=passport&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black)

## API

| 경로 | 설명 |
|---|---|
| `/auth` | 회원가입, 로그인(local · JWT), 카카오 · 구글 OAuth |
| `/users` | 회원 · 강아지 프로필 |
| `/calendar/api` | 일정 · 일기 |
| `/community` | 게시글 · 댓글 |
| `/likes` | 좋아요 |
| `/inquiry/api` | 1:1 문의 · 답변 |
| `/images`, `/uploads` | 이미지 업로드(Multer) · 정적 서빙 |
| `/matching`, `/chatting/api` | 친구 매칭 · 채팅 (현재 비활성화) |

## 폴더 구조

```
├─ app.js          # 서버 · 미들웨어 · 라우터 · Socket.io 설정
├─ auth/           # Passport 전략 (local · JWT · Google · Kakao)
├─ connect/        # MongoDB 연결
├─ models/         # Mongoose 스키마
├─ routes/         # 경로 → 컨트롤러 연결
├─ controllers/    # 비즈니스 로직
├─ middleware/     # Multer
└─ utils/
```

## 실행 방법

```bash
npm install
cp .env.example .env   # 값 입력
npm start              # http://localhost:8000
```
