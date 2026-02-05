import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';

const auth = express.Router();

auth.post("/login", async (req, res) => {
    if (req.body){
        const { username, password } = req.body;
        try{
            const user = await Admin.findOne({username: username});
            if(!user){
                return res.status(401).json({
                    success: false,
                    msg: "Invalid credentials"
                });
            }
            if (user.password !== password){
                return res.status(401).json({
                    success: false,
                    msg: "Invalid credentials"
                });
            }
            const token = jwt.sign(
                { id: user._id},
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.cookie('auth_token', token, {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                maxAge: 24 * 60 * 60 * 1000
            });
            return res.status(200).json({
                success: true,
                msg: "Successfully extracted user"
            });
        } catch (e){
            return res.status(400).json({
                success: false,
                msg: "Error while fetching admin from mongoDB"
            });
        }
    } else{
        return res.status(401).json({
            success: false,
            msg: "Required fields are missing"
        });
    }
});

auth.get("/status", async (req, res) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({
            isAuthenticated: false,
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await Admin.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                isAuthenticated: false,
            });
        }

        return res.status(200).json({
            isAuthenticated: true,
            user: user
        });
    } catch (err) {
        return res.status(401).json({
            isAuthenticated: false,
        });
    }
});

auth.post("/logout", (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: "/"
    });
    return res.status(200).json({
        success: true,
        msg: "Logged out"
    });
});

export default auth;