import React from 'react';
const socket = io();

class Whiteboard extends React.Component {

  init() {
    $(function() {
      var canvas = document.getElementsByClassName('whiteboard')[0];
      var colors = document.getElementsByClassName('color');
      var context = canvas.getContext('2d');

      var current = {
        color: 'black'
      };
      var drawing = false;

      canvas.addEventListener('mousedown', onMouseDown, false);
      canvas.addEventListener('mouseup', onMouseUp, false);
      canvas.addEventListener('mouseout', onMouseUp, false);
      canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

      for (var i = 0; i < colors.length; i++){
        colors[i].addEventListener('click', onColorUpdate, false);
      }

      socket.on('drawing', onDrawingEvent);

      window.addEventListener('resize', onResize, false);
      onResize();


      function drawLine(x0, y0, x1, y1, color, emit){
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        if (!emit) { return; }
        var w = canvas.width;
        var h = canvas.height;

        socket.emit('drawing', {
          x0: x0 / w,
          y0: y0 / h,
          x1: x1 / w,
          y1: y1 / h,
          color: color
        });
      }

      function onMouseDown(e){
        drawing = true;
        current.x = e.clientX;
        current.y = e.clientY;
      }

      function onMouseUp(e){
        if (!drawing) { return; }
        drawing = false;
        drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
      }

      function onMouseMove(e){
        if (!drawing) { return; }
        drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
        current.x = e.clientX;
        current.y = e.clientY;
      }

      function onColorUpdate(e){
        current.color = e.target.className.split(' ')[1];
      }

      // limit the number of events per second
      function throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function() {
          var time = new Date().getTime();

          if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
          }
        };
      }

      function onDrawingEvent(data){
        var w = canvas.width;
        var h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
      }

      // make the canvas fill its parent
      function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });
  }

  constructor(props) {
    super(props);
    this.state = {likesCount : 0};
    this.onLike = this.onLike.bind(this);
  }

  onLike () {
    let newLikesCount = this.state.likesCount + 1;
    this.setState({likesCount: newLikesCount});
  }

  showColorPanel() {
    if( $('.colors').css('display') == "none" ) $(".chooseColorBtn").animate({left: '245px'},"fast");
    else $(".chooseColorBtn").animate({left: '10px'})
    $(".colors").fadeToggle("fast");
  }

  render() {
    this.init();

    return (
      <div>
        <button className="chooseColorBtn" onClick={this.showColorPanel}></button>

        <canvas className="whiteboard" ></canvas>

        <div className="colors">
          <div className="color black"></div>
          <div className="color red"></div>
          <div className="color green"></div>
          <div className="color blue"></div>
          <div className="color yellow"></div>
        </div>
      </div>
    );
  }

}

export default Whiteboard;