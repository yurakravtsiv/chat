import React from 'react';

const socket = io();

var PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;

var pc; // PeerConnection

var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
pc = new PeerConnection(pc_config);

function sendMessage(message){
  socket.emit('message', message);
}

class Video extends React.Component {

  gotStream(stream) {
    var self = this;

    $(function() {
      navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;
      
      navigator.getUserMedia(
        { audio: true, video: true }, 
        function(stream) {
            // document.getElementById("callButton").style.display = 'inline-block';
      document.getElementById("localVideo").src = URL.createObjectURL(stream);
  
      pc.addStream(stream);
      pc.onicecandidate = self.gotIceCandidate;
      pc.onaddstream = self.gotRemoteStream;
        }, 
        function(error) { console.log(error) }
      );
    });

    

    socket.on('message', function (message){
      if (message.type === 'offer') {
        pc.setRemoteDescription(new SessionDescription(message));
        self.createAnswer();
      } 
      else if (message.type === 'answer') {
        pc.setRemoteDescription(new SessionDescription(message));
      } 
      else if (message.type === 'candidate') {
        var candidate = new IceCandidate({sdpMLineIndex: message.label, candidate: message.candidate});
        pc.addIceCandidate(candidate);
      }
    });
  }


  // Step 2. createOffer
  createOffer() {
    var self = this;
    pc.createOffer(
      gotLocalDescription, 
      function(error) { console.log(error) }, 
      { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
    );

    function gotLocalDescription(description){
      pc.setLocalDescription(description);
      sendMessage(description);
    }
  }


  // Step 3. createAnswer
  createAnswer() {

  var self = this;  
    pc.createAnswer(
      gotLocalDescription,
      function(error) { console.log(error) }, 
      { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
    );

    function gotLocalDescription(description){
      pc.setLocalDescription(description);
      sendMessage(description);
    }
  }


  gotLocalDescription(description){
    pc.setLocalDescription(description);
    sendMessage(description);
  }

  gotIceCandidate(event){
    if (event.candidate) {
      sendMessage({
        type: 'candidate',
        label: event.candidate.sdpMLineIndex,
        id: event.candidate.sdpMid,
        candidate: event.candidate.candidate
      });
    }
  }

  gotRemoteStream(event){
    document.getElementById("remoteVideo").src = URL.createObjectURL(event.stream);
  }

  render() {
    this.gotStream();

    return (
      <div>
        <video id="localVideo" autoPlay muted></video>
        <video id="remoteVideo" autoPlay></video>
        <button id="callButton" onClick={this.createOffer}></button>
      </div>
    );
  }

}

export default Video;
