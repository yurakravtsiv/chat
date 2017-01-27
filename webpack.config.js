var webpack = require('webpack');
var path = require('path');


var fs = require('fs');
var express = require("express");
var app = new express();

var port = process.env.PORT || 8888;

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
  log.info("Started on %s port", port);
});

io.on("connection", function(socket) {
  log.info("New client");
  socket.on("stream", function(vid) {
    socket.broadcast.emit("stream", vid);
  });
  socket.on("canvstream", function(canvimg) {
    socket.broadcast.emit("canvstream", canvimg);
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
