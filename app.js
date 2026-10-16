// .env를 가장 먼저 불러오기 (다른 파일들이 import될 때 이미 환경변수가 준비되도록)
import "dotenv/config";

// bodyParser는 Express 4.16+에서 내장되어 있음
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import http from 'http';
import passport from "passport";
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from "url";
import initializePassport from "./auth/auth.js";
import connect from "./connect/connect.js";
import authRouter from "./routes/auth/authRouter.js";
import rootRouter from "./routes/rootRouter.js";
import socketRouter from "./routes/socket/socketRouter.js";

// 1. db : DBMS 연결 설정
// 2. app.js(server.js): 서버 설정, 미들웨어 설정, 라우터 설정
// 3. 스키마 정의
// 4. controller 비즈니스 로직 작성
// 5. router : 요청한 경로에 맞는 controller를 실행하도록 작성
// 6. utils : 추가적인 유틸함수 또는 중복되는 코드를 하나로 합치는 코드 작성
// 2 ~ 6번까지 반복

connect()

const app = express()
// 배포 환경(Render)은 프록시 뒤에서 동작 → https 주소를 제대로 인식하게 함 (소셜 로그인 콜백용)
app.set("trust proxy", 1);
const port = process.env.PORT || 8000;

// 프론트엔드 주소 (배포 시 .env의 CLIENT_URL만 바꾸면 됨)
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// dotenv 사용
dotenv.config()

// 웹소켓과 express 통합
const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    // origin: "*",
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})


// cors 설정
// app.use()는 미들웨어로서,
// 어떤 요청이든 지정된 로직보다 먼저 작업한다. 즉 전처리이다.
app.use(cors({
  origin : CLIENT_URL,
  methods : ['GET', 'POST', 'PUT', 'DELETE'],
  // credentials : true
}))

app.use(express.json())

// extended true, qs모듈을 사용하여 쿼리스트링 인식
app.use(express.urlencoded({extended : false}))
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   next()
// })

// passport 설정
app.use(passport.initialize())
initializePassport()

// 이미지 정적 서빙
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename);

// 폴더를 정적으로 서빙 (URL: "/uploads/...")
app.use("/uploads", express.static(path.join(__dirname, 'uploads')))

app.use("/auth", authRouter);

app.use("/", rootRouter);


// app.listen(port, () => {
//   console.log("Express Server Start!")
// })

socketRouter(io)

server.listen(port, () => {
  console.log(`웹 소켓, express 통합 실행!`)
})


