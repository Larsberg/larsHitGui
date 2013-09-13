/**
 * Attr.js
 */

var LabNodes = LabNodes || {};
LabNodes.Attr = LabNodes.Attr || {};

LabNodes.Attr.Base = function( params ){
	params = params || {};

	this.name = params.name || this.getType();
	this.cleanName = params.cleanName || this.name;
	this.getUniqueName();//<- renames (this.name + "_n") & doesn't change this.cleanName

	this._value = params.value || 0.;
	this.inputs = {};

	this.allowMultipleInputs = params.allowMultipleInputs || false;
	this.curve = undefined;//single input curve
	this.curves = {};//outputs can have multiple curves that need to update on drag
	this.parentNode = undefined;

	//for drawing in the parent node
	this.div = document.createElement( 'div' );
	this.textNode = document.createTextNode( this.cleanName );
	if( params.useName != undefined? params.useName : true )	this.div.appendChild( this.textNode );
	this.div.labAttr = this;//used for traversing from the div to the object from jquery-ui events

	this.fontSize = params.fontSize || 7;
	this.setupCSS();
}

Object.defineProperty( LabNodes.Attr.Base.prototype, "value", {
    get: function() {
    	this.update();
    	return {value: this._value}
    },
    set: function(val) { 
    	this._value = val;
    }
});
LabNodes.Attr.Base.prototype.onUpdate = function( v ){};
LabNodes.Attr.Base.prototype.update = function() {
	// do stuff here for defining the value. 
	// e.g. setting the values for a vec3 from three number inputs
	this._value = this.inputs["value"].value.value;

	this.onUpdate(this._value);
};

LabNodes.Attr.Base.prototype.getUniqueName = function() {
	
	if(LabNodes.attributes == undefined)	LabNodes.attributes = {}

	var nameCount=0;
	while (LabNodes.attributes[ this.name ] != undefined ){
		this.name = this.cleanName + '_' + nameCount;
		nameCount++;
	}
	LabNodes.attributes[ this.name ] = this;
};

LabNodes.Attr.Base.prototype.getType = function() {
	return "attr";
};

LabNodes.Attr.Base.prototype.getInputName = function() {
	return "value";
};

LabNodes.Attr.Base.prototype.traverseInputs = function( callback ){
	callback( this );

	for (var i in this.inputs ) {
		this.inputs[i].traverseInputs( callback );
	};
}
LabNodes.Attr.Base.prototype.onConnect = function( attr ){
	//overwrite this
}

LabNodes.Attr.Base.prototype.updateInputs = function() {
	// if(this.input)	this.input.update();
	// for(var i in this.inputs){
	// 	this.inputs[i].update();
	// 	this.inputs[i].updateInputs()
	// }
};


LabNodes.Attr.Base.prototype.onDisconnect = function( inputName ){
	//overwrite this
}

LabNodes.Attr.Base.prototype.disconnectInput = function( inputName ){
	this.onDisconnect()
	this.inputs[inputName] = undefined;
}

LabNodes.Attr.Base.prototype.connectInput = function( input, inputName, attrType, useCurve ) {

	if( attrType || this.getType() == input.getType() ){

		var upstream = false, thisAttr = this;

		var compareToUpstream = function( attr )
		{
			if( !upstream && thisAttr.name == attr.name){
				console.log(thisAttr.name, " == ", attr.name, "can't connect. the object attr must not be downstream from itself.\n" );
				upstream = true;
			}
		}

		input.traverseInputs( compareToUpstream );

		if( !upstream ){
			this.onConnect( input );
			this.inputs[ inputName || "value" ] = input;

			// if(input.parentNode != undefined)	input.parentNode.update();
			if(this.parentNode != undefined)	this.parentNode.update();

			//create the svg curve to show linkage
			if(useCurve){
				if(this.allowMultipleInputs){
					//are we already connected?
					var alreadyConnected = false;
					for(var i in this.curves){
						if(this.curves[i].inputDiv == this.div && this.curves[i].outputDiv == input.div){
							alreadyConnected = true;
						}
					}

					//if not, then lets add a curve to this.curves.
					if(!alreadyConnected){
						var curve = new LabNodes.Curve({
							inputDiv: this.div,
							outputDiv: input.div
						});

						this.curves[ curve.name ] = curve;
						input.curves[ curve.name ] = curve;	
					}else{
						console.log( "already connected, no connection made." );
					}
				}
				//if a curve doesn't exist make one
				else if(this.curve == undefined){
					this.curve = new LabNodes.Curve({
						inputDiv: this.div,
						outputDiv: input.div
					});
			
					//add a refence to the input's curves
					input.curves[ this.curve.name ] = this.curve;	
				}
				else{

					//remove curve refernce from the old input
					delete this.curve.outputDiv.labAttr.curves[this.curve.name];

					//point the curve to the new output
					this.curve.outputDiv = input.div;
					this.curve.update()

					//add a refence to the input's curves
					input.curves[ this.curve.name ] = this.curve;	
				}
			}
		}
	}
	else{
		console.log( "can't connect type " + input.getType() + " to a type " + this.getType() );
	}
};

