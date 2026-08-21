// passport auth 설정값 파일
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as KakaoStrategy } from "passport-kakao";
import { Strategy as NaverStrategy } from "passport-naver-v2";
import User from "../models/userSchema.js";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()
const SECRET_KEY = process.env.SECRET_KEY;

// username, password
const passwordConfig = {
    usernameField: 'user_id', passwordField: 'password'
}

// 로그인 로직
const passwordVerify = async (user_id, password, done) => {
    const user = await User.findOne({user_id : user_id}).lean();

    if(!user){
        console.log("로직 실행")
        return done(null, false, {message: "존재하지 않는 사용자입니다."})
    }

    // 유저 해쉬된 비밀번호를 비교
    const plainPassword = password;
    const hashedPassword = user.password;

    bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
        if(err){
            return done(err)
        }
        
        if(result){
            // 로그인 성공
            return done(null, user)
        }else {
            return done(null, false, { message: '올바르지 않은 비밀번호 입니다.'})
        }
    })
}

// jwt 토큰 검증
const jwtConfig = {
    jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : SECRET_KEY,
}  

// jwt 토큰 검증 로직
const jwtVerify = async (jwtPayload, done) => {
    const user_id = jwtPayload.user_id
    const user = await User.findOne({user_id : user_id}).lean();
    if(!user){
        done(null, false, { message : "올바르지 않은 인증정보 입니다."})
    }

    return done(null, user);
}

// 구글 로그인 설정
const googleConfig = {
    clientID : process.env.GOOGLE_ID,
    clientSecret : process.env.GOOGLE_SECRET,
    callbackURL : "/auth/google/callback"
}

// 구글 로그인 검증
const googleVerify = async (accessToken, refreshToken, profile, done) => {
    const {id, emails, displayName, picture, provider} = profile;
    const email = emails[0].value;

    try {
        let exUser = null
        exUser = await User.findOne({email: email}).lean()

        // 만약 유저가 없다면 새 사용자로 처리 (DB에는 아직 저장하지 않음)
        if(!exUser){
            // user_id 생성 (email 기반으로 고유한 ID 생성)
            const baseUserId = email.split('@')[0];
            let user_id = baseUserId;
            let counter = 1;
            
            // user_id 중복 확인 및 생성
            while (await User.findOne({user_id: user_id})) {
                user_id = `${baseUserId}${counter}`;
                counter++;
            }

            // 새 사용자 정보를 responseData에 포함 (DB에는 아직 저장하지 않음)
            exUser = {
                user_id: user_id,
                email: email,
                name: displayName,
                type: 'social', // 모든 소셜 로그인은 'social'로 통일
                provider: 'google', // provider 필드 추가
                googleId: id, // 구글 ID 저장
                profileComplete: false,
                isNewUser: true
            };
        } else {
            // 기존 사용자는 profileComplete 상태 확인
            exUser.isNewUser = !exUser.profileComplete;
            // 기존 사용자도 name과 email 정보가 있는지 확인
            if (!exUser.name) exUser.name = displayName;
            if (!exUser.email) exUser.email = email;
            // 기존 사용자도 provider 정보 업데이트
            if (!exUser.provider) exUser.provider = 'google';
        }

        const accessToken = jwt.sign(
            {
                user_id: exUser.user_id,
                issuer: 'mungpick',
            },
            SECRET_KEY,
            {
                expiresIn: '24h'
            }
        )

        // 프로필 완료 여부와 함께 응답
        const responseData = {
            accessToken,
            user_id: exUser.user_id,
            name: exUser.name,
            email: exUser.email,
            type: exUser.type,
            provider: exUser.provider, // provider 추가
            profileComplete: exUser.profileComplete || false,
            isNewUser: exUser.isNewUser || !exUser.profileComplete
        }

        done(null, responseData)

    } catch (error) {
        console.log("googleVerify Error")
        console.error(error)
        done(error)
    }
}

// 카카오 로그인 설정
const kakaoConfig = {
    clientID : process.env.KAKAO_KEY,
    callbackURL : "/auth/kakao/callback"
}

