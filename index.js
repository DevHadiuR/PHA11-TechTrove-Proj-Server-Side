const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.send("Hello this is from the assignment 11 Server side.");
});

app.listen(port, () => {
  console.log("The server is running on the port :", port);
});
