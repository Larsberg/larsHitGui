/**
 * Nodes.js
 */


var LabNodes = LabNodes || {};
LabNodes.Nodes = LabNodes.Nodes || {};


LabNodes.addToAutoupdate = function( obj, func ) {
	LabNodes.autoupdateAttributes = LabNodes.autoupdateAttributes || {};

	LabNodes.autoupdateAttributes[obj.name] = func || obj.update;
};


LabNodes.autoupdate = function() {
	LabNodes.autoupdateAttributes = LabNodes.autoupdateAttributes || {};

	for( var i in LabNodes.autoupdateAttributes){
		if(LabNodes.autoupdateAttributes[i] != undefined){
			LabNodes.autoupdateAttributes[i]();
		}else{
			console.log( "no update method for ", LabNodes.autoupdateAttributes[i] );
		}
	}
};


LabNodes.Nodes.Base = function( params ){
	params = params || {};

	this.name = this.cleanName = params.name || this.getType() ||"node";
	this.getUniqueName();

	this.inputs = params.inputs || {};
	this.outputs = params.outputs || {};
	this.inList = undefined;
	this.outList = undefined;

	this.div = document.createElement( 'div' );

	this.setupCSS( params );

	this.makeDraggable( params );
}

LabNodes.Nodes.Base.prototype.connectInput = function( inputName, otherNode, otherAttrName, useCurve )
{

	var inputAttr = this.getInput( inputName );
	var otherAttr = otherNode.getOutput( otherAttrName );
	if(inputAttr != undefined && otherAttr != undefined )
	{
		inputAttr.connectInput( otherAttr, undefined, undefined, useCurve || true );
	}
	LabNodes.autoupdate()
}

LabNodes.Nodes.Base.prototype.setupCSS = function( params ){
	params = params || {};
	var useTitles = (params.useTitles == undefined)? true : params.useTitles;
	
	this.div.style.backgroundColor = "rgba(100,100,110, .3)";
	this.div.style.borderRadius = parseInt((params.fontSize || 8)/2) + "px";
	this.div.style.padding = "2px";
	this.div.style.position = "absolute";
	this.div.style.left = params.left || "100px";
	this.div.style.top = params.top || "100px";
	this.div.style.minWidth = "30px";
	this.div.style.minHeight = "14px";
	this.div.style.textAlign = "center";
	this.div.style.fontFamily = "sans-serif";
	this.div.style.fontSize = params.fontSize  || 8 + "px";
	this.div.style.textShadow = "0px 0px 2px #111";


	//node title
	if(useTitles || params.useTitle){
		this.titleDiv = document.createElement( 'div' );
		this.titleDiv.appendChild( document.createTextNode( this.cleanName ));
		this.div.appendChild( this.titleDiv );	
	}
	

	//inputs and outputs
	var table = document.createElement( "table" );
	table.style.margin = "3px";
	var row = document.createElement( "tr" );

	this.inList = document.createElement( "td" );
	this.outList = document.createElement( "td" );

	if(useTitles){

		var inTitle = document.createElement( "div" );
		var outTitle = document.createElement( "div" );

		inTitle.style.textDecoration = "underline";
		outTitle.style.textDecoration = "underline";

		inTitle.appendChild( document.createTextNode( this.inputTitle || "inputs" ));
		outTitle.appendChild( document.createTextNode( this.outputTitle || "outputs" ));	
		
		this.inList.appendChild( inTitle );
		this.outList.appendChild( outTitle );
	}


	this.inList.style.verticalAlign = "top";
	this.inList.style.textAlign = "left";

	this.outList.style.verticalAlign = "top";
	this.outList.style.textAlign = "right";

	this.spacer = document.createElement( "td" );
	this.spacer.style.width =  params.spaceWidth || "10px";

	row.appendChild( this.inList );
	row.appendChild( this.spacer );
	row.appendChild( this.outList );

	table.appendChild( row )

	this.div.appendChild( table );

};

LabNodes.Nodes.Base.prototype.getType = function(){
	return "Node";
}
LabNodes.Nodes.Base.prototype.getOutput = function( name ){
	//try just the full names first
	for(var i in this.outputs){
		if( i == name ){
			return this.outputs[i];
		}
	}

	//then try using the clean nmaes
	for(var i in this.outputs){
		if( this.outputs[i].cleanName == name){
			return this.outputs[i];
		}
	}

	//
	console.log( "couldn't find an output by name: " + name );
	return undefined;
}
LabNodes.Nodes.Base.prototype.getInput = function( name ){
	//try just the full names first
	for(var i in this.inputs){
		if( i == name ){
			return this.inputs[i];
		}
	}

	//then try using the clean nmaes
	for(var i in this.inputs){
		if( this.inputs[i].cleanName == name){
			return this.inputs[i];
		}
	}

	//
	console.log( "couldn't find an input by name: " + name );
	return undefined;
}

LabNodes.Nodes.Base.prototype.addInputAttr = function(input) {

	input.parentNode = this;

	input.makeDroppable();

	this.inputs[ input.name ] = input;

	this.inList.appendChild( input.div );

};

