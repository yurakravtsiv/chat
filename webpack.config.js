var webpack = require('webpack');
var path = require('path');


var fs = require('fs');
var express = require("express");
var app = new express();
// Устанавливаем порт, по умолчанию 8888
var port = process.env.PORT || 8888;
// Проверка, используем ли мы HTTPS (SSL) , по умолчанию да
var ssl = (process.env.SSL == null || process.env.SSL != 0) ? 1:0;
if(ssl==1) {
//  var https = require('https');
//  var server = https.createServer(
// {key: fs.readFileSync('/var/ssl/cert.key'),cert: fs.readFileSync('/var/ssl/cert.crt')}, app);
//  console.log("Use SSL");
var server = require('http').createServer(app);
console.log("Start http");
} else {
  var server = require('http').createServer(app);
console.log("Start http");
}
var io = require("socket.io")(server);

var Log = require("log"),
  log = new Log("debug");


app.use(express.static( __dirname + "/src/client" ));

app.get("/", function(req, res) {
  res.redirect("index.html");
});

server.listen(port, function() {
  log.info("запущен на %s порт", port);
});

io.on("connection", function(socket) {
  log.info("Новый клиент");
  // Вещаем видео всем клиентам
  socket.on("stream", function(img) {
    socket.broadcast.emit("stream", img);
  });
});






var BUILD_DIR = path.resolve(__dirname, 'src/client/public');
var APP_DIR = path.resolve(__dirname, 'src/client/app');

var config = {
  entry: APP_DIR + '/index.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  module : {
    loaders : [
      {
        test : /\.jsx?/,
        include : APP_DIR,
        loader : 'babel'
      }
    ]
  }
};

module.exports = config;
