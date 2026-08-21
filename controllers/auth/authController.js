import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import User from '../../models/userSchema.js'

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

// 회원가입 함수
export const signup = async (req, res) => {
    try {
        // 디버깅 로그 추가
        console.log('=== 회원가입 요청 데이터 ===');
        console.log('전체 요청 바디:', req.body);
        console.log('isSocialLogin:', req.body.isSocialLogin);
        console.log('provider:', req.body.provider);
        console.log('password 존재 여부:', !!req.body.password);

        const { user_id, email, password, name, tel, ad_yn = false, pri_yn = true, type = 'i', birth, isSocialLogin, provider } = req.body;

        // 추가 디버깅
        console.log('파싱된 데이터:', { user_id, email, password, name, tel, birth, isSocialLogin, provider });

        // 소셜 로그인 사용자인지 확인 (문자열 "true"도 체크)
        if (isSocialLogin === true || isSocialLogin === "true") {
            console.log('소셜 로그인 사용자로 인식됨 - password 검증 스킵');
            
            // 소셜 로그인 사용자는 password 검증 스킵
            if (!name || !tel || !birth || !email) {
                console.log('소셜 로그인 사용자 필수 정보 누락:', { name, tel, birth, email });
                return res.status(400).json({ 
                    success: false, 
                    message: "필수 정보가 누락되었습니다. (이름, 휴대폰 번호, 생년월일, 이메일)" 
                });
            }
            
            // 소셜 로그인 사용자는 password 형식 검증 스킵
            // 비밀번호 해시화도 스킵 (소셜 로그인은 별도 처리)
            console.log('소셜 로그인 사용자 password 검증 스킵 완료');
        } else {
            console.log('일반 회원가입 사용자로 인식됨 - password 검증 수행');
            
            // 일반 회원가입 사용자는 기존 로직 유지
            if (!user_id || !password || !name) {
                console.log('일반 회원가입 사용자 필수 정보 누락:', { user_id, password: !!password, name });
                return res.status(400).json({ 
                    success: false, 
                    message: "필수 정보가 누락되었습니다. (user_id, password, name)" 
                });
            }
            
            // 일반 회원가입 사용자는 비밀번호 형식 검증
            const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
            if (!passwordRegex.test(password)) {
                console.log('일반 회원가입 사용자 비밀번호 형식 오류');
                return res.status(400).json({ 
                    success: false, 
                    message: "비밀번호는 영문, 숫자, 특수문자를 포함한 8자리 이상으로 입력해주세요." 
                });
            }
            console.log('일반 회원가입 사용자 password 검증 완료');
        }

        // 아이디 형식 검증 (소셜 로그인도 동일하게 적용)
        const userIdRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,}$/;
        if (!userIdRegex.test(user_id)) {
            console.log('아이디 형식 오류:', user_id);
            return res.status(400).json({ 
                success: false, 
                message: "아이디는 영문과 숫자를 포함한 6자리 이상으로 입력해주세요." 
            });
        }
        console.log('아이디 형식 검증 완료');

        // 이메일이 제공된 경우 형식 검증
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log('이메일 형식 오류:', email);
                return res.status(400).json({ 
                    success: false, 
                    message: "올바른 이메일 형식이 아닙니다." 
                });
            }
            console.log('이메일 형식 검증 완료');
        }

        // 전화번호 형식 검증 (선택사항)
        if (tel) {
            const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$|^01[0-9]\d{8,11}$/;
            if (!phoneRegex.test(tel.toString())) {
                console.log('전화번호 형식 오류:', tel);
                return res.status(400).json({ 
                    success: false, 
                    message: "올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678 또는 01012345678)" 
                });
            }
            console.log('전화번호 형식 검증 완료');
        }

        // 중복 사용자 확인
        console.log('중복 사용자 확인 시작');
        const existingUser = await User.findOne({
            $or: [
                { user_id: user_id },
                ...(email ? [{ email: email }] : [])
            ]
        });
        
        if (existingUser) {
            console.log('중복 사용자 발견:', { user_id, email });
            return res.status(409).json({ 
                success: false, 
                message: "이미 존재하는 사용자 ID 또는 이메일입니다." 
            });
        }
        console.log('중복 사용자 확인 완료');

        // 사용자 생성 데이터 준비
        let userData = {
            user_id, email, name, tel: tel ? tel.toString() : undefined, ad_yn, pri_yn, type, birth, profileComplete: false
        };

        // 소셜 로그인 사용자인 경우
        if (isSocialLogin) {
            userData = {
                ...userData,
                isSocialLogin: true,
                provider: provider,  // 기본값 제거하고 전달받은 값 그대로 사용
            };
            
            // provider 값 디버깅 로그 추가
            console.log('소셜 로그인 provider 값:', provider);
            console.log('최종 userData:', userData);
        } else {
            console.log('일반 회원가입 사용자 데이터 준비 - 비밀번호 해시화');
            // 일반 회원가입 사용자는 비밀번호 해시화
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            userData.password = hashedPassword;
        }

        console.log('최종 사용자 데이터:', userData);

        // 새 사용자 생성
        console.log('사용자 생성 시작');
        const newUser = new User(userData);
        await newUser.save();
        console.log('사용자 생성 완료:', newUser.user_id);

        // JWT 토큰 생성
        console.log('JWT 토큰 생성 시작');
        const accessToken = jwt.sign(
            { user_id: newUser.user_id, email: newUser.email, issuer: 'mungpick' },
            SECRET_KEY,
            { expiresIn: '24h' }
        );
        console.log('JWT 토큰 생성 완료');

        // 응답 데이터 (비밀번호 제외)
        const userResponse = {
            user_id: newUser.user_id,
            email: newUser.email,
            name: newUser.name,
            tel: newUser.tel,
            ad_yn: newUser.ad_yn,
            pri_yn: newUser.pri_yn,
            type: newUser.type,
            birth: newUser.birth,
            profileComplete: newUser.profileComplete,
            createdAt: newUser.createdAt,
            isSocialLogin: newUser.isSocialLogin || false,
            provider: newUser.provider || null
        };

        console.log('회원가입 성공 응답 전송');
        res.status(201).json({
            success: true,
            message: "회원가입이 완료되었습니다!",
            accessToken: accessToken,
            user: userResponse
        });

    } catch (error) {
        console.error("회원가입 오류:", error);
        res.status(500).json({ 
            success: false, 
            message: "회원가입 중 오류가 발생했습니다." 
        });
    }
};

