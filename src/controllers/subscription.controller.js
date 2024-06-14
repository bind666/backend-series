import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    const { channelId } = req.params
    if (!channelId) {
        throw new ApiError(422, "channelid required.")
    }

    const isChannelExist = await User.findById({ _id: channelId })

    if (!isChannelExist) {
        throw new ApiError(404, "channel not exist.")
    }

    const isChannelSubscribed = await Subscription.findOne({ channel: channelId, subscriber: req.user._id })

    if (!isChannelSubscribed) {
        const SubscribeChannel = await Subscription.create({ channel: channelId, subscriber: req.user._id })
        return res.status(200).json(new ApiResponse(200, true, { SubscribeChannel }, "subscribe."))
    }

    const unSubscribeChannel = await Subscription.deleteOne({ channel: channelId, subscriber: req.user._id })

    return res.status(200).json(new ApiResponse(200, false, "unSubscribe."))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) {
        throw new ApiError(422, "channelid required.")
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .select("-createdAt -updatedAt -__v -_id -channel")

    let totalSubscriber = 0
    for (let i = 0; i < subscribers.length; i++) {
        totalSubscriber = totalSubscriber + 1
    }
    console.log(totalSubscriber);
    return res.status(200).json(new ApiResponse(200, { subscribers, totalSubscriber }, "Subscribers."))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id

    const subscribedChannel = await Subscription.find({ subscriber: subscriberId }).populate({
        path: "channel",
        model: "User",
        select: "-createdAt -updatedAt -__v -_id -channel -refreshToken -watchHistory -password"
    }).select(" -createdAt -updatedAt -__v")

    return res.status(200).json(new ApiResponse(200, subscribedChannel, "Subscribed channel."))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}