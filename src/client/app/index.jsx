import React from 'react';
import {render} from 'react-dom';
import AwesomeComponent from './AwesomeComponent.jsx';
const io = require('socket.io-client')
const socket = io()

class App extends React.Component {

	logger(msg) {
		$("#logger").text(msg);
	}

	stream() {
		$("#cvideostream").show();
		$("#canvasstream").show();
		var canv = document.getElementById("cvideostream"),
		context = canv.getContext("2d"),
		video = document.getElementById("vvideostream"),
		freq = 10;

		canv.width = 320 ;
		canv.height = 240;
		
		context.width = canv.width;
		context.height = canv.height;



		var mycanv = document.getElementById("canvasstream");
		var canvas = mycanv;
		var ctx = canvas.getContext('2d');
		
		// canvas.width = $(window).width() ;
		// canvas.height = $(window).height();
		canvas.width = 640;
		canvas.height = 480;

		var mouse = {x: 0, y: 0};
		 
		/* Mouse Capturing Work */
		canvas.addEventListener('mousemove', function(e) {
			mouse.x = e.pageX - this.offsetLeft;
			mouse.y = e.pageY - this.offsetTop;
		}, false);
		
		/* Drawing on Paint App */
		ctx.lineWidth = 5;
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.strokeStyle = 'blue';
		 
		canvas.addEventListener('mousedown', function(e) {
				ctx.beginPath();
				ctx.moveTo(mouse.x, mouse.y);
		 
				canvas.addEventListener('mousemove', onPaint, false);
		}, false);
		 
		canvas.addEventListener('mouseup', function() {
				canvas.removeEventListener('mousemove', onPaint, false);
		}, false);
		 
		var onPaint = function() {
				ctx.lineTo(mouse.x, mouse.y);
				ctx.stroke();
		};

		function loadCam(stream) {
			video.src = window.URL.createObjectURL(stream);
			// logger("Camera loaded [OKAY]");
		}
		
		function loadFail(stream) {
			// logger("Failed loading camera");
		}
		
		function viewVideo(video, context) {
			context.drawImage(video, 0, 0, context.width, context.height);
			socket.emit("stream", canv.toDataURL("video/webp"));
			// debugger;
			socket.emit("canvstream", mycanv.toDataURL("image/webp"));
		}
		
		$(function() {
			navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;
			
			if(navigator.getUserMedia) {
				navigator.getUserMedia({video: true}, loadCam, loadFail);
			}
			setInterval(function() {
				viewVideo(video, context);
			}, freq*10);
		});
	}

	view() {
		$("#videoview").show();
		$("#canvview").show();
		var img = document.getElementById("canvview");
		img.width = $(window).width();
		img.height = $(window).height();
		// logger("Waiting stream..");
		socket.on("stream", function (video) {
			var vid = document.getElementById("videoview");
			vid.src = video;
			// logger("Stream is started");
		});
		socket.on("canvstream", function (canvimg) {
			img.src = canvimg;
			// logger("Stream is started");
		});
	}

	


  render () {
    return (
      <div>
        <p> Hello React!</p>
        {/* 
        	<AwesomeComponent />
        */}

        <button className="viewBtn" onClick={this.view}>view</button>
		<button className="streamBtn" onClick={this.stream}>stream</button>

		<div id="logger"></div>

		<video id="vvideostream"> </video>
		<canvas id="cvideostream"></canvas>
		<canvas id="canvasstream"></canvas>

		<img id="videoview" />
		<img id="canvview" />
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
