const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// const studentRouter = require("./routes/user");
// const adminRouter = require("./routes/admin");

const app = express();

app.use(
  cors({
    origin: ["*"],
  })
);

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV?.trim()}`,
});

app.get("/", (req, res) => {
  return res.status(200).send("hello");
});

const adminRouter = require("./routes/admin/index");
app.use("/api/admin", adminRouter);

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
