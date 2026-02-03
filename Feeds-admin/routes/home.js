import express from 'express';
import User from '../models/user_schema.js';
import Channel from '../models/channelSchema.js';
import Payment from '../models/transactions.js';

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

home.get("/getRevenue", async (req, res) => {
    try {
        const trans = await Payment.find({});
        let total = 0;
        trans.forEach((ele) => {
            if (ele.status === "Completed"){
                total += Number(ele.amount);
            }
        });
        return res.status(200).json({
            success: true,
            rev: total
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: "Error fetching total revenue"
        });
    }
});

home.get("/getUserCount", async (req, res) => {
    try {
        const users = await User.find({});
        const channels = await Channel.find({});
        return res.status(200).json({
            success: true,
            count: users.length+channels.length
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: "Error fetching total users"
        });
    }
});