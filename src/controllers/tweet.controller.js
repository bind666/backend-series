import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    if (!content) {
        throw new ApiError(422, "tweet can't empty.")
    }

    const tweet = await Tweet.create({ content, owner: req.user._id })

    return res.status(200).json(new ApiResponse(200, tweet, "tweet created."))

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(422, "userid required.")
    }

    const tweets = await Tweet.find({ owner: userId }).populate({
        path: "owner",
        model: "User",
        select: "-refreshToken -password -createdAt -__v -updatedAt -email -fulNname"
    }).select("-createdAt -updatedAt -__v")

    return res.status(200).json(new ApiResponse(200, { tweets }, "tweet fetched."))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body
    if (!tweetId) {
        throw new ApiError(422, "userid required.")
    }

    const tweet = await Tweet.findOneAndUpdate({ _id: tweetId, owner: req.user._id }, { content: content }, { new: true })

    if (!tweet) {
        throw new ApiError(422, "invalid tweetid Or you can't edit another user tweet.")
    }
    return res.status(200).json(new ApiResponse(200, { tweet }, "tweet updated."))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(422, "userid required.")
    }

    const tweet = await Tweet.findOne({ _id: tweetId, owner: req.user._id })

    if (!tweet) {
        throw new ApiError(422, "invalid tweetid or you can't delete another user tweet.")
    }
    await tweet.deleteOne()

    return res.status(200).json(new ApiResponse(200, null, "tweet deleted."))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}