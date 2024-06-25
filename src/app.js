import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}
const app = express();


app.use(cors(corsOptions));
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());





export default app;