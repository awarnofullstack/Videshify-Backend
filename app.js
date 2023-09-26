const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("express-async-errors");

// Error Handler & Not Found Handler Middleware
const notFoundMiddleware = require("./middleware/notFound");
const errorHandlerMiddleware = require("./middleware/errorHandler");

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: '500mb' }));


require("dotenv").config({
  path: `.env.${process.env.NODE_ENV?.trim()}`,
});

app.get("/", (req, res) => {
  return res.status(200).send("hello");
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
