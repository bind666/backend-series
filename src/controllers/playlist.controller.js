import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const { name, description } = req.body
    if (!name || !description) {
        throw new ApiError(422, "name and description required.")
    }

    const isplaylistExist = await Playlist.findOne({ name })
    if (isplaylistExist) {
        throw new ApiError(422, "playlist already exist.")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    return res.status(200).json(new ApiResponse(200, playlist, "playlist created"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(422, "userid required.")
    }

    const playlist = await Playlist.find({ owner: userId }).populate("videos")

    return res.status(200).json(new ApiResponse(200, playlist, "User playlists retrieved successfully"));

})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(422, "playlistid required.")
    }

    const playlist = await Playlist.findById({ _id: playlistId }).populate('videos')
        .select("-createdAt -updatedAt -__v")
    if (!playlist) {
        throw new ApiError(404, "invalid playlistid.")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist retrieved successfully"));

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !videoId) {
        throw new ApiError(422, "playlistid and videoid required.")
    }

    const playlist = await Playlist.findById({ _id: playlistId })
    if (!playlist) {
        throw new ApiError(404, "invalid playlistid.")
    }

    const video = await Video.findOne({ _id: videoId, owner: req.user._id })
    if (!video) {
        throw new ApiError(409, "invalid videoid.")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to add videos to this playlist.");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(422, "Video is already in the playlist.");
    }

    playlist.videos.push(videoId);
    await playlist.save()


    return res.status(200).json(new ApiResponse(200, playlist, "video added successfully in playlist."))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    const { playlistId, videoId } = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(422, "playlistid and videoid required.")
    }

    const playlist = await Playlist.findById({ _id: playlistId })
    if (!playlist) {
        throw new ApiError(404, "playlist not found.")
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to add videos to this playlist.");
    }

    playlist.videos.pop(videoId);
    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "video removed successfully from playlist."))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(422, "playlistid required.")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist.");
    }

    playlist.remove();

    return res.status(200).json(new ApiResponse(200, null, "Playlist deleted successfully"));

})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!playlistId) {
        throw new ApiError(422, "playlistid required.")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this playlist.");
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated successfully"));

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}