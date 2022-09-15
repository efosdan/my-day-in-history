const router = require("express").Router();
const axios = require("axios");

/* GET home page */
router.get("/", async (req, res, next) => {
  let data = [];
  try {
    data = await getHistoryData();
  } catch (err) {}
  res.render("index");
});

const historyAPI =
  "https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/09/14";
const getHistoryData = async () => {
  try {
    const response = await axios.get(`${historyAPI}`);
    const historyData = response.data;
    console.log(historyData);
    return historyData;
  } catch (error) {
    console.error(error);
  }
};

module.exports = router;
