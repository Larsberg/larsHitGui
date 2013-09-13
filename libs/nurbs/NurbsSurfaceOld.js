/**
 * NurbsSurface.js
 */


THREE = THREE || {};

THREE.NurbsSurface = function( params ){
	params = params || {};
	THREE.Geometry.call( this );

	/**
	 * control vertices 
	 * @type {array}	2d array of THREE.Vector3()... [v][u]  <--- we might need to swap these...
	 */
	this.cv = params.controlVertices;

	this.degree = params.degree || 2;
	this.closedU = params.closedU || true;
	this.closedV = params.closedV || false;
	this.empty = params.empty || false;//TODO:: rename this

	this.knotsU = [];
	this.knotsV = [];

	this.threshold = .0001;

	this.subd = params.subd || 5;

	this.setup( this.cv, this.degree );
}

THREE.NurbsSurface.prototype = Object.create( THREE.Geometry.prototype );//new THREE.Geometry();


THREE.NurbsSurface.prototype.setup = function( cv, degree ) {
	this.degree = THREE.Math.clamp( degree || this.degree, 1, 6);//above six can get a little heavy
	this.order = this.degree + 1;

	console.log( "degree: ", this.degree, "order: ", this.order)

	this.setKnots();
	this.setupGeometry();
};

THREE.NurbsSurface.prototype.setKnots = function() {


	if(this.closedV){
		for(var i=0; i<this.degree; i++){
			var tempArray = [];
			for (var j = 0; j < this.cv[i].length; j++) {
				tempArray.push( this.cv[i][j] );
			};
			this.cv.push( tempArray );
		}
	}

	if(this.closedU){
		for (var i=0; i<this.cv.length; i++) {
			for (var j=0; j<this.degree; j++) {
				this.cv[i].push( this.cv[i][j] );
			};
		};
	}


	this.knotsU = this.getKnots( this.cv[0].length, this.degree, this.closedU );
	this.knotsV = this.getKnots( this.cv.length, this.degree, this.closedV );
};

THREE.NurbsSurface.prototype.getKnots = function( cvCount, d, closed ){
	var knots = [];
	var numKnots = cvCount + this.order;

	for(var i=0; i<numKnots; i++){	
		if(closed){	
			knots[i] = THREE.Math.mapLinear(i-d, 0, cvCount-d,  0, 1);
		}else{
			knots[i] = THREE.Math.clamp(THREE.Math.mapLinear(i-d, 0, cvCount-d,  0, 1), 0, 1); 
		}
	}
	return knots;
}

THREE.NurbsSurface.prototype.setupGeometry = function( subd ) {
	this.subd = subd || this.subd;

	var numVerticesU = this.subd * this.cv[0].length;
	var uStep = 1 / (numVerticesU-1);

	var numVerticesV = this.subd * this.cv.length;
	var vStep = 1 / (numVerticesV-1);

	//create vertices
	var surfaceIndices = [];
	for (var i = 0; i < numVerticesV; i++) {
		surfaceIndices[i] = [];
		for (var j = 0; j < numVerticesU; j++) {
			surfaceIndices[i][j] = this.vertices.length;
			this.vertices.push( this.pointOnSurface( i * uStep, j * vStep ) );	
		};
	};

	//create faces
	var f;
	for (var i = 0; i < numVerticesV-1; i++) {
		for (var j = 0; j < numVerticesU-1; j++) {
			f = new THREE.Face4( surfaceIndices[i][j], surfaceIndices[i+1][j], surfaceIndices[i+1][j+1], surfaceIndices[i][j+1] );
			this.faces.push( f );
		};
	};

	//compute normals
	this.computeFaceNormals();
	this.computeVertexNormals();
};


THREE.NurbsSurface.prototype.pointOnSurface = function( u, v ) {

	u = THREE.Math.clamp( u, 0.0001, .9999 );
	v = THREE.Math.clamp( v, 0.0001, .9999 );

	// var basisv, basisu, val;
	// var pt_uv = new THREE.Vector3();
	// for (var i = 0; i < this.cv.length; i++) {
	// 	for (var j = 0; j < this.cv[0].length; j++) {
	// 		basisv = this.CoxDeBoor( v, i, this.knotsV, this.order );
	// 		basisu = this.CoxDeBoor( u, j, this.knotsU, this.order );

	// 		pt_uv.add( this.cv[i][j].clone().multiplyScalar( basisu * basisv) );
	// 	}
	// }
	// return pt_uv;

	var tempCV = [];
	for (var i = 0; i < this.cv.length; i++) {
		tempCV[i] = this.pointOnCurve( u, this.cv[i], this.knotsU, this.order );
	};
	var pOnS = this.pointOnCurve( v, tempCV, this.knotsV, this.order );
	pOnS.y += u * 5;

	return pOnS;

};

THREE.NurbsSurface.prototype.pointOnCurve = function( u, cv, knots, order ) {
	var pOnC = new THREE.Vector3();

	u = THREE.Math.clamp( u, 0.000001, .999999 );

	var val;
	for (var i = 0; i < cv.length; i++) {
		val = this.CoxDeBoor( u, i, knots, order );		
		pOnC.add( cv[i].clone().multiplyScalar( val ) );
	};

	return pOnC;
};


/**
 * CoxDeBoor algorithm from all over the web. recursively find our weights -> http://en.wikipedia.org/wiki/De_Boor's_algorithm 
 * @param {var} u     
 * @param {int} k     
 * @param {int} order this diminishes recursively
 */
THREE.NurbsSurface.prototype.CoxDeBoor = function( u, k, knots, order ) {
	// console.log( "surface" );

	if(order == 1){
		if( knots[k] < u && u <= knots[k+1] )return 1;
		return 0;
	}
	
	var Den1 = knots[k+order-1] - knots[k];
	var Den2 = knots[k+order] - knots[k+1];
	var Eq1=0,Eq2=0;
	
	if(Den1>0) {
		Eq1 = ((u-knots[k])/Den1) * this.CoxDeBoor(u,k,knots,order-1);
	}
	if(Den2>0) {
		Eq2 = ( knots[ k+order ] - u ) / Den2 * this.CoxDeBoor( u, k+1,knots, order-1); 
	}

	return Eq1+Eq2;
};