LabNodes.Nodes.Base.prototype.addOutputAttr = function(output) {

	output.parentNode = this;

	output.makeDraggable();

	this.outputs[ output.name ] = output;
	this.outputs[ output.name ].isOutput = true;

	this.outList.appendChild( output.div );

};
LabNodes.Nodes.Base.prototype.getUniqueName = function() {
	if(LabNodes.nodes == undefined)	LabNodes.nodes = {}

	var nameCount=0;
	while (LabNodes.nodes[ this.name ] != undefined ){
		this.name = this.cleanName + '_' + nameCount;
		nameCount++;
	}
	LabNodes.nodes[ this.name ] = this;
};

LabNodes.Nodes.Base.prototype.makeFieldWritable = function( field ) {
	$(field).click(function(e){
		//this doesn't seem to work
		if ( $(this).is('.ui-draggable-dragging') ) {
			return;
		}
		this.focus();
	});

	$(field).focusin(function(){
		this.style.backgroundColor = "rgba(100,255,255,100)";
	});
	$(field).focusout(function( e ){
		this.style.backgroundColor = "rgba(255,255,255,100)";
	});
	$(field).keyup( function( e ){
		if(!isNaN(this.value)){
			this.style.backgroundColor = "rgba(0,255,255,100)";
		}else{
			this.style.backgroundColor = "rgba(255,55,55,100)";
		}
		if( e.keyCode == 13 ){
			this.blur();
		}
	})
}


LabNodes.Nodes.Base.prototype.makeDraggable = function(params){
	params = params || {};

	var updateCurves = function( event, ui ){
		//update the inputs
		for (var i in this.inputs ) {
			if(this.inputs[i].curve != undefined){
				this.inputs[i].curve.update();
			}

			for( var j in this.inputs[i].curves){
				this.inputs[i].curves[j].update();
			}
		};

		//update the outputs
		for (var i in this.outputs ) {
			if(this.outputs[i].curves != undefined){
				for(var j in this.outputs[i].curves){
					this.outputs[i].curves[j].update();
				}
			}	
		};
	}.bind( this )

	$(this.div).draggable({
		drag: updateCurves,
	});
}

LabNodes.Nodes.Base.prototype.update = function(){
	//update text, outputs, etc.
}

/**
 * Vec3 node
 */
LabNodes.Nodes.Vec3 = function( params ){
	params = params || {};

	LabNodes.Nodes.Base.call( this, params );

	this.v3 = new LabNodes.Attr.Vec3({name:"v3"});

	this.inX = new LabNodes.Attr.Number({name: "x", value: 0});
	this.inY = new LabNodes.Attr.Number({name: "y", value: 0});
	this.inZ = new LabNodes.Attr.Number({name: "z", value: 0});

	this.outX = new LabNodes.Attr.Number({name: "x", value: 0});
	this.outY = new LabNodes.Attr.Number({name: "y", value: 0});
	this.outZ = new LabNodes.Attr.Number({name: "z", value: 0});

	this.v3.connectInput( this.inX, "x", "number" );
	this.v3.connectInput( this.inY, "y", "number" );
	this.v3.connectInput( this.inZ, "z", "number" );

	this.outX.connectInput( this.inX );
	this.outY.connectInput( this.inY );
	this.outZ.connectInput( this.inZ );

	this.addInputAttr( this.inX );
	this.addInputAttr( this.inY );
	this.addInputAttr( this.inZ );

	this.addOutputAttr( this.v3 );
	this.addOutputAttr( this.outX );
	this.addOutputAttr( this.outY );
	this.addOutputAttr( this.outZ );
}

LabNodes.Nodes.Vec3.prototype = Object.create( LabNodes.Nodes.Base.prototype );

/**
 * Number Field
 */

LabNodes.Nodes.NumberField = function( params ){
	params = params || {};

	params.useTitles = false;
	params.spaceWidth = "0px";

	LabNodes.Nodes.Base.call( this, params );

	this.in = new LabNodes.Attr.Number({name: '•', value: params.value || 0});
	this.out = new LabNodes.Attr.Number({name: '•'});
	this.out.connectInput( this.in, "value" );

	this.addInputAttr( this.in );
	this.addOutputAttr( this.out );

	this.textField = document.createElement( "input" );
	this.textField.labAttr = this;

	this.textField.setAttribute( "value", this.in.value.value );
	this.textField.style.left = "0px";
	this.textField.style.top = "0px";
	this.textField.style.width = "20px";

	var updateFieldWidth = function(){
		$(this.textField).width( Math.max(20, this.textField.value.length * this.in.fontSize) );
	}.bind( this );

	var updateField = function( val ){
		val = val || this.in.value.value;

		//if we have an input it's not keyable
		if(this.in.inputs["value"] != undefined){
			this.textField.value = this.in.inputs["value"].value.value;
		}

		//otherwise we can pass on the to our output
		else{
			if(this.textField.value == ".")	this.textField.value = "0.";
			var isNumber = !isNaN( this.textField.value );
			if( isNumber ){
				this.in.value = val;
			}
			else{
				this.textField.value = this.in.value.value;
			}
		}

		updateFieldWidth();
	}.bind( this );
	
	$(this.textField).click(function(e){
		this.focus();
	});

	$(this.textField).focusin(function(){
		// console.log( "focusout" );
		this.style.backgroundColor = "rgba(100,255,255,100)";

		updateField( this.value );
	});
	$(this.textField).focusout(function( e ){
		// console.log( e );
		this.style.backgroundColor = "rgba(255,255,255,100)";

		updateField( this.value );
		LabNodes.autoupdate();
	});
	$(this.textField).keyup( function( e ){

		if(parseFloat(this.value) != NaN){
			this.style.backgroundColor = "rgba(0,255,255,100)";

			// this.labAttr._value = this.value;
		}else{
			this.style.backgroundColor = "rgba(255,55,55,100)";
		}
		if( e.keyCode == 13 ){
			this.blur();

		}
		updateField( this.value );
		LabNodes.autoupdate();
	})

	this.spacer.appendChild( this.textField );


	LabNodes.addToAutoupdate( this.out, updateField );
}

