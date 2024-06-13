import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from './apierror.js';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "youtube",
      resource_type: "auto"
    })

    // file has been uploaded successfully
    // console.log("file is uploaded on cloudinary", response.url);

    fs.unlinkSync(localFilePath)
    return response;

  } catch (error) {
    fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
    return null
  }
}

const removeVideoOnCloudinary = async (key) => {

  try {
    if (!key) {
      throw new ApiError(422, "key required.")
    }

    //o6soje7gjxdjfa8mzc8f
    await cloudinary.api.delete_resources([`youtube/${key}`],
      { type: 'upload', resource_type: 'video' })
  } catch (error) {
    throw new ApiError(409, error.message)
  }

}


export { uploadOnCloudinary, removeVideoOnCloudinary }







// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" },
//   function (error, result) { console.log(result); });