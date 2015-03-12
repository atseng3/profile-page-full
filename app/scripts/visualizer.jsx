var APP = React.createClass({

  getInitialState: function() {
    return {
      upload: false,
      streaming: false,
    }
  },

  sourceHandler: function() {
    this.setState({
      upload: !this.state.upload,
      streaming: !this.state.streaming
    });
  },

  render: function() {
    var audioSrc = '';
    if(this.state.upload) {
      audioSrc = <audio src="love-me-like-you-do.mp3" autoPlay></audio>
    }
    return (
    	<div>
        <Upload />
    		
    		<div onClick={this.sourceHandler} id="visualizer-icon">
          <Canvas source=""/>
        </div>
        {audioSrc}
    	</div>
    )
    // <SearchYoutube source={this.state.upload ? 'upload' : 'stream'} sourceName='Love Me Like You Do'/>
    // <audio src="love-me-like-you-do.mp3" autoPlay ></audio>
    // <audio src="last-ones-standing.mp3" autoPlay ></audio>
    // <audio src="prayer-in-c.mp3" autoPlay ></audio>
    // <audio src="shinee-everybody.mp3" autoPlay ></audio>
    // <progress max="100" value="80"></progress>
  }
});

var Upload = React.createClass({

  uploadHandler: function() {
    var songUpload = document.getElementById('song-upload');
    songUpload.click();
    $(songUpload).on('change', function() {
      song = songUpload.value;
    });
  },

  render: function() {
    return (
      <div>
        <div onClick={this.uploadHandler} id="upload"></div>
        <div className="song-upload-container">
          <input id="song-upload" type="file" />
        </div>
      </div>
      
    )
  }
});

