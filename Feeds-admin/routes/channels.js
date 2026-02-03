import express from 'express';
import Channel from '../models/channelSchema.js'

export const channel = express.Router();

channel.get("/list", async (req, res) => {
    try {
        const c = await Channel.find({});
        return res.status(200).json({
            success: true,
            allchannels: c
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: "Error fetching channel list"
        });
    }
})