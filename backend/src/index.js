import express from "express";
import dotenv from "dotenv";
import path from "path";
import http from "http";
dotenv.config();

import initSocket from "./lib/socket.js";

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve()
const app = express();
app.use(express.json());

app.use('/api/', (req, res) => {
  res.send("Undercover Game API");
})

const server = http.createServer(app)
const io = initSocket(server)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get(/.*/, (_, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  })
}

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});