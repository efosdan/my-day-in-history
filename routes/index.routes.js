const router = require("express").Router();
const axios = require("axios");

function getDate(date) {
  if (date) {
    const splitDate = date.split("-");
    return {
      day: splitDate[2],
      month: splitDate[1],
    };
  } else {
    const currentDate = new Date();
    return {
      day: currentDate.getDate(),
      month: currentDate.getMonth(),
    };
  }
}

/* GET home page */
router.get("/", async (req, res, next) => {
  if (!req.session?.user) {
    return res.render("auth/login");
  }
  const dateObj = getDate(req.query.date);

  let data = [];
  try {
    data = await getHistoryData(dateObj);
  } catch (err) {}
  res.render("index", { data, ...dateObj });
});

const historyAPI =
  "https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/selected";
const getHistoryData = async (dateObj) => {
  try {
    const response = await axios.get(
      `${historyAPI}/${dateObj.month}/${dateObj.day}`
    );
    const historyData = response.data?.selected;
    return historyData;
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = router;
