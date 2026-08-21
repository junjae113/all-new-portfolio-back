// 프로필 이미지 업로드 컨트롤러
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "이미지 파일이 없습니다."
            });
        }

        // 이미지 URL 생성
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile/${req.file.filename}`;
        
        res.status(200).json({
            success: true,
            message: "프로필 이미지 업로드 성공",
            imageUrl: imageUrl,
            filename: req.file.filename
        });
        
    } catch (error) {
        console.error("프로필 이미지 업로드 오류:", error);
        res.status(500).json({
            success: false,
            message: "이미지 업로드 중 오류가 발생했습니다."
        });
    }
};

// 일반 이미지 업로드 컨트롤러 (uploadImage 함수 추가)
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "이미지 파일이 없습니다."
            });
        }

        // 이미지 URL 생성
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile/${req.file.filename}`;
        
        res.status(200).json({
            success: true,
            message: "이미지 업로드 성공",
            imageUrl: imageUrl,
            filename: req.file.filename
        });
        
    } catch (error) {
        console.error("이미지 업로드 오류:", error);
        res.status(500).json({
            success: false,
            message: "이미지 업로드 중 오류가 발생했습니다."
        });
    }
};