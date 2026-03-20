import express from 'express';
import User from '../models/user_schema.js';

export const user = express.Router();

user.get("/list", async (req, res, next) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
        const skip = (page - 1) * limit;
        const search = (req.query.search || "").trim();
        const query = search ? {
            $or: [
                { username: { $regex: search, $options: "i" } },
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { bio: { $regex: search, $options: "i" } }
            ]
        } : {};
        const [users, total] = await Promise.all([
            User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(query)
        ]);
        return res.status(200).json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        e.statusCode = 404;
        e.message = "Error while fetching users";
        return next(e);
    }
});
