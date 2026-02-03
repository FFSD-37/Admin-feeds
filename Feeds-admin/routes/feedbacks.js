import express from 'express';
import Feedback from '../models/feedback.js';

export const feedback = express.Router();

feedback.get("/list", async (req, res) => {
    try{
        const fb = await Feedback.find({}).sort({ createdAt: -1 });
        // console.log(fb);
        return res.status(200).json({
            success: true,
            feedbacks : fb
        });
    } catch {
        return res.status(500).json({
            success: false,
            msg: "Error fetching feedbacks"
        })
    }
});