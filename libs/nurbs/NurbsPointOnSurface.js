/**
 * NurbsPointOnSurface.js
 */

var THREE = THREE || {};

THREE.Nurbs = THREE.Nurbs || {};

THREE.Nurbs.PointOnSurface = function( params ){
	params = params || {};

	this.surface = params.surface;

	this.uv = params.uv || new THREE.Vector2();

	this.position 	= 	new THREE.Vector3();

	this.normal 	= 	undefined;	//new THREE.Vector3();
	this.binormal 	= 	undefined;	//new THREE.Vector3();
	this.tangent 	= 	undefined;	//new THREE.Vector3();
}

THREE.Nurbs.PointOnSurface.prototype.update = function( uv, surface ){
	this.uv = uv || this.uv;
	this.surface = surface || this.surface;

	if( this.surface !== undefined ){

		//wrap this uv
		if(this.uv.x>1 || this.uv.x<0){
			this.uv.x -= Math.floor( this.uv.x );
		}
		
		if(this.uv.y>1 || this.uv.y<0){
			this.uv.y -= Math.floor( this.uv.y );
		}
			
		this.position.copy( this.surface.pointOnSurface( this.uv.x, this.uv.y ) );
		// console.log( this.position.x, this.position.y, this.position.z )
	}

}
