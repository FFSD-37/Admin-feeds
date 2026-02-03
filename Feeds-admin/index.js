// importing third party packages
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// importing internal packages
import { ErrorHandler } from './middlewares/Errorhandler.js';
import { home } from './routes/home.js';
import { user } from './routes/userlist.js';
import { feedback } from './routes/feedbacks.js';
import { reports } from './routes/reports.js';
import { payment } from './routes/payments.js';
import { channel } from './routes/channels.js';
import { connectDB } from './DB/Connection.js';
import { setting } from './routes/settings.js';
import auth from './routes/auth.js';

// configuration
dotenv.config();

// Initialization
const app = express();

// server-side middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// database connection
connectDB();

// health checks for the server
app.get("/healthCheck", (req, res) => {
    return res.json({
        success: true,
        msg: "admin server is healthy"
    });
});

// router level middleware
app.use("/home", home);
app.use("/auth", auth);
app.use("/user", user);
app.use("/feedback", feedback);
app.use("/report", reports);
app.use("/payment", payment);
app.use("/channel", channel);
app.use("/setting", setting);

// Error handler middleware
app.use(ErrorHandler);

// actual executing server
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Admin at service at: http://localhost:${PORT}`)
});