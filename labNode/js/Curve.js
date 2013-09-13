/**
 * Curve.js
 */

var LabNodes = LabNodes || {};



Object.defineProperty( LabNodes, "svg", {
    get: function() {
		if(this._svg == undefined){
			//create our svg if it doesn't exist
			LabNodes._svg = document.createElementNS ("http://www.w3.org/2000/svg", "svg");
			LabNodes._svg.style.position = "absolute";
			LabNodes._svg.style.left = "0px";
			LabNodes._svg.style.top = "0px";
			LabNodes._svg.style.width = "100%";
			LabNodes._svg.style.height = "100%";
			LabNodes._svg.style.pointerEvents = "none";

			var container = document.getElementById( "container");
			container.appendChild( LabNodes._svg );
		}
    	return LabNodes._svg
    }
});
/**
 * [Connection between nodes drawn as a svg curve]
 * @param {object} params {
 *   @attribute input: an input div
 *   @attribute output: an output div
 *   @attribute color: string "rgba(45,45,45,.5);"
 * }
 */
LabNodes.Curve = function( params ){
	params = params || {};

	var cvec = new THREE.Vector3( Math.random()*.25+.75, Math.random()*.25+.75, Math.random()*.25+.75 ).multiplyScalar( 255 );
	this.color = params.color || "rgba("+parseInt(cvec.x)+","+parseInt(cvec.y)+","+parseInt(cvec.z)+",.5);";
	this.inputDiv = params.inputDiv || undefined;
	this.outputDiv = params.outputDiv || undefined;

	this.name = this.cleanName = params.name || "curve";
	this.getUniqueName();

	this.path = undefined;

	this.makeCurve( $(this.inputDiv).offset(), $(this.outputDiv).offset() );
}


LabNodes.Curve.prototype.setPathStyle = function() {
	this.path.setAttribute('style', "stroke:"+ this.color +" stroke-width: 3.5; pointer-events: auto; fill: none");
};

/**
 * creates a svg curve and adds it to our curve container	
 */

LabNodes.Curve.prototype.makeCurve = function(){
	if(this.inputDiv && this.outputDiv){

		//dom svg element create
		this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		this.setPathStyle();

		$(this.path).click( function( event ){
			// do we want to use this to kill connections?
			console.log( "curve clicked:", event );
		})


		var mouseOver = function(){
			this.path.setAttribute('style', "stroke:"+ "rgba(255,0,0,.5);" +" stroke-width: 7.; pointer-events: auto; fill: none");
		}.bind( this );

		var mouseLeave = function(){
			this.path.setAttribute('style', "stroke:"+ this.color +" stroke-width: 3.5; pointer-events: auto; fill: none");
		}.bind( this );

		$(this.path).mouseover(  mouseOver );

		$(this.path).mouseleave( mouseLeave );
		
		// $(this.path).on

		//set the control vertices positions
		this.update();

		LabNodes.svg.appendChild( this.path );
	}
}

/**
 * finds the position of the in/out divs and adjust the svg curve
 */

LabNodes.Curve.prototype.update = function(){
	if(this.inputDiv && this.outputDiv){
		//get the div positions using offset
		var p0 = $(this.inputDiv).offset();
		var p1 = $(this.outputDiv).offset();

		//reposition endpoints and control vertices
		p0.top += $(this.inputDiv).height() * .5;
		p1.top += $(this.outputDiv).height() * .5;
		p1.left += $(this.inputDiv).width();
		var p0x = p0.left - 50;
		var p1x = p1.left + 50;

		//set the svg info for the path
		this.path.setAttribute('d', "M "+p0.left+","+p0.top+" C "+p0x+","+p0.top+" "+p1x+","+p1.top+", "+p1.left+","+p1.top );
	}
}


LabNodes.Curve.prototype.getUniqueName = function() {
	
	if(LabNodes.curves == undefined)	LabNodes.curves = {}

	var nameCount=0;
	while (LabNodes.curves[ this.name ] != undefined ){
		this.name = this.cleanName + '_' + nameCount;
		nameCount++;
	}
	LabNodes.curves[ this.name ] = this;
};