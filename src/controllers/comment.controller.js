import mongoose from "mongoose";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query
    const skip = (page - 1) * limit;

    if (!videoId) {
        throw new ApiError(422, "videoId required.")
    }

    const comment = await Comment.find({ video: videoId }).populate({
        path: "owner",
        model: "User",
        select: "-refreshToken -password -createdAt -__v -updatedAt -email -fulNname"
    }).select("-createdAt -updatedAt -__v")

    if (!comment) {
        throw new ApiError(409, "invalid Videoid")
    }

    return res.status(200).json(new ApiResponse(200, comment, "comment fetched successfully"));
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    //content:- comment
    const { content } = req.body

    if (!videoId) {
        throw new ApiError(422, "videoId required.")
    }

    if (!content) {
        throw new ApiError(422, "comment required.")
    }

    const isVideoIdExist = await Video.findById({ _id: videoId })
    if (!isVideoIdExist) {
        throw new ApiError(404, "Invalid VideoId or Video doesn't exist.")
    }

    const individualCommentCount = await Comment.countDocuments({ video: videoId, owner: req.user._id })
    if (individualCommentCount >= 8) {
        throw new ApiError(409, "max commentCount reached.")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    return res.status(200).json(new ApiResponse(200, { comment }, "comment added successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params;
    const { content } = req.body

    if (!commentId) {
        throw new ApiError(422, "commentid required.")
    }
    if (!content) {
        throw new ApiError(422, "content required.")
    }

    const comment = await Comment.findByIdAndUpdate({ _id: commentId }, { content }, { new: true })
        .select("-createdAt -updatedAt -__v")

    if (!comment) {
        throw new ApiError(402, "invalid commentid.")
    }

    return res.status(200).json(new ApiResponse(200, { comment }, "comment updated successfully."));

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(422, "commentid required.")
    }

    const deletedComment = await Comment.findOneAndDelete({ _id: commentId, owner: req.user._id })

    console.log(deletedComment);
    if (!deletedComment) {
        throw new ApiError(409, "invalid comment id or you can't delete another user comment.")
    }

    return res.status(200).json(new ApiResponse(200, null, "comment deleted successfully."));

})

export { getVideoComments, addComment, updateComment, deleteComment }