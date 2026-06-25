import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloud = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        console.log("File uploaded to Cloudinary:", response.url);
        fs.unlinkSync(localFilePath); // delete local temp file after successful upload
        return response;

    } catch (e) {
        console.error("Cloudinary upload FAILED:", e.message);
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // remove the locally saved temp file
        }
        return null;
    }
};

export { uploadOnCloud };