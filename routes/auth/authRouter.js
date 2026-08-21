import express from "express";
import passport from "passport";
import { localStrategy, jwtStrategy, signup, checkExistingUser, checkEmail } from "../../controllers/auth/authController.js";
import { completeRegistration } from "../../controllers/user/userController.js";

const authRouter = express.Router();

// 회원가입 라우트
authRouter.post("/signup", signup);

authRouter.post("/users/register", signup);

authRouter.post("/check-email", checkEmail);

// 기존 사용자 확인 라우트 (소셜 로그인용)
authRouter.post("/check-existing-user", checkExistingUser);

// 회원가입 완료 API 추가
authRouter.post("/users/complete-registration", completeRegistration);

// 이메일, 비밀번호 로그인 전략
authRouter.post("/local", passport.authenticate('local', { session : false }), localStrategy)

// jwt 토큰 전략
authRouter.post("/jwt", passport.authenticate('jwt', {session: false}), jwtStrategy)

// 구글 로그인 전략
const clientUrl = "http://localhost:3000"
authRouter.get('/google', passport.authenticate('google', { session : false, scope: ['profile', 'email']}))
authRouter.get(
    '/google/callback', passport.authenticate('google', 
    { session : false, failureRedirect : clientUrl }), 
    (req, res) => {
        const { accessToken, profileComplete, isNewUser } = req.user;
        
        // 프로필 완료 여부에 따라 다른 페이지로 리다이렉트
        if (isNewUser) {
            // 새 사용자: 약관동의 페이지부터 시작 (일반 회원가입과 동일한 플로우)
            return res.redirect(`${clientUrl}/sign-up?accessToken=${accessToken}&user_id=${req.user.user_id}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&provider=${req.user.provider}&isNewUser=true`)
        } else {
            // 기존 사용자: 메인 페이지로
            return res.redirect(`${clientUrl}/main?accessToken=${accessToken}`)
        }
    }
)

authRouter.get("/kakao", passport.authenticate('kakao', { session : false }))
authRouter.get("/kakao/callback", passport.authenticate('kakao', { failureRedirect: clientUrl }), (req, res) => {
    const { accessToken, profileComplete, isNewUser } = req.user;
    
    // 프로필 완료 여부에 따라 다른 페이지로 리다이렉트
    if (isNewUser) {
        // 새 사용자: 약관동의 페이지부터 시작 (일반 회원가입과 동일한 플로우)
        return res.redirect(`${clientUrl}/sign-up?accessToken=${accessToken}&user_id=${req.user.user_id}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&provider=${req.user.provider}&isNewUser=true`)
    } else {
        // 기존 사용자: 메인 페이지로
        return res.redirect(`${clientUrl}/main?accessToken=${accessToken}`)
    }
})

authRouter.get("/naver", passport.authenticate('naver', { session : false, authType : 'reprompt' }))
authRouter.get("/naver/callback", passport.authenticate('naver', { failureRedirect: clientUrl }), (req, res) => {
    const { accessToken, profileComplete, isNewUser } = req.user;
    
    // 프로필 완료 여부에 따라 다른 페이지로 리다이렉트
    if (isNewUser) {
        // 새 사용자: 약관동의 페이지부터 시작 (일반 회원가입과 동일한 플로우)
        return res.redirect(`${clientUrl}/sign-up?accessToken=${accessToken}&user_id=${req.user.user_id}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&provider=${req.user.provider}&isNewUser=true`)
    } else {
        // 기존 사용자: 메인 페이지로
        return res.redirect(`${clientUrl}/main?accessToken=${accessToken}`)
    }
})

export default authRouter;