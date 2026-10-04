import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();


app.use(
  cors({
    origin: "http://localhost:5173"
  })
);



app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Authentication API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
