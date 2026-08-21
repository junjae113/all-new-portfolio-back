import multer from "multer";
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// 날짜 형식으로 폴더 생성
const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
}

const checkAndCreateDirectory = (folder) => {
    const dirPath = path.join(process.cwd(), 'uploads', folder)
    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, { recursive : true })
    }
}

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dateFolder = getFormattedDate(); // "/25/06/24"
        const uri = req.originalUrl.split('/')
        const typeFolder = uri[uri.length - 1] || "default";
        checkAndCreateDirectory(path.join(typeFolder, dateFolder))
        
        cb(null, path.join('uploads', typeFolder, dateFolder))
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname); // 확장자 추출
        const baseFileName = path.basename(file.originalname, fileExtension); // 확장자를 제외한 원본 파일명
        let fileName = uuidv4() + '-' + baseFileName + fileExtension;
        let filePath = path.join('uploads', getFormattedDate(), fileName)
        let counter = 1;
        
        while(fs.existsSync(filePath)){
            fileName = fileName.replace(fileExtension, `(${counter})${fileExtension}`)
            filePath = path.join("uploads", getFormattedDate(), fileName)
            counter++
        }

        cb(null, fileName)
    }
})

const upload = multer({ storage })

export { upload }