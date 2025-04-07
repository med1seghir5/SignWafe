import express from "express";
import dotenv from "dotenv";
import db from "./config/db.js";
import productRoutes from "./Routes/productRoutes.js";
import authRoute from "./Routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

db();

app.use("/auth", authRoute);
app.use("/api", productRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));