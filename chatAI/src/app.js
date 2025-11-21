import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat.route.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// health check
app.get("/", (req, res) => {
    res.json({ status: "ok", message: "AI Stylist server running" });
});

// routes
app.use("/", chatRoutes); // => POST /chat

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`AI Stylist server đang chạy ở port ${PORT}`);
});
