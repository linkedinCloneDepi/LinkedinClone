const express = require("express");
const connectDB = require("./db/connectDB");
const cookieParser = require("cookie-parser");
const logger = require("./middleware/logger");
const cors = require("cors");
const { notFound, errorHanlder } = require("./middleware/errors");

require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const notificationRoutes = require("./routes/notification.routes");
const connectionRoutes = require("./routes/connection.routes");
const likeRoutes = require('./routes/like.routes')


// Init App
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// Apply Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(logger);

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/likes", likeRoutes);
//
// app.use("/api/messages", messageRoutes);
// app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHanlder);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port", PORT);
});
