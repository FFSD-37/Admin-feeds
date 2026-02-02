import express from 'express';
import User from '../models/user_schema.js';

export const user = express.Router();

user.get("/list", async (req, res) => {
    try{
        const users = await User.find({}).sort({ followers: -1 });
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