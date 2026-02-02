import express from 'express';
import User from '../models/user_schema.js';
import Channel from '../models/channelSchema.js';

export const home = express.Router();

home.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        msg: "Home page came"
    });
});

home.get("/getUsers", async (req, res) => {
    try{
        const users = await User.find({}).sort({ followers: -1 }).limit(4);
        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (e){
        return res.status(404).json({
            success: false,
            msg: "Error while fetching users"
        });
    }
});

home.get("/getChannels", async (req, res) => {
    try{
        const channels = await Channel.find({}).sort({ followers: -1 }).limit(4);
        return res.status(200).json({
            success: true,
            data: channels
        });
    } catch(e){
        return res.status(404).json({
            success: false,
            msg: "Error while fetching channels"
        })
    }
})