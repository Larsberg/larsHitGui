/**
 * NurbsSurface.js
 */


THREE = THREE || {};
THREE.Nurbs = THREE.Nurbs || {};

THREE.Nurbs.Surface = function( params ){
	params = params || {};
	THREE.Geometry.call( this );

	this.cv = params.controlVertices || params.cv;

	this.degree = Math.min( 5, params.degree ) || 2;
	this.degreeU = params.degreeU || this.degree;
	this.degreeV = params.degreeV || this.degree;

	this.closedU = params.closedU || false;
	this.closedV = params.closedV || false;
	this.empty = params.empty || false;

	this.knotsU = [];
	this.knotsV = [];

	this.uHull = undefined;

	this.threshold = .0001;

	this.subd = params.subd || 5;
	this.subdU = params.subdU || this.subd;
	this.subdV = params.subdV || this.subd;

	this.vCurves = [];
	this.setVCurves();
	this.setupGeometry();
}

THREE.Nurbs.Surface.prototype = Object.create( THREE.Geometry.prototype );

THREE.Nurbs.Surface.prototype.setVCurves = function(){

	for (var i = 0; i < this.cv.length; i++) {
		this.vCurves[i] = new THREE.Nurbs.Curve({
			cv: this.cv[i],
			closed: this.closedU,
			degree: this.degree,
			empty: true,
		})
	};
	
	this.uHull = this.getUHull( 0.5, true );
}

THREE.Nurbs.Surface.prototype.setUHull = function( u ){
	this.uHull.cv = [];
	for (var i = 0; i < this.vCurves.length; i++) {
		this.uHull.cv[i] = this.vCurves[i].pointOnCurve( u );
	};

	if(this.closedV){
		this.uHull.closeCurve();
	}
}

THREE.Nurbs.Surface.prototype.getUHull = function( u, empty ){
	var uCVs = [];
	for (var i = 0; i < this.vCurves.length; i++) {
		uCVs[i] = this.vCurves[i].pointOnCurve( u );
	};

	return new THREE.Nurbs.Curve({
			cv: uCVs,
			degree: this.degree,
			closed: this.closedV,
			empty: empty || true,
		})
}

THREE.Nurbs.Surface.prototype.pointOnSurface = function( u, v ){
	this.setUHull( u );
	return this.uHull.pointOnCurve( v );
}

THREE.Nurbs.Surface.prototype.update = function(){

	var uVal = 0, uv;
	this.setUHull( uVal );
	for (var i = this.vertices.length - 1; i >= 0; i--) {
		uv = this.uvs[i];
		if(uv.x !== uVal){
			uVal = uv.x;
			this.setUHull( uVal );
		}

		this.vertices[i] = this.uHull.pointOnCurve( uv.y );
	};
}

THREE.Nurbs.Surface.prototype.setupGeometry = function(){

	var numU = this.vCurves[0].cv.length * this.subdU;
	var numV = this.vCurves.length * this.subdV;
	var stepU = 1/(numU-1);
	var stepV = 1/(numV-1);


	var surfaceIndices = [];
	this.uvs = [];
	for(var i=0; i<numU; i++){
		surfaceIndices[i] = [];
		this.setUHull( i*stepU );
		for (var j = 0; j < numV; j++) {
			//get index
			surfaceIndices[i][j] = this.vertices.length;

			//create vertex
			this.vertices.push( this.uHull.pointOnCurve( j*stepV ) );

			//creat uv
			this.uvs.push( new THREE.Vector2( i*stepU, j*stepV ));
		};
	}

	//create faces
	var f;
	for (var i = 0; i < numU-1; i++) {
		for (var j = 0; j < numV-1; j++) {
			f = new THREE.Face4(
			 surfaceIndices[i][j],
			 surfaceIndices[i+1][j],
			 surfaceIndices[i+1][j+1], 
			 surfaceIndices[i][j+1] );
			
			this.faces.push( f );

			this.faceVertexUvs[ 0 ].push( [
				this.uvs[ f.a ],
				this.uvs[ f.b ],
				this.uvs[ f.c ],
				this.uvs[ f.d ]
			]);
			
		};
	};

	//compute normals
	this.computeFaceNormals();
	this.computeVertexNormals();
}