// 소셜 로그인 사용자의 기존 사용자 확인
export const checkExistingUser = async (req, res) => {
    try {
        console.log('=== 기존 사용자 확인 API 호출 ===');
        console.log('요청 바디:', req.body);
        
        const { email, provider } = req.body;
        
        if (!email || !provider) {
            return res.status(400).json({
                success: false,
                message: "이메일과 제공자 정보가 필요합니다."
            });
        }
        
        // 이메일로 기존 사용자 확인
        const existingUser = await User.findOne({ email: email }).lean();
        
        if (existingUser) {
            console.log('기존 사용자 발견:', existingUser.user_id);
            return res.status(200).json({
                success: true,
                exists: true,
                user: {
                    user_id: existingUser.user_id,
                    name: existingUser.name,
                    email: existingUser.email,
                    type: existingUser.type
                }
            });
        } else {
            console.log('신규 사용자 - 이메일 없음');
            return res.status(200).json({
                success: true,
                exists: false,
                user: null
            });
        }
        
    } catch (error) {
        console.error('기존 사용자 확인 오류:', error);
        res.status(500).json({
            success: false,
            message: "기존 사용자 확인 중 오류가 발생했습니다."
        });
    }
};

// 이메일 중복확인 함수
export const checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                message: "이메일을 입력해주세요." 
            });
        }
        
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: "올바른 이메일 형식이 아닙니다." 
            });
        }
        
        // 이메일로 기존 사용자 확인
        const existingUser = await User.findOne({ email: email });
        
        if (existingUser) {
            // 기존 사용자가 있는 경우
            return res.status(200).json({ 
                success: true,
                exists: true,
                isSocialLogin: existingUser.isSocialLogin || false,
                message: existingUser.isSocialLogin ? 
                    "이미 소셜 로그인으로 가입된 이메일입니다." : 
                    "이미 가입된 이메일입니다."
            });
        } else {
            // 사용 가능한 이메일
            return res.status(200).json({ 
                success: true,
                exists: false,
                message: "사용 가능한 이메일입니다."
            });
        }
        
    } catch (error) {
        console.error("이메일 중복확인 오류:", error);
        res.status(500).json({ 
            success: false, 
            message: "이메일 중복확인 중 오류가 발생했습니다." 
        });
    }
};

// 로컬 로그인 전략
export const localStrategy = async (req, res, next) => {
    const error = req.error; // 오류
    const authenticatedUser = req.user; // 인증된 유저
    const info = req.info;
    console.log("authenticatedUser", authenticatedUser)

    if(error || !authenticatedUser){
        return res.status(400).json({message: info.message})
    }
    
    // jwt토큰을 발급 해주자!
    req.login(authenticatedUser, {session : false}, async (loginError) => {
        if(loginError) {
            return res.status(400).json({message : "알 수 없는 오류 발생!"})
        }

        // jwt.sign(토큰에 담을 정보, 시크릿 키, 옵션)
        const accessToken = jwt.sign(
            {
                user_id : authenticatedUser.user_id,
                issuer : 'mungpick',
            },
            SECRET_KEY,
            {
                expiresIn : '24h'
            }
        )

        // 비밀번호 제외하고 사용자 정보 반환
        const { password: _, ...currentUser } = authenticatedUser;

        return res.status(200).json({
            loginSuccess: true,
            currentUser: currentUser,
            isLogin: true,
            accessToken: accessToken,
            message: "로그인 완료!"
        })
    })
}

// jwt 토큰 전략
export const jwtStrategy = async (req, res, next) => {
    try {
        const jwtAuthenticatedUser = req.user;
        const {password, ...user} = jwtAuthenticatedUser;
    
        res.status(200).json({
            message : "자동 로그인 성공",
            user: user
        })
    } catch (error) {
        console.log("authController jwtStrategy error")
        console.error(error)
        next(error)
    }
}