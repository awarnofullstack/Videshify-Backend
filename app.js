const express = require("express");
const path = require("path")
const fs = require("fs")
const cors = require("cors");
const mongoose = require("mongoose");
require("express-async-errors");
const fileUpload = require('express-fileupload');


// Cron JOBS
const { planExpireJon } = require("./jobs/planExpireJob")


// Error Handler & Not Found Handler Middleware
const notFoundMiddleware = require("./middleware/notFound");
const errorHandlerMiddleware = require("./middleware/errorHandler");

const app = express();
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(
  cors({
    origin: "*",
  })
);

app.use('/static', express.static('storage/uploads/'));

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
  tempFileDir: __dirname + '/storage/temp'
}))


require("dotenv").config({
  path: `.env.${process.env.NODE_ENV?.trim()}`,
});

app.get("/", (req, res) => {
  return res.status(200).send("hello");
});

app.get('/reset-password/:token', (req, res) => {
  const token = req.params.token;
  return res.render('reset-password', { token, errorMessage: null });
});




// Serve video as a stream
app.get('/video/:filename', (req, res) => {
  const videoPath = path.join(__dirname, '/storage/uploads', req.params.filename);

  if (!fs.existsSync(videoPath)) {
    res.status(404).send("Video not found");
    return;
  }

  // Handle range requests
  const videoStat = fs.statSync(videoPath);

  // Parse range headers to determine the portion of the video to stream
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : videoStat.size - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });

    const head = {
      "Content-Range": `bytes ${start}-${end}/${videoStat.size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4", // Adjust this according to your video format
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // If no range header is provided, stream the entire video
    const head = {
      "Content-Length": videoStat.size,
      "Content-Type": "video/mp4", // Adjust this according to your video format
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

/*
*****************************************************************************************
-------------------- Auth Routes & Controller ----------------------
*****************************************************************************************
*/

const authRouter = require("./routes/auth/index");
app.use("/api/auth", authRouter);


/*
*****************************************************************************************
----------------------------- Admin Routes & Controller -----------------------------------
*****************************************************************************************
*/

const adminRouter = require("./routes/admin/index");
app.use("/api/admin", adminRouter);


/*
*****************************************************************************************
----------------------------- Counselor Routes & Controller -----------------------------------
*****************************************************************************************
*/

const counselorRouter = require("./routes/counselor/index");
app.use("/api/counselor", counselorRouter);


/*
*****************************************************************************************
-------------------- Student Counselor Routes & Controller ----------------------
*****************************************************************************************
*/

const studentCounselorRouter = require("./routes/studentCounselor");
app.use("/api/student-counselor", studentCounselorRouter);





/*
*****************************************************************************************
-------------------- Student Routes & Controller ----------------------
*****************************************************************************************
*/

const StudentRouter = require("./routes/website/index");
app.use("/api", StudentRouter);


/*
*****************************************************************************************
-------------------- Web Routes & Controller ----------------------
*****************************************************************************************
*/


// Cron JOBS 
planExpireJon();

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });

    app.listen(process.env.PORT || 8080, async () => {
      console.log(`app starts at port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
