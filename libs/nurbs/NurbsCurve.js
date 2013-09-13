/**
 * NurbsCurve.js
 *
 * written by lars berg
 *
 * a simple implementation of the cox de boor algorithm
 */

THREE = THREE || {};
THREE.Nurbs = THREE.Nurbs || {};

THREE.Nurbs.Curve = function( params ){
	params = params || {};
	THREE.Geometry.call( this );

	this.cv = params.controlVertices || params.cv;
	this.degree = params.degree || 2;
	this.closed = params.closed || false;
	this.empty = params.empty || false;//TODO:: rename this

	this.knots = [];

	this.subd = params.subd || 5;

	this.setup( this.cv, this.degree );
}

THREE.Nurbs.Curve.prototype = Object.create( THREE.Geometry.prototype );//new THREE.Geometry();


THREE.Nurbs.Curve.prototype.setKnots = function() {

	if(this.closed){
		this.closeCurve();
	}

	this.knots = [];
	var numKnots = this.cv.length + this.order;


	for(var i=0; i<numKnots; i++){	
		if(this.closed)	this.knots[i] = THREE.Math.mapLinear(i-this.degree, 0, this.cv.length-this.degree,  0, 1); 
		else	this.knots[i] = THREE.Math.clamp( THREE.Math.mapLinear(i-this.degree, 0, this.cv.length-this.degree,  0, 1), 0, 1); 
	}
};

THREE.Nurbs.Curve.prototype.closeCurve = function(){
	for (var i = 0; i <this.degree-1; i++) {
		this.cv.push( this.cv[i] );
	};
	this.cv.splice( 0, 0,  this.cv[ this.cv.length - this.degree] );
}


THREE.Nurbs.Curve.prototype.setup = function( cvs, degree ) {
	this.degree = THREE.Math.clamp( degree || this.degree, 1, 6);//above six can get a little heavy
	this.order = degree + 1;
	this.setKnots();
	if(!this.empty)	this.setupGeometry();
};

/**
 * CoxDeBoor algorithm from all over the web. recursively find our weights -> http://en.wikipedia.org/wiki/De_Boor's_algorithm 
 * @param {float} u     
 * @param {int} k     
 * @param {int} order this diminishes recursively
 */
THREE.Nurbs.Curve.prototype.CoxDeBoor = function( u, k, order ) {
	// console.log( "curve" );

	if(order == 1){
		if( this.knots[k] <= u && u < this.knots[k+1] )return 1;
		return 0;
	}
	
	var Den1 = this.knots[k+order-1] - this.knots[k];
	var Den2 = this.knots[k+order] - this.knots[k+1];
	var Eq1=0,Eq2=0;
	
	if(Den1>0) {
		Eq1 = ((u-this.knots[k])/Den1) * this.CoxDeBoor(u,k,order-1);
	}
	if(Den2>0) {
		Eq2 = ( this.knots[ Math.min( k+order, this.knots.length-1) ] - u ) / Den2 * this.CoxDeBoor( u, k+1, order-1); 
	}

	return Eq1+Eq2;
};



THREE.Nurbs.Curve.prototype.pointOnCurve = function( u ) {
	var pOnC = new THREE.Vector3();

	u = THREE.Math.clamp( u, 0.00001, .99999 );

	var val;
	for (var i = 0; i < this.cv.length; i++) {
		val = this.CoxDeBoor( u, i, this.order );		
		pOnC.add( this.cv[i].clone().multiplyScalar( val ) );
	};

	return pOnC;
};

THREE.Nurbs.Curve.prototype.setupGeometry = function( subd ) {
	this.subd = subd || this.subd;
	var numVertices = this.subd * this.cv.length;
	var uStep = 1 / (numVertices-1);

	for (var i = 0; i < numVertices; i++) {
		this.vertices.push( this.pointOnCurve( i * uStep ) );
	};
};