LabNodes.Attr.Base.prototype.setupCSS = function(params) {
	params = params || {};
	this.div.style.backgroundColor = "rgba(100,100,110, .3)";
	this.div.style.padding = "2px";

	// this.div.style.position = "absolute";
	this.div.style.position = "relative";

	this.div.style.left = params.left || "0px";
	this.div.style.top = params.top || "0px";
	this.div.style.minWidth = "10px";
	this.div.style.minHeight = "9px";
	this.div.style.textAlign = "center";
	this.div.style.fontFamily = "sans-serif";
	this.div.style.fontSize = this.fontSize  || 7 + "px";
	this.div.style.textShadow = "0px 0px 2px #111";
};

LabNodes.Attr.Base.prototype.makeDraggable = function(params){
	params = params || {};

	var helper = (params.clone == false)? "original" : "clone";
	$(this.div).draggable({
		revert: true,
	    revertDuration: params.revertSpeed || 100,	//milliseconds
		helper: helper, 
		start: params.start || function( event, ui ){},
		drag: params.onDrag || function( event, ui ){
			this.style.backgroundColor = "rgba(0,250,250, .75)";
		},
		stop: params.onStop || function( event, ui ){this.style.backgroundColor = "rgba(100,100,110, .2)"},
	});
}


LabNodes.Attr.Base.prototype.makeDroppable = function(params){
	params = params || {};
	//this.div.labAttr
	var onDrop = params.onDrop || function( event, ui ){
		//revert it to it's normal color
		this.div.style.backgroundColor = "rgba(100,100,110, .2)";

		var output = ui.draggable[0].labAttr;
		if(output.isOutput){
			this.connectInput( output, undefined, undefined, true );	
		}

	}.bind( this );

	//jquery ui. we want the outputs to be draggable on to droppable inputs
	$(this.div).droppable({
		drop: onDrop,
		over: params.onOver || function( event, ui ){
			this.style.backgroundColor = "rgba(0,250,250, .75)";
		},
		out: params.onOut || function( event, ui ){
			//revert it to it's normal color
			this.style.backgroundColor = "rgba(100,100,110, .2)";
		}
	});
}




/**
 * passes an input value to an output value
 * @param {object} params see LabNodes.Attr.Base
 */
LabNodes.Attr.Number = function( params ){
	params = params || {};
	LabNodes.Attr.Base.call( this, params );
}

LabNodes.Attr.Number.prototype = Object.create( LabNodes.Attr.Base.prototype );

LabNodes.Attr.Number.prototype.update = function(){
	if(this.inputs && this.inputs["value"]){
		this._value = this.inputs["value"].value.value;
	}
}
LabNodes.Attr.Number.prototype.getType = function(){
	return "number";
}
	
/**
 * converts an x,y and z number inputs into a THREE.Vector3
 * @param {object} params see LabNodes.Attr.Base
 */
LabNodes.Attr.Vec3 = function( params ){
	params = params || {};

	LabNodes.Attr.Base.call( this, params );

	this._value = new THREE.Vector3( params.x || 0, params.y || 0, params.z || 0 )


	//this.inputs["x"] should be a number attribute.
	//this.inputs["y"] should be a number attribute.
	//this.inputs["z"] should be a number attribute.
	//
	//to add an attribute use this:
	//
	// v3.connectInput( inX, "x", "number" );
}

LabNodes.Attr.Vec3.prototype = Object.create( LabNodes.Attr.Base.prototype );

LabNodes.Attr.Vec3.prototype.update = function() {

	if(this.inputs["x"] != undefined){
		this._value.x = this.inputs["x"].value.value;
	}
	if(this.inputs["y"] != undefined){
		this._value.y = this.inputs["y"].value.value;
	}
	if(this.inputs["z"] != undefined){
		this._value.z = this.inputs["z"].value.value;
	}
};

LabNodes.Attr.Vec3.prototype.getType = function(){
	return "vec3";
}





/**
 * passes an input value to an output value
 * @param {object} params see LabNodes.Attr.Base
 */
LabNodes.Attr.Audio = function( params ){
	params = params || {};
	params.allowMultipleInputs = true;
	LabNodes.Attr.Base.call( this, params );

	this.allowMultipleInputs = true;
}

LabNodes.Attr.Audio.prototype = Object.create( LabNodes.Attr.Base.prototype );

LabNodes.Attr.Audio.prototype.update = function(){
	if(this.inputs && this.inputs["value"]){
		this._value = this.inputs["value"].value.value;
	}
}
LabNodes.Attr.Audio.prototype.getType = function(){
	return "audioAttr";
}
	



