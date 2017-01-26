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
		var canv = document.getElementById("prev"),
		context = canv.getContext("2d"),
		video = document.getElementById("video"),
		freq = 10;

		canv.width = window.innerWidth ;//  800;
		canv.height = window.innerHeight;// 400;

		canv.width = 320 ;
		canv.height = 240;
		
		context.width = canv.width;
		context.height = canv.height;

		function loadCam(stream) {
			video.src = window.URL.createObjectURL(stream);
			// logger("Camera loaded [OKAY]");
		}
		
		function loadFail(stream) {
			// logger("Failed loading camera");
		}
		
		function viewVideo(video, context) {
			context.drawImage(video, 0, 0, context.width, context.height);
			socket.emit("stream", canv.toDataURL("image/webp"));
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
		// logger("Waiting stream..");
		socket.on("stream", function (video) {
			var img = document.getElementById("img");
			img.src = video;
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

        <button onClick={this.view}>view</button>
		<button onClick={this.stream}>stream</button>

		<div id="logger"></div>
		<video id="video"> </video>
		<canvas id="prev"></canvas>

		<video id="img"></video>
      </div>
    );
  }
}

render(<App/>, document.getElementById('app'));
