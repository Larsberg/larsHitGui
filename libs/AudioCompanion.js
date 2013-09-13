/**
 * AudioCompanion.js
 *
 *things we wnt:
 *-song info
 *-automatically break down soundcloud api urls
 *-fft vis and control
 *-faux octave averaging
 *-node set up and acces
 *-destruction and re-loading
 *-play puase rewind controls
 *-display mode with mouse over in the corner
 *-access to divs
 * 
 */

var AudioCompanion = function( params ){
	params = params || {};

	// this.context = params.context || new webkitAudioContext();

	this.context;
	if (typeof webkitAudioContext !== "undefined") {
	    this.context = new webkitAudioContext();
	} 
	// else if (typeof AudioContext !== "undefined") {
	//     this.context = new AudioContext();
	// }
	 else {
	    alert('AudioContext not supported. Pleas use Chrome instead');
	}
	this.analyser = this.context.createAnalyser();
	this.gain = this.context.createGainNode();
	this.gain.gain.value = 0.5;

	this.analyser.fftSize = params.numSamples || 1024;
	this.analyser.smoothingTimeConstant = params.smoothing || .5;
	this.sampleStep = params.sampleStep || 32;//try to keep powers of 2..?

    this.octaves = [];

	this.audioDiv = document.createElement('table');	
	this.audioDiv.style.position =  "absolute";
	this.audioDiv.style.bottom = "10px";
	this.audioDiv.style.left = "10px";
	this.audioDiv.style.width = (10 * 25) + "px";
	this.audioDiv.style.height = "50px";
	this.audioDiv.style.backgroundColor = "rgba(0,0,0,.4)";
	var container = params.container || document.getElementById( "container" );
	container.appendChild( this.audioDiv );

	var baseline = document.createElement('div');
	baseline.style.position = "absolute";
	baseline.style.bottom = "0px";
	baseline.style.width = "100%";
	baseline.style.height = "7px";
	baseline.style.backgroundColor = "rgba(255,255,255,.2)";
	this.audioDiv.appendChild( baseline );

	this.audioDiv.bars = [];

	this.isLoaded = false;
}

AudioCompanion.prototype.load = function( url, callback ) {
	callback = callback || function(){};
	this.audio = new Audio();
	this.audio.addEventListener( "canplay", function(){
		this.source = this.context.createMediaElementSource(this.audio);
		this.source.connect(this.analyser);	
		this.analyser.connect(this.gain);
		this.gain.connect(this.context.destination);

	    this.freqData = new Uint8Array( this.analyser.frequencyBinCount );

	    this.isLoaded = true;

	    this.play();

	    callback();

	}.bind(this));
	this.audio.src = url;

	// audio.src = 'http://api.soundcloud.com/tracks/88527478	/stream.json' + //38892772 == headcase // 54394 == una pena // 10265765 == smiling off // 39173687 == russian doll // 88527478 == get lucky
	// 		'?client_id=YOUR_CLIENT_ID'; //'audio/01_dirge.mp3';
};

AudioCompanion.prototype.play = function() {
	if(this.isLoaded){
		this.audio.play();
	}
};

AudioCompanion.prototype.pause = function() {
	if(this.isLoaded){
		this.audio.paused? this.audio.play() : this.audio.pause();
	}
};

AudioCompanion.prototype.getOctaves = function(){
	//zero it out
	for(var i=0; i<this.octaves.length; i++)	this.octaves[i] = 0;

	//avertage teh data
	var octaveIndex=0, octaveCount = 0, octaveLength=this.sampleStep;//1;
	for(var i=0; i<this.freqData.length; i++){
		this.octaves[octaveIndex] += this.freqData[i];
		octaveCount++;
		if(octaveCount >= octaveLength){
			this.octaves[octaveIndex] /= octaveCount;
			// octaveLength *= 2;

			octaveCount = 0;
			octaveIndex += 1;
			this.octaves[octaveIndex] = 0;
		} 
	}	

	if( this.audioDiv !== undefined){
		for(var i=0; i<this.octaves.length; i++){
			if(this.audioDiv.bars[i] === undefined)	this.addBar();
			this.audioDiv.bars[i].style.height = this.octaves[i] / 3 + "%";
		}
	}

	return this.octaves;
}

AudioCompanion.prototype.update = function() {
	if(this.isLoaded){
		this.analyser.getByteFrequencyData( this.freqData );	//getFloatFrequencyData(freqData);
		this.getOctaves();	
	}
};

AudioCompanion.prototype.addBar = function(){
	var index = this.audioDiv.bars.length;
	bar = document.createElement('div');
	bar.style.position = "absolute";
	bar.style.bottom = "8px";
	bar.style.left =  (index * 25) + "px";
	bar.style.width = "24px";
	bar.style.height = "0%";
	bar.style.backgroundColor = "rgba(255,255,255,.2)";
	bar.style.textAlign = "center";
	bar.style.font = "Arial";
	bar.style.fontSize = "8px";
	bar.style.color = "rgba(255,255,255,.2)";
	bar.style.verticalAlign = "bottom";
	bar.appendChild( document.createTextNode(""+index) )

	this.audioDiv.appendChild( bar );
	this.audioDiv.bars.push( bar );
	this.audioDiv.style.width = ((index+1) * 25) + "px";
}

AudioCompanion.prototype.mute = function() {

	this.audio.muted = !this.audio.muted;	
	if(!this.audio.muted){
		this.gain.gain.value = (this.lastVolume == undefined)? 0 : .5;
	}else{
		this.lastVolume = this.gain.gain.value;
		this.gain.gain.value = 0;
	}
}

