/**
 * AudioNodes.js
 */

LabNodes = LabNodes || {};
LabNodes.AudioNodes = LabNodes.AudioNodes || {};

LabNodes.getAudioContext = function(){
	if(LabNodes.audioContext == undefined)
	{
		try {
			    if(typeof webkitAudioContext === 'function') {
			    	// webkit-based
			        LabNodes.audioContext = new webkitAudioContext();
			    }
			    else {
			    	// other browsers that support AudioContext
			        LabNodes.audioContext = new AudioContext();
			    }
			}
			catch(e) {
				alert('Sorry but Web Audio API is not supported in this browser, \nPlease use chrome');
			}
	}		

	return LabNodes.audioContext;
}

LabNodes.getTuna = function(){

	if(LabNodes.tuna == undefined ){
		LabNodes.tuna = new Tuna( LabNodes.audioContext );
	}

	if(LabNodes.tuna == undefined ){
		alert( "sorry, couldn't get any tuna")
	}
	return LabNodes.tuna;
}





/**
 * a stereo input destination node. containg a merge node, master gain and a compressor
 * @param {[type]} params [description]
 */

LabNodes.AudioNodes.Destination = function( params ){
	params = params || {};

	params.useTitles = false;
	params.useTitle = true;

	LabNodes.Nodes.Base.call( this, params );

	//get our context
	var context = LabNodes.getAudioContext();

	//create our nodes
	this.gain = context.createGainNode();
	this.merger = context.createChannelMerger(2);
	this.compressor = context.createDynamicsCompressor();

	//string them together
	this.merger.connect( this.gain );
	// this.gain.connect( context.destination );
	this.gain.connect( this.compressor );
	this.compressor.connect( context.destination );

	//input
	this.inLeft = new LabNodes.Attr.Audio({name: 'left' });
	this.addInputAttr( this.inLeft );
	this.inRight = new LabNodes.Attr.Audio({name: 'right' });
	this.addInputAttr( this.inRight );

	// web audio connection for left and right
	this.inLeft.onConnect = function( input ){
		input.value.value.connect( this.merger, 0, 0);
	}.bind( this );
	this.inRight.onConnect = function( input ){
		input.value.value.connect( this.merger, 0, 1);
	}.bind( this );

	//MASTER GAIN
	var adjustGain = function(val){
		//this gets called when we move the slider
		this.gain.gain.value = val;
	}.bind(this);

	//create our slider 
	var vol = params.volume == undefined ? .1 : params.volume;
	this.slider = document.createElement( 'div' );
	$(this.slider).slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: 1,
		step: .001,
		value: vol,
		slide: function(event, ui){
			adjustGain(ui.value);
		 },
	});

	adjustGain( vol );

	//add our slider to the middle of the node(this.spacer)
	this.spacer.appendChild( this.slider );
	this.spacer.style.height = params.height || 20 + "px";

	this.slider.style.height = "80px";
}

LabNodes.AudioNodes.Destination.prototype = Object.create( LabNodes.Nodes.Base.prototype );

LabNodes.AudioNodes.Destination.prototype.getType = function() {
	return "audioDestinationNode";
};



/**
 * Oscillator
 */
LabNodes.AudioNodes.Oscillator = function( params ){
	params = params || {};

	params.useTitles = false;
	params.useTitle = true;

	LabNodes.Nodes.Base.call( this, params );

	this.osc = LabNodes.getAudioContext().createOscillator();
	
	this.oscillator = LabNodes.getAudioContext().createOscillator();
	this.oscillator.frequency.value = 42.1;
	this.oscillator.noteOn( 0 );

	this.out = new LabNodes.Attr.Audio({name: '•', value: this.oscillator });
	this.addOutputAttr( this.out );

	this.inFreq = new LabNodes.Attr.Number({name: 'freq', value: 42.1 });
	this.addInputAttr( this.inFreq );

	this.textNode = document.createTextNode(this.inFreq.value.value)
	this.spacer.appendChild( this.textNode );

	var oscUpdate = function(){
		this.oscillator.frequency.value = Math.max(0., this.inFreq.value.value);
		this.textNode.nodeValue = parseInt(this.oscillator.frequency.value * 100)/100;
	}.bind( this );

	LabNodes.addToAutoupdate( this.inFreq, oscUpdate );

}

LabNodes.AudioNodes.Oscillator.prototype = Object.create( LabNodes.Nodes.Base.prototype );

LabNodes.AudioNodes.Oscillator.prototype.getType = function() {
	return "audioOscillatorNode";
};


/**
 * a web audio kit gain node 
 * @param {[type]} params [description]
 */
LabNodes.AudioNodes.Gain = function(params){
	params = params || {};	

	params.useTitles = false;
	params.useTitle = true;
	params.spaceWidth = "0px";

	LabNodes.Nodes.Base.call( this, params );

    this.gain = LabNodes.getAudioContext().createGainNode();

	this.gain.gain.value = 0.5;
	
	//create our input and output attributes	
	this.in = new LabNodes.Attr.Audio({name: '•', value: 0 });
	this.volume = new LabNodes.Attr.Number({name: '.5', value: 0 });
	this.addInputAttr( this.in );
	this.addInputAttr( this.volume );

	this.out = new LabNodes.Attr.Audio({name: '•', value: 0 });
	this.addOutputAttr( this.out );

	//connect our attributes so that we can traverse upstream <--- with audio nodes we don't want that?
	// this.out.connectInput( this.in, "in" );
	// this.out.connectInput( this.volume, "volume" );
	
	//set our values. with audio we don't need really need to update
	this.in.value = undefined;
	this.out.value = this.gain;
		
	//we need to do the web audio connection
	this.in.onConnect = function( input ){
		//the input node passes an audio node. input.value.value == input audio node
		input.value.value.connect( this.gain );
	}.bind( this );

	this.volume.onConnect = function(){
		$(this.slider).slider( "disable" );
	}.bind( this );

	this.out.value = this.gain;


	//this gets called when we move the slider
	var adjustGain = function(val){
		this.gain.gain.value = val;
		this.volume.textNode.nodeValue = parseFloat(val).toFixed(2);
	}.bind(this);

	//create our slider 
	var vol = params.volume || .5;
	this.slider = document.createElement( 'div' );
	$(this.slider).slider({
		orientation: "vertical",
		range: "min",
		min: 0,
		max: 1,
		step: .001,
		value: vol,
		slide: function(event, ui){
			adjustGain(ui.value);
		 },
	});

	//add our slider to the middle of the node(this.spacer)
	this.spacer.appendChild( this.slider );
	this.spacer.style.height = params.height || 20 + "px";
	this.slider.style.height = "80px";

	//redfine our out attributes update function
	this.out.update = function()
	{
		if( this.volume.inputs["value"] == undefined)
		{
			adjustGain( $(this.slider).slider( "value" ) );
		}
		else//if we have a volume input we disable our slider and set it using the input
		{
			var v = this.volume.value.value;
			$( this.slider ).slider( "value", v );
			this.gain.gain.value = v;
			this.volume.textNode.nodeValue = parseFloat(v).toFixed( Math.min(2, ("" + v).length ) );
		}
	}.bind( this );

	LabNodes.addToAutoupdate( this.out );
}
LabNodes.AudioNodes.Gain.prototype = Object.create( LabNodes.Nodes.Base.prototype );

LabNodes.AudioNodes.Gain.prototype.getType = function() {
	return "audioGainNode";
};