var Canvas = React.createClass({

  componentDidMount: function() {
    switch(this.props.source) {
      case 'upload':
        this.init();
        break;
      case 'stream':
        this.streamInit();
        break;
      default:
        break;
    }
  },

  init: function() {
    this.doAudioSetup();
    var myAudio = document.querySelector('audio');
    source = this.audioCtx.createMediaElementSource(myAudio);
    source.connect(this.analyser);
    this.doCanvasSetup();
    // this.doCanvasSetupCircular();
    // this.draw();
    // this.drawStereo();
    // this.drawGreenBars();
    // this.drawEDC();
    this.drawSpeaker();
    source.connect(this.audioCtx.destination);
  },

  streamInit: function() {
    navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia);

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // getUserMedia block - grab stream
    // put it into a MediaStreamAudioSourceNode
    // also output the visuals into a video element

    if (navigator.getUserMedia) {
      var that = this;
       navigator.getUserMedia (
          {
             audio: true,
             video: false
          }, 
          function(stream) {
            that.streamSuccess(stream);
          },
          function(err) {
            console.log('error');
          }
        );
     }
  },

  streamSuccess: function(stream) {
    this.doAudioSetup();
    var source = this.audioCtx.createMediaStreamSource(stream);
    source.connect(this.analyser);
    this.doCanvasSetup();
    // this.draw();
    // this.drawEDC();
    this.drawSpeaker();
    // this.drawStereo();
    // this.drawGreenBars();
  },

  doAudioSetup: function() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024;
    this.analyser.minDecibels = -90;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0.3;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  },

  doCanvasSetupCircular: function() {
    var canvas = this.getDOMNode();
    this.canvasCtx = canvas.getContext('2d');
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    this.gradient = this.canvasCtx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 50, WIDTH / 2, HEIGHT / 2, 700);
    this.gradient.addColorStop(0,'#000000');
    this.gradient.addColorStop(0.25,'#ff0000');
    this.gradient.addColorStop(0.75,'#ffff00');
    this.gradient.addColorStop(1,'#ffffff');

    this.barWidth = 10;
    this.bars = Array(10);

    // for(var i = 0; i < 50; i++) {
    //   this.bars[i] = 0;
    // }

    this.delay = 100;

    this.iteration = 0;
    this.totalIterations = 100;
    var easingValue;
    this.rotationBegin = 0;
    this.rotationEnd = 1;
  },

  doCanvasSetup: function() {
    var canvas = this.getDOMNode();
    this.canvasCtx = canvas.getContext('2d');
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    this.gradient = this.canvasCtx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 50, WIDTH / 2, HEIGHT / 2, 700);
    this.gradient.addColorStop(0,'#000000');
    this.gradient.addColorStop(0.25,'#ff0000');
    this.gradient.addColorStop(0.75,'#ffff00');
    this.gradient.addColorStop(1,'#ffffff');

    this.barWidth = 10;
    // this.bars = Array(50);
    // this.bars = Array(10);
    // this.barWidth2 = 10;
    // this.barHeight2 = 25

    this.rays = Array(10);
    this.rayWidth = 10;
    this.rayHeight = 25;

    this.bars = Array(7);
    for(var i = 0; i < this.bars.length; i++) {
      this.bars[i] = 0;
    }
    // for(var i = 0; i < 50; i++) {
      // this.bars[i] = 0;
    // }

    this.delay = 100;

    this.iteration = 0;
    this.totalIterations = 100;
    var easingValue;
    this.rotationBegin = 19/12;
    this.rotationEnd = 7/4;
    this.rotationSeparate = 1/3;
  },

  drawSpeaker: function() {
    this.analyser.getByteFrequencyData(this.dataArray);
    requestAnimationFrame(this.drawSpeaker);
    this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    // this.canvasCtx.rotate(0);



    // get volume
    // var sum = 5000;
    var sum = 0;
    for(var i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    var volume = sum / this.bufferLength;
    var bass = (this.dataArray[0] + this.dataArray[1] + this.dataArray[2]);
    // console.log(bass);

    // set bars
    this.canvasCtx.fillStyle = this.gradient;
    // var temp = volume > 50 ? 1 : 0;
    var temp = bass > 400 ? 1 : 0;

    for(var i = 0; i < this.bars.length; i++) {
      var that = this;
      (function(i, temp) {
        setTimeout( function() {
          that.bars[i] = temp;
        }, that.delay * (i));
      })(i, temp);
    }
    
    var radgrad = this.canvasCtx.createRadialGradient(WIDTH/2, HEIGHT /2,50,WIDTH/2, HEIGHT/2,320);

    radgrad.addColorStop(0, 'rgba(62, 68, 120,1)');
    // if(sum < 18000) {
      // radgrad.addColorStop(1, 'rgba(62, 68, 120,1)');
    // } else {
      // radgrad.addColorStop(0.3, 'rgba(189, 195, 247,1)');
      // radgrad.addColorStop(0.5, 'red');

      // radgrad.addColorStop(0.7, '#ffff00');
      // radgrad.addColorStop(1, '#fff');
      radgrad.addColorStop(1, 'rgba(189, 195, 247,1)');

    // }
    this.canvasCtx.beginPath();
    if(bass < 400) {
      this.canvasCtx.strokeStyle = 'rgba(62, 68, 120,1)';  
    } else {
      this.canvasCtx.strokeStyle = 'rgba(189, 195, 247,1)';
    }
    
    // circle around logo
    this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 130, 0, 360, false);

    this.canvasCtx.lineWidth = 5;
    
    this.canvasCtx.stroke();
    this.canvasCtx.fillStyle = 'rgba(62, 68, 120,1)';
    for(var i = 0; i < this.rays.length; i++) {
      this.canvasCtx.translate(WIDTH / 2, HEIGHT / 2);
      this.canvasCtx.rotate(this.rayWidth*2*i*Math.PI/180);
      this.canvasCtx.translate(-WIDTH / 2, -HEIGHT / 2);  
      for(var j = 0; j < this.bars.length; j++) {

        if(this.bars[j] == 1) {
          this.canvasCtx.fillStyle = 'rgba(189, 195, 247,1)';
        } else {
          this.canvasCtx.fillStyle = 'rgba(62, 68, 120,1)';
        }
        //                      x axis middle, middle of bar, displacement to center circle. 
        this.canvasCtx.fillRect(WIDTH / 2 - (this.rayWidth + j)/2 + (150 + j * 20) + j*4, HEIGHT / 2 - (this.rayHeight + j*6)/2, this.rayWidth+j, this.rayHeight+j*6);
        this.canvasCtx.fillRect(WIDTH / 2 - (this.rayWidth + j)/2 - (150 + j * 20)-j*4, HEIGHT / 2 - (this.rayHeight + j*6)/2, this.rayWidth+j, this.rayHeight+j*6);  
      }
      this.canvasCtx.translate(WIDTH / 2, HEIGHT / 2);
      this.canvasCtx.rotate(-this.rayWidth*2*i*Math.PI/180);
      this.canvasCtx.translate(-WIDTH / 2, -HEIGHT / 2);
    }
    // for(var i = 0; i < this.bars.length; i++) {
    //   this.canvasCtx.translate(WIDTH / 2, HEIGHT / 2);
    //   this.canvasCtx.rotate(this.barWidth2*2*i*Math.PI/180);
    //   this.canvasCtx.translate(-WIDTH / 2, -HEIGHT / 2);
    //   for(var j = 0; j < 7; j++) {
    //     //                      x axis middle, middle of bar, displacement to center circle. 
    //     this.canvasCtx.fillRect(WIDTH / 2 - (this.barWidth2 + j)/2 + (150 + j * 20) + j*4, HEIGHT / 2 - (this.barHeight2 + j*6)/2, this.barWidth2+j, this.barHeight2+j*6);
    //     this.canvasCtx.fillRect(WIDTH / 2 - (this.barWidth2 + j)/2 - (150 + j * 20)-j*4, HEIGHT / 2 - (this.barHeight2 + j*6)/2, this.barWidth2+j, this.barHeight2+j*6);  
    //   }
    //   this.canvasCtx.translate(WIDTH / 2, HEIGHT / 2);
    //   this.canvasCtx.rotate(-this.barWidth2*2*i*Math.PI/180);
    //   this.canvasCtx.translate(-WIDTH / 2, -HEIGHT / 2);      
    // }
    // for(var i = 1; i < this.bars.length + 1; i++) {
      
    //   if(this.bars[i] < 50) {
    //     this.canvasCtx.strokeStyle = '#000';
    //   }
    //   this.canvasCtx.beginPath();

    //   this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 140 + i * 10 + i, 0, 2*Math.PI, false);  

    //   this.canvasCtx.lineWidth = i;
    //   this.canvasCtx.stroke();
      
    // }
    // this.canvasCtx.strokeStyle = 'rgba(189, 195, 247,1)';

    // this.canvasCtx.lineWidth = 20;
    // console.log(this.bars);
    // for(var i = 1; i < this.bars.length + 1; i++) {
      
    //   if(this.bars[i] < 50) {
    //     this.canvasCtx.strokeStyle = '#000';
    //   }
    //   this.canvasCtx.beginPath();

    //   this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 140 + i * 10 + i, 0, 2*Math.PI, false);  

    //   this.canvasCtx.lineWidth = i;
    //   this.canvasCtx.stroke();
      
    // }
    // this.canvasCtx.strokeStyle = 'rgba(189, 195, 247,1)';

    this.canvasCtx.lineWidth = 10;

    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 400, this.rotationBegin * Math.PI, this.rotationEnd * Math.PI, false);
    this.canvasCtx.stroke()
    
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 400, (this.rotationBegin - (1*this.rotationSeparate)) * Math.PI, (this.rotationEnd - (1*this.rotationSeparate)) * Math.PI, false);
    this.canvasCtx.stroke()
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 400, (this.rotationBegin - (2*this.rotationSeparate)) * Math.PI, (this.rotationEnd -(2*this.rotationSeparate) - 1/12) * Math.PI, false);
    this.canvasCtx.stroke()
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 400, (this.rotationBegin - (3*this.rotationSeparate)) * Math.PI, (this.rotationEnd -(3*this.rotationSeparate)) * Math.PI, false);
    this.canvasCtx.stroke()
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 400, (this.rotationBegin - (4*this.rotationSeparate)-1/12) * Math.PI, (this.rotationEnd -(4*this.rotationSeparate)) * Math.PI, false);
    this.canvasCtx.stroke()
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 400, (this.rotationBegin - (5*this.rotationSeparate)) * Math.PI, (this.rotationEnd -(5*this.rotationSeparate)-1/12) * Math.PI, false);
    this.canvasCtx.stroke()


    this.rotationBegin += 0.005;
    this.rotationEnd += 0.005;
  },

  drawStereo: function() {
    this.analyser.getByteFrequencyData(this.dataArray);
    requestAnimationFrame(this.drawStereo);
    this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    // get volume
    var sum = 5000;
    for(var i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    var volume = sum / this.bufferLength * 2;

    // set bars
    this.canvasCtx.fillStyle = this.gradient;
    var temp = volume;
    for(var i = 0; i < this.bars.length; i++) {
      temp *= 1.1;
      var that = this;
      (function( i, temp ) {
          setTimeout( function() {
              that.bars[ i ] = temp;
          }, that.delay * (i));
      })( i, temp );
    }
    this.canvasCtx.beginPath();
    // circle around logo
    this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 130 + volume / 2, 0, 360, false);
    // this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 130, 1-this.rotationBegin*Math.PI, 1-this.rotationEnd*Math.PI, false);
    this.canvasCtx.lineWidth = 10;
    this.canvasCtx.strokeStyle = this.gradient;
    this.canvasCtx.stroke();

    
    // var odd = 0;
    for(var i = 1; i < this.bars.length + 1; i++) {
      this.canvasCtx.beginPath();
      this.canvasCtx.globalAlpha = 1/ i;
      this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 130 + i* this.bars[i], 0, 360, false);
      this.canvasCtx.lineWidth = 10;
      this.canvasCtx.stroke();
      this.canvasCtx.globalAlpha = 1;
    }
    // this.canvasCtx.beginPath();
    // this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 350, this.rotationBegin*Math.PI, this.rotationEnd*Math.PI, false);
    // this.canvasCtx.lineWidth = 30;
    // this.canvasCtx.closePath();
    //   this.canvasCtx.strokeStyle = '#000';
    //   this.canvasCtx.stroke();
      this.rotationBegin += 0.02;
      this.rotationEnd += 0.02;
  },

  drawGreenBars: function() {
    this.analyser.getByteFrequencyData(this.dataArray);
    requestAnimationFrame(this.drawGreenBars);
    this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    // set background
    this.canvasCtx.fillStyle = '#000';
    this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    // get volume
    var sum = 5000;
    for(var i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    var volume = sum / this.bufferLength * 3;

    // set bars
    var greenGradient = this.canvasCtx.createLinearGradient(WIDTH/2, 200, WIDTH/2, 500);
    greenGradient.addColorStop(0,'#92d043');
    greenGradient.addColorStop(0.3,'#244e14');
    greenGradient.addColorStop(0.7,'#244e14');
    greenGradient.addColorStop(1,'#92d043');

    this.canvasCtx.fillStyle = greenGradient;
    var temp = volume;
    for(var i = 0; i < this.bars.length; i++) {
      temp *= 0.9;
      var that = this;
      (function( i, temp ) {
          setTimeout( function() {
              that.bars[ i ] = (temp + that.bars[i])/2;
          }, that.delay * (i));
      })( i, temp );
    }
    for(var i = 1; i < this.bars.length; i++) {
        // this.canvasCtx.globalAlpha=this.bars[i]/64;
        this.canvasCtx.fillRect(WIDTH / 2 + (i * this.barWidth * 2) - 1, HEIGHT / 2 - 1, this.barWidth, this.bars[i]);  
        this.canvasCtx.fillRect(WIDTH / 2 + (-i * this.barWidth * 2) - 1, HEIGHT / 2 - 1, this.barWidth, this.bars[i]);  
        this.canvasCtx.fillRect(WIDTH / 2 + (i * this.barWidth * 2) - 1, HEIGHT / 2 - 1, this.barWidth, -this.bars[i]);  
        this.canvasCtx.fillRect(WIDTH / 2 + (-i * this.barWidth * 2) - 1, HEIGHT / 2 - 1, this.barWidth, -this.bars[i]);  
        this.canvasCtx.globalAlpha=1;
    }

    this.canvasCtx.fillStyle = '#92d043';
    // bottom bar
    this.canvasCtx.fillRect(WIDTH / 2 - 1, HEIGHT / 2 - 1, this.barWidth, volume);
    // top bar
    this.canvasCtx.fillRect(WIDTH / 2 - 1, HEIGHT / 2 - 1, this.barWidth, -volume);
  },

  drawEDC: function() {
    this.analyser.getByteFrequencyData(this.dataArray);
    requestAnimationFrame(this.drawEDC);
    this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    // if(this.iteration < this.totalIterations) {
    //   this.iteration++;
    // } else {
    //   this.iteration = 0;
    //   this.rotationBegin += 0.1;
    //   this.rotationEnd += 0.1;
    // }

    // this.canvasCtx.strokeStyle = '#000';
    // this.canvasCtx.moveTo(0, 0);
    // // this.canvasCtx.lineTo(WIDTH *4/10 - 40, HEIGHT *4/10 - 20);
    // // this.canvasCtx.moveTo(WIDTH *6/10 + 40, HEIGHT *6/10 + 20);
    // this.canvasCtx.lineTo(WIDTH, HEIGHT);


    // this.canvasCtx.closePath();


    // get volume
    var sum = 5000;
    for(var i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    var volume = sum / this.bufferLength * 2;
    // console.log('sum = ' + sum);
    // console.log('volume = ' + volume);

    // set bars
    this.canvasCtx.fillStyle = this.gradient;
    var temp = volume;
    for(var i = 0; i < this.bars.length; i++) {
      temp *= 0.9;
      var that = this;
      (function( i, temp ) {
          setTimeout( function() {
              that.bars[ i ] = temp;
          }, that.delay * (i));
      })( i, temp );
    }
    
    var radgrad = this.canvasCtx.createRadialGradient(WIDTH/2, HEIGHT /2,50,WIDTH/2, HEIGHT/2,320);
    radgrad.addColorStop(0, 'rgba(62, 68, 120,1)');
    if(sum < 18000) {
      radgrad.addColorStop(1, 'rgba(62, 68, 120,1)');
    } else {
      radgrad.addColorStop(0.3, 'rgba(189, 195, 247,1)');
      radgrad.addColorStop(0.5, 'red');
      // radgrad.addColorStop(0.5, 'rgba(189, 195, 247,1)');
      radgrad.addColorStop(0.7, '#ffff00');
      radgrad.addColorStop(1, '#fff');
      // radgrad.addColorStop(1, '#244e14');
    }
    this.canvasCtx.beginPath();
    // circle around logo
    this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 130, 0, 360, false);
    // this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 130, this.rotationBegin*Math.PI, this.rotationEnd*Math.PI, false);
    // this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 130, 1-this.rotationBegin*Math.PI, 1-this.rotationEnd*Math.PI, false);
    this.canvasCtx.lineWidth = 10;
      this.canvasCtx.strokeStyle = radgrad;
      this.canvasCtx.stroke();
    var odd = 0;
    for(var i = 1; i < this.bars.length + 1; i++) {
      this.canvasCtx.beginPath();
      // this.canvasCtx.arc(WIDTH / 2 , HEIGHT / 2, 150 + this.bars[i], 1.6*Math.PI, 0.4*Math.PI, false);  
      this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 150 + this.bars[i], 0, 2*Math.PI, false);  
      // odd = i % 2 == 0 ? -1 : 1; 
      // this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 130 + i *50, (-1*odd)*this.rotationBegin*Math.PI, (-1*odd)*this.rotationEnd*Math.PI, false);  
      // this.canvasCtx.arc(WIDTH / 2, HEIGHT / 2, 130 + i *50, 0, 360, false);  
      // console.log(this.bars[i]);
      this.canvasCtx.lineWidth = (this.bars[i] / 50);
      this.canvasCtx.stroke();
      
    }
    this.canvasCtx.strokeStyle = 'rgba(189, 195, 247,1)';
    // this.canvasCtx.shadowColor = "white";
    // this.canvasCtx.shadowOffsetY = 5;
    // this.canvasCtx.shadowBlur = 10;
    this.canvasCtx.lineWidth = 20;
    // this.canvasCtx.lineWidth = 20+volume/5;
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 300, this.rotationBegin * Math.PI, this.rotationEnd * Math.PI, false);
    this.canvasCtx.stroke()
    this.canvasCtx.lineWidth = 20;
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 300, (this.rotationBegin - (1*this.rotationSeparate)) * Math.PI, (this.rotationEnd - (1*this.rotationSeparate)) * Math.PI, false);
    this.canvasCtx.stroke()
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 300, (this.rotationBegin - (2*this.rotationSeparate)) * Math.PI, (this.rotationEnd -(2*this.rotationSeparate) - 1/12) * Math.PI, false);
    this.canvasCtx.stroke()
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 300, (this.rotationBegin - (3*this.rotationSeparate)) * Math.PI, (this.rotationEnd -(3*this.rotationSeparate)) * Math.PI, false);
    this.canvasCtx.stroke()
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 300, (this.rotationBegin - (4*this.rotationSeparate)-1/12) * Math.PI, (this.rotationEnd -(4*this.rotationSeparate)) * Math.PI, false);
    this.canvasCtx.stroke()
    this.canvasCtx.beginPath();
    this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 300, (this.rotationBegin - (5*this.rotationSeparate)) * Math.PI, (this.rotationEnd -(5*this.rotationSeparate)-1/12) * Math.PI, false);
    this.canvasCtx.stroke()
    // this.canvasCtx.beginPath();
    // this.canvasCtx.strokeStyle ='#000';
    // this.canvasCtx.arc(WIDTH/2, HEIGHT/2, 450, this.rotationBegin*Math.PI, this.rotationEnd*Math.PI, false);
    // this.canvasCtx.closePath();
    // this.canvasCtx.stroke();
    this.rotationBegin += 0.005;
    this.rotationEnd += 0.005;
    // this.canvasCtx.beginPath();
    // this.canvasCtx.strokeStyle = '#000';
    // this.canvasCtx.moveTo(0, 0);
    // this.canvasCtx.lineTo(WIDTH *4/10 - 40, HEIGHT *4/10 - 20);
    // this.canvasCtx.moveTo(WIDTH *6/10 + 40, HEIGHT *6/10 + 20);
    // this.canvasCtx.lineTo(WIDTH, HEIGHT);
    // this.canvasCtx.lineWidth = 30;

    // // this.canvasCtx.closePath();
    // this.canvasCtx.stroke();
    // bottom bar
    // this.canvasCtx.fillRect(WIDTH / 2 - 1, HEIGHT / 2 - 1, this.barWidth, volume);
    // top bar
    // this.canvasCtx.fillRect(WIDTH / 2 - 12, HEIGHT / 2 - 1, 25, -volume);
  },

  draw: function() {
    this.analyser.getByteFrequencyData(this.dataArray);
    requestAnimationFrame(this.draw);
    this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    // set background
    this.canvasCtx.fillStyle = '#000';
    this.canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    // get volume
    var sum = 5000;
    for(var i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    var volume = sum / this.bufferLength * 2;

    // set bars
    this.canvasCtx.fillStyle = this.gradient;
    var temp = volume;
    for(var i = 0; i < this.bars.length; i++) {
      temp *= 0.9;
      var that = this;
      (function( i, temp ) {
          setTimeout( function() {
              that.bars[ i ] = temp;
          }, that.delay * (i));
      })( i, temp );
    }
    for(var i = 1; i < this.bars.length + 1; i++) {
        this.canvasCtx.fillRect(WIDTH / 2 + (i * this.barWidth * 2) - 1, HEIGHT / 2 - 1, this.barWidth, this.bars[i]);  
        this.canvasCtx.fillRect(WIDTH / 2 + (-i * this.barWidth * 2) - 1, HEIGHT / 2 - 1, this.barWidth, this.bars[i]);  
        this.canvasCtx.fillRect(WIDTH / 2 + (i * this.barWidth * 2) - 1, HEIGHT / 2 - 1, this.barWidth, -this.bars[i]);  
        this.canvasCtx.fillRect(WIDTH / 2 + (-i * this.barWidth * 2) - 1, HEIGHT / 2 - 1, this.barWidth, -this.bars[i]);  
    }
    // bottom bar
    this.canvasCtx.fillRect(WIDTH / 2 - 1, HEIGHT / 2 - 1, this.barWidth, volume);
    // top bar
    this.canvasCtx.fillRect(WIDTH / 2 - 1, HEIGHT / 2 - 1, this.barWidth, -volume);
  },

  render: function() {
    return <canvas id="myCanvas" width="1400" height="700"></canvas>
  }

});

React.render(
  <APP />,
  document.getElementById('container')
);

// bass => 87.31 - 349.23
// baritone => 98 - 392
// tenor => 130 - 493.88
// contralto => 130.81 - 698.46
// soprano => 246.94 - 1174.7

// fft size = 1024, bin count = 512
// freq/bin = 43