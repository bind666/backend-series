import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { removeVideoOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { getVideoDurationInSeconds } from "get-video-duration";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, userId } = req.query
    const skip = (page - 1) * limit;
    //TODO: get all videos based on query, sort, pagination

    const videos = await Video.find({})
        .select("-_id -isPublished -createdAt -updatedAt -__v")

    return res.status(200).json(new ApiResponse(200, { videos }, "videos fetched"))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(422, "Title and description required.")
    }

    const videoLocalPath = req.files.videoFile[0].path;
    const thumbnailLocalPath = req.files.thumbnail[0].path;

    if (!videoLocalPath) {
        throw new ApiError(422, "videoFile is required.")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(422, "thumbnail is required.")
    }

    let duration;
    try {
        // Get video duration using get-video-duration
        duration = await getVideoDurationInSeconds(videoLocalPath);
    } catch (err) {
        throw new ApiError(500, `Error getting video metadata: ${err.message}`);
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!video) {
        throw new ApiError(422, "videoFile is required.")
    }

    if (!thumbnail) {
        throw new ApiError(422, "thumbnail is required.")
    }

    const videos = await Video.create({
        title,
        description,
        videoFile: video.url,
        thumbnail: thumbnail.url,
        duration: duration,
        owner: req.user._id,
    })

    return res.status(200).json(new ApiResponse(200, { videos }, "video uploaded successfully."))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!videoId) {
        throw new ApiError(422, "videoId required.")
    }

    const video = await Video.findById({ _id: videoId }).select("-_id -isPublished -createdAt -updatedAt -__v")

    if (!video) {
        throw new ApiError(402, "invalid id.")
    }

    return res.status(200).json(new ApiResponse(200, { video }, "video fetched."))

})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    const { videoId } = req.params
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file.path
    // console.log(req.file.path);
    if (!videoId) {
        throw new ApiError(422, "videoId required.")
    }

    const video = await Video.findOne({ _id: videoId, owner: req.user._id })
    if (!video) {
        throw new ApiError(422, "invalid request.")
    }

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        video.thumbnail = thumbnail.url || video.thumbnail.url

    }

    video.title = title || video.title
    video.description = description || video.description

    await video.save();

    return res.status(200).json(new ApiResponse(200, { video }, "update Video details successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    //TODO: delete video
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(422, "videoId required.")
    }

    const video = await Video.findOne({ _id: videoId, owner: req.user._id })

    if (!video) {
        throw new ApiError(422, "invalid request.")
    }

    const key = video.videoFile.split("/youtube/")[1].split(".")[0]
    const isVideoDeleted = await removeVideoOnCloudinary(key)

    await video.deleteOne();

    return res.status(200).json(new ApiResponse(200, null, "video deleted successfully."))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}