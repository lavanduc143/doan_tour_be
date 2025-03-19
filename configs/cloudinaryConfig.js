import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Cấu hình Multer + Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "tours", // Tên folder trong Cloudinary
    format: async () => "png", // Định dạng mặc định
    transformation: [{ width: 800, height: 600, crop: "limit" }], // Giới hạn kích thước
  },
});

const upload = multer({ storage });

// Middleware upload ảnh
const uploadMiddleware = upload.single("photo");

export { cloudinary, uploadMiddleware };