LabNodes.Nodes.NumberField.prototype = Object.create( LabNodes.Nodes.Base.prototype );

LabNodes.Nodes.NumberField.prototype.getType = function() {
	return "numberField";
};

/**
 * Int
 * 
 */

LabNodes.Nodes.Int = function( params ){
	params = params || {};

	params.useTitles = false;
	params.spaceWidth = "0px";
	params.useTitle = true;
	params.name = "int";

	LabNodes.Nodes.Base.call( this, params );

	this.in = new LabNodes.Attr.Number({name: '•', value: 0 });
	this.out = new LabNodes.Attr.Number({name: '•', value: 0 });
	this.out.connectInput( this.in, "value" );

	this.addInputAttr( this.in );
	this.addOutputAttr( this.out );

	this.textNode = document.createTextNode(0);
	this.spacer.appendChild( this.textNode );

	this.in.onUpdate = function(){
		console.log( "WTF" );
	}

	this.out.update = function(){
		this.out._value = parseInt(this.out.inputs["value"].value.value);
		this.textNode.nodeValue = this.out._value;
	}.bind( this );


	LabNodes.addToAutoupdate( this.out );
}

LabNodes.Nodes.Int.prototype = Object.create( LabNodes.Nodes.Base.prototype );

LabNodes.Nodes.Int.prototype.getType = function() {
	return "intNode";
};



LabNodes.Nodes.Slider = function( params ){
	params = params || {};

	params.useTitles = false;
	params.spaceWidth = "0px";

	LabNodes.Nodes.Base.call( this, params );

	this.minInput = new LabNodes.Attr.Number({name: 'min', value: params.min || 0 });
	this.maxInput = new LabNodes.Attr.Number({name: 'max', value: params.max || 1 });

	this.out = new LabNodes.Attr.Number({name: '•', value: 0.5 });
	this.outvalText = document.createTextNode( this.out.value.value );

	this.addInputAttr( this.minInput );
	this.addInputAttr( this.maxInput );

	this.out.connectInput( this.minInput, "minInput" );
	this.out.connectInput( this.maxInput, "maxInput" );
	this.addOutputAttr( this.out );

	var updateOuput = function( lerpVal ){
		//this seems easier then reseting and refreshing the min and max in the jquery slider...
		var val = THREE.Math.mapLinear( lerpVal, 0, 1, parseFloat(this.minInput.value.value), parseFloat(this.maxInput.value.value) );
		this.out.value = val;
		this.outvalText.nodeValue = parseFloat(val).toFixed(3);
	}.bind( this );

	var sliderPos = params.sliderPosition || sliderPos || .5;
	this.slider = document.createElement( 'div' );
	$(this.slider).slider({
		orientation: "horizontal", //"vertical",
		range: "min",
		min: 0,
		max: 1,
		step: .001,
		value: sliderPos,
		slide: function(event, ui){
			updateOuput(ui.value);
			LabNodes.autoupdate();
		},
		change: function(event, ui){
			updateOuput(ui.value);
			LabNodes.autoupdate();
		},

		create: function(event, ui){
			updateOuput( sliderPos );
			LabNodes.autoupdate();
		}
	});

	this.updateOuput = function(){ updateOuput($(this.slider).slider("value") ) };

	this.spacer.appendChild( this.slider );
	this.spacer.style.width = params.width || 100 + "px";

	var outText = document.createElement( "div" );
	outText.style.color = "white";
	outText.style.fontSize = "8px";
	outText.style.marginTop = "-10px";
	outText.appendChild( this.outvalText );
	var a = $(this.slider).children()[1];
	a.appendChild( outText );

	LabNodes.addToAutoupdate( this.out, function(){
		updateOuput( $( this.slider ).slider("value") );
	}.bind( this ) );

	this.out.onUpdate = this.update;
}

LabNodes.Nodes.Slider.prototype = Object.create( LabNodes.Nodes.Base.prototype );

LabNodes.Nodes.Slider.prototype.getType = function() {
	return "intNode";
};


LabNodes.Nodes.Slider.prototype.update = function() {
	this.updateOuput();
};



