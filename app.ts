require("dotenv").config();
import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import { ErrorMiddleware } from "./middleware/error"; 
import { rateLimit } from "express-rate-limit";
import userRouter from "./routes/user.route";

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());

//cors = cross origin resource sharing
// app.use(
//   cors({
//     origin: ["https://hit-cse-ds.vercel.app","http://localhost:3000"],
//     credentials: true,
//     methods: ["GET","POST","PUT","DELETE"],
//   })
// );

// api request limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

app.use("/api/v1", userRouter);


// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

//unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// middleware calls
app.use(limiter);
app.use(ErrorMiddleware);
