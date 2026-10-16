import mongoose from "mongoose";


// DB 접속 주소(아이디/비밀번호 포함)는 코드에 직접 쓰지 않고 .env의 MONGO_URI에서 읽음
const connection_url = process.env.MONGO_URI;
const connect = () => {
  // 배포환경이 아니라면
  if(process.env.NODE_ENV !== "production"){
    mongoose.set("debug", true);
  }

  mongoose
    .connect(connection_url, {
      dbName : "mungpick" 
    })
    .then(() => {
      console.log('Connected to MongoDB!😎')
    })
    .catch((err) => {
      console.error("Connected fail to MongoDB!")
      console.error(err)
    })

}

export default connect;