import {v2} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
});


const uploadOnCloud = async (localFilePath) =>{
    try{
        if(!localFilePath) return null;
        //upload the file into the cloud
        const response = await cloudinary.v2.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file is uploaded on Cloundinary ", responses.url);
        return response;
    }
    catch(e){
        fs.unlinkSync(localFilePath)//remove the locally saved tempory file as the upload operation got failed
        return null;
    }
}