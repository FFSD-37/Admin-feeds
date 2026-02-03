import express from 'express';
import Report from '../models/report_schema.js';

export const reports = express.Router();

reports.get("/list", async (req, res) => {
    try{
        const re = await Report.find({}).sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            reports: re
        });
    }catch{
        return res.status(500).json({
            success: false,
            msg: "Interval server error"
        });
    }
});