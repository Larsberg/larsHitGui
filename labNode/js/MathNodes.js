/**
 * MathNodes.js
 */

LabNodes = LabNodes || {};
LabNodes.MathNodes = LabNodes.MathNodes || {};

LabNodes.MathNodes.Mult = function( params ){
	params = params || {};

	params.useTitles = false;
	params.spaceWidth = "0px";
	params.useTitle = true;
	params.name = "mult";

	LabNodes.Nodes.Base.call( this, params );

	this.scalar = params.value == undefined ? 1 : params.value;
	this.in = new LabNodes.Attr.Number({name: '•', value: 0 });
	this.out = new LabNodes.Attr.Number({name: '•', value: 0 });
	this.previousTextFieldValue = this.scalar;

	this.out.update = function(){
		// this.out._value = this.in.value.value * 2.;
		this.out._value = this.in.value.value * this.scalar;
	}.bind( this );

	this.addInputAttr( this.in );
	this.addOutputAttr( this.out );


	this.textField = document.createElement( "input" );
	this.textField.labAttr = this;

	this.textField.setAttribute( "value", this.previousTextFieldValue );
	this.textField.style.left = "0px";
	this.textField.style.top = "0px";
	this.textField.style.width = "20px";

	var updateFieldWidth = function(){
		$(this.textField).width( Math.max(20, this.textField.value.length * this.in.fontSize) );
	}.bind( this );

	var updateField = function( val ){
		
		// val = val || this.in.value.value;

		// //if we have an input it's not keyable
		// if(this.in.inputs["value"] != undefined){
		// 	this.textField.value = this.in.inputs["value"].value.value;
		// }

		// //otherwise we can pass on the to our output
		// else{
			if(this.textField.value == ".")	this.textField.value = "0.";
			var isNumber = !isNaN( this.textField.value );
			if( isNumber ){

				this.scalar = val;
				this.previousTexFieldValue = this.scalar;
				console.log( this.scalar );
			}
			else{
				this.textField.value = this.previousTexFieldValue;
			}
		// }

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
	
	LabNodes.addToAutoupdate( this.out );
}

LabNodes.MathNodes.Mult.prototype = Object.create( LabNodes.Nodes.Base.prototype );

LabNodes.MathNodes.Mult.prototype.getType = function() {
	return "intNode";
};