// 카카오 로그인 검증
const kakaoVerify = async (accessToken, refreshToken, profile, done) => {
    console.log("kakaoProfile", profile)
    
    try {
        const {id, username, _json} = profile;
        const email = _json.kakao_account?.email;
        const displayName = username || `kakao_${id}`;
        
        let exUser = null;
        if (email) {
            exUser = await User.findOne({email: email}).lean();
        }
        
        // 만약 유저가 없다면 새 사용자로 처리 (DB에는 아직 저장하지 않음)
        if(!exUser){
            // user_id 생성
            let user_id = `kakao_${id}`;
            let counter = 1;
            
            // user_id 중복 확인 및 생성
            while (await User.findOne({user_id: user_id})) {
                user_id = `kakao_${id}_${counter}`;
                counter++;
            }

            // 새 사용자 정보를 responseData에 포함 (DB에는 아직 저장하지 않음)
            exUser = {
                user_id: user_id,
                email: email,
                name: displayName,
                type: 'social', // 모든 소셜 로그인은 'social'로 통일
                provider: 'kakao', // provider 필드 추가
                kakaoId: id, // 카카오 ID 저장
                profileComplete: false,
                isNewUser: true
            };
        } else {
            // 기존 사용자는 profileComplete 상태 확인
            exUser.isNewUser = !exUser.profileComplete;
            // 기존 사용자도 name과 email 정보가 있는지 확인
            if (!exUser.name) exUser.name = displayName;
            if (!exUser.email) exUser.email = email;
            // 기존 사용자도 provider 정보 업데이트
            if (!exUser.provider) exUser.provider = 'kakao';
        }

        const accessToken = jwt.sign(
            {
                user_id: exUser.user_id,
                issuer: 'mungpick',
            },
            SECRET_KEY,
            {
                expiresIn: '24h'
            }
        )

        // 프로필 완료 여부와 함께 응답
        const responseData = {
            accessToken,
            user_id: exUser.user_id,
            name: exUser.name,
            email: exUser.email,
            type: exUser.type,
            provider: exUser.provider, // provider 추가
            profileComplete: exUser.profileComplete || false,
            isNewUser: exUser.isNewUser || !exUser.profileComplete
        }

        done(null, responseData)

    } catch (error) {
        console.log("kakaoVerify Error")
        console.error(error)
        done(error)
    }
}

// 네이버 로그인 설정
const naverConfig = {
    clientID : process.env.NAVER_CLIENT_ID,
    clientSecret : process.env.NAVER_CLIENT_SECRET,
    callbackURL : "/auth/naver/callback"
}

// 네이버 로그인 검증
const naverVerify = async (accessToken, refreshToken, profile, done) => {
    console.log("naverProfile", profile)
    
    try {
        const {id, displayName, emails} = profile;
        const email = emails?.[0]?.value;
        const name = displayName || `naver_${id}`;
        
        let exUser = null;
        if (email) {
            exUser = await User.findOne({email: email}).lean();
        }
        
        // 만약 유저가 없다면 새 사용자로 처리 (DB에는 아직 저장하지 않음)
        if(!exUser){
            // user_id 생성
            let user_id = `naver_${id}`;
            let counter = 1;
            
            // user_id 중복 확인 및 생성
            while (await User.findOne({user_id: user_id})) {
                user_id = `naver_${id}_${counter}`;
                counter++;
            }

            // 새 사용자 정보를 responseData에 포함 (DB에는 아직 저장하지 않음)
            exUser = {
                user_id: user_id,
                email: email,
                name: name,
                type: 'social', // 모든 소셜 로그인은 'social'로 통일
                provider: 'naver', // provider 필드 추가
                naverId: id, // 네이버 ID 저장
                profileComplete: false,
                isNewUser: true
            };
        } else {
            // 기존 사용자는 profileComplete 상태 확인
            exUser.isNewUser = !exUser.profileComplete;
            // 기존 사용자도 name과 email 정보가 있는지 확인
            if (!exUser.name) exUser.name = name;
            if (!exUser.email) exUser.email = email;
            // 기존 사용자도 provider 정보 업데이트
            if (!exUser.provider) exUser.provider = 'naver';
        }

        const accessToken = jwt.sign(
            {
                user_id: exUser.user_id,
                issuer: 'mungpick',
            },
            SECRET_KEY,
            {
                expiresIn: '24h'
            }
        )

        // 프로필 완료 여부와 함께 응답
        const responseData = {
            accessToken,
            user_id: exUser.user_id,
            name: exUser.name,
            email: exUser.email,
            type: exUser.type,
            provider: exUser.provider, // provider 추가
            profileComplete: exUser.profileComplete || false,
            isNewUser: exUser.isNewUser || !exUser.profileComplete
        }

        done(null, responseData)

    } catch (error) {
        console.log("naverVerify Error")
        console.error(error)
        done(error)
    }
}
 
// passport 초기화
const initializePassport = () => {
    passport.use('local', new LocalStrategy(passwordConfig, passwordVerify))
    passport.use('jwt', new JwtStrategy(jwtConfig, jwtVerify))
    passport.use('google', new GoogleStrategy(googleConfig, googleVerify))
    passport.use('kakao', new KakaoStrategy(kakaoConfig, kakaoVerify))
    passport.use('naver', new NaverStrategy(naverConfig, naverVerify))
}

export default initializePassport;