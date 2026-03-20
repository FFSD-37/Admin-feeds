import express from 'express';
import Channel from '../models/channelSchema.js';

export const channel = express.Router();

channel.get("/list", async (req, res, next) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
        const skip = (page - 1) * limit;
        const search = (req.query.search || "").trim();
        const category = (req.query.category || "").trim();
        const query = {};

        if (search) {
            query.$or = [
                { channelName: { $regex: search, $options: "i" } },
                { channelDescription: { $regex: search, $options: "i" } },
                { channelCategory: { $elemMatch: { $regex: search, $options: "i" } } }
            ];
        }

        if (category && category.toLowerCase() !== "all") {
            query.channelCategory = { $elemMatch: { $regex: `^${category}$`, $options: "i" } };
        }

        const [c, total] = await Promise.all([
            Channel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Channel.countDocuments(query)
        ]);
        return res.status(200).json({
            success: true,
            allchannels: c,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        e.statusCode = 500;
        e.message = "Error fetching channel list";
        return next(e);
    }
});
