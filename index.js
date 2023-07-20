const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/news", (req, res) => {
  scrapeLogic(res);
});

app.get("/", (req, res) => {
  res.send("Servidor esta rodando");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
