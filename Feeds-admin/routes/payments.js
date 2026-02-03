import express from 'express';
import Payment from '../models/transactions.js';

export const payment = express.Router();

payment.get("/list", async (req, res) => {
    try {
        const trans = await Payment.find({}).sort({createdAt: -1});
        return res.status(200).json({
            success: true,
            payments: trans
        });
    } catch (e) {
        return res.status(500).json({
            success: false,
            msg: "Internal server error"
        });
    }
});