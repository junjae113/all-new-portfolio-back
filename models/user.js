// 유저 스키마 및 모델 정의 (ES6 import/export)

import mongoose from 'mongoose';

// const uri = '여기에_당신의_MONGO_URI_복붙';
// await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});
// const User = mongoose.model('User', userSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User; 