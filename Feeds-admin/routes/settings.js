import express from 'express';
import Admin from '../models/admin.js';
import jwt from 'jsonwebtoken';

export const setting = express.Router();

setting.post("/updateSettings", async (req, res) => {
    console.log(req.body);
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({
            success: false,
            msg: "Bad request found"
        });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Admin.findById(decode.id);
        switch(req.body.tab){
            case 'security':
                const { currentPassword, newPassword, confirmPassword } = req.body.data;
                if (currentPassword === user.password){
                    if (newPassword === confirmPassword){
                        user.password = newPassword;
                        await user.save();
                        return res.status(201).json({
                            success: true,
                            msg: "Details updated!!"
                        });
                    }
                    else{
                        return res.status(400).json({
                            success: false,
                            msg: "Both passwords should match"
                        });
                    }
                }
                else{
                    return res.status(401).json({
                        success: false,
                        msg: "Incorrect password"
                    });
                }
            case 'profile':
                const { name, email } = req.body.data;
                try {
                    user.username = name;
                    user.email = email;
                    await user.save();
                    // clear cookie and logout
                    return res.status(201).json({
                        success: true,
                        msg: "Details updated!!"
                    })
                } catch (e) {
                    return res.status(400).json({
                        success: false,
                        msg: "Error saving new Details"
                    });
                }
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: "Internal server error, try re-login"
        })
    }
});