import React from 'react';
import {render} from 'react-dom';
import Whiteboard from './Whiteboard.jsx';
import Chat from './Chat.jsx';
const io = require('socket.io-client');
const socket = io();

class App extends React.Component {

	stream() {
		// $("#cvideostream").show();
		var canv = document.getElementById("cvideostream"),
		context = canv.getContext("2d"),
		video = document.getElementById("vvideostream"),
		freq = 10;

		canv.width = 320;
		canv.height = 240;
		
		context.width = canv.width;
		context.height = canv.height;

		function loadCam(stream) {
			video.src = window.URL.createObjectURL(stream);
			video.volume = 0;
			video.controls = true;
			console.log("Camera loaded");

			// var mediaRecorder = new MediaRecorder(stream);
		 //    mediaRecorder.onstart = function(e) {
		 //        this.chunks = [];
		 //    };
		 //    mediaRecorder.ondataavailable = function(e) {
		 //    	//console.log(this.chunks);
		 //        this.chunks.push(e.data);
		 //    	var blob = new Blob(this.chunks, { 'type' : 'video/webm; codecs="vorbis,vp8"' });
		 //        socket.emit('stream', blob);
		 //        //console.log(blob);
		 //    };

		 //    mediaRecorder.start(3000);
		}
		
		function loadFail(stream) {
			console.log("Failed loading camera");
		}
		
		function viewVideo(video, context) {
			context.drawImage(video, 0, 0, context.width, context.height);
			socket.emit("teststream", canv.toDataURL("img/webp"));
		}
		
		$(function() {
			navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;
			
			if(navigator.getUserMedia) {
				navigator.getUserMedia({video: true, audio:true}, loadCam, loadFail);
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
		img.width = 320;
		img.height = 240;
		console.log("Waiting stream..");

	    socket.on('stream', function (arrayBuffer) 
	    {
	    	console.log("start");
			var vid = document.getElementById("videoview");
			vid.controls = true;
	        var blob = new Blob([arrayBuffer], {'type' : 'video/webm; codecs="vorbis,vp8"'});
	        
	        socket.emit('stream', blob);
	        vid.src = window.URL.createObjectURL(blob);
	        console.log(blob);
	        if (vid.paused) {
	        	vid.play();
	        }
	    });

		socket.on("teststream", function (canvimg) {
			img.src = canvimg;
		});
	}


    render () {
		return (
			<div>
				<button className="viewBtn" onClick={this.view}>view</button>
				<button className="streamBtn" onClick={this.stream}>stream</button>

				<Whiteboard />
				<Chat />


				<video id="vvideostream" autoPlay> </video>
				<canvas id="cvideostream"></canvas>
				<canvas id="canvasstream"></canvas>

				<video id="videoview" autoPlay></video>
				<img id="canvview" />
			</div>
		);
	}
}



render(<App/>, document.getElementById('app'));
