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

var numUsers = 0;

io.on("connection", function(socket) {
  log.info("New client");
  socket.on("stream", function(vid) {
    socket.broadcast.emit("stream", vid);
  });
  socket.on("teststream", function(canvimg) {
    socket.broadcast.emit("teststream", canvimg);
  });
  socket.on('drawing', function(data) { 
    socket.broadcast.emit('drawing', data);
  });


  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

  // function log() {
  //   var array = [">>> "];
  //   for(var i = 0; i < arguments.length; i++) {
  //     array.push(arguments[i]);
  //   }
  //   socket.emit('log', array);
  // }

  socket.on('message', function (message) {
    // log('Got message: ', message);
    socket.broadcast.emit('message', message); // should be room only
  });

  socket.on('create or join', function (room) {
    var numClients = io.sockets.clients(room).length;

    // log('Room ' + room + ' has ' + numClients + ' client(s)');
    // log('Request to create or join room', room);

    if(numClients == 0) {
      socket.join(room);
      socket.emit('created', room);
    } 

    else if(numClients == 1) {
      io.sockets.in(room).emit('join', room);
      socket.join(room);
      socket.emit('joined', room);
    } 

    else { // max two clients
      socket.emit('full', room);
    }

    socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
    socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
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
