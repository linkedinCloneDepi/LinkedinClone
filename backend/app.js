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
const likeRoutes = require("./routes/like.routes");
const messageRoute = require("./routes/message.routes");
const conversationRoute = require("./routes/conversation.routes");
const adminRoutes = require("./routes/admin.routes");

const { app, server } = require("./socket/socket");
const path = require("path");

// Init App
app.set("views", path.join(__dirname, "views"));
app.use(express.static(`${__dirname}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    limit: "100mb",
  })
);
app.set("view engine", "pug");

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

app.use("/api/notifications", notificationRoutes);

app.use("/api/connections", connectionRoutes);

app.use("/api/likes", likeRoutes);

app.use("/api/messages", messageRoute);

app.use("/api/Conversations", conversationRoute);

app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHanlder);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port", PORT);
});
