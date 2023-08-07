const redis = require("redis");

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV?.trim()}`,
});

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) =>
    console.error("error is in redis>>", error)
  );

  await redisClient.connect();
})();

module.exports = redisClient;
