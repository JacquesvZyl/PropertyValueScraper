const express = require("express");
const path = require("path");
const port = 8000;
const app = express();

app.use(express.static(__dirname + "/public/"));

app.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});
