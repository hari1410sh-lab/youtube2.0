import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "dns";
import userRoutes from "./routes/auth.js";
import videoRoutes from "./routes/video.js";
import commentRoutes from "./routes/comment.js";
import paymentRoutes from "./routes/payment.js";
import downloadRoutes from "./routes/download.js";
dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.get("/", (req, res) => {
  res.send("youtube back end is working");
});
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use("/user", userRoutes);
app.use("/video", videoRoutes);
app.use("/comment", commentRoutes);
app.use("/payment", paymentRoutes);
app.use("/download", downloadRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const DBURL = process.env.DB_URL;

mongoose.connect(DBURL).then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error);
});
