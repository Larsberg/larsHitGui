var app;



$(window).bind("load", function() {
	var debug = getQuerystring('debug') == "true";
	var useStats = getQuerystring('useStats') == "true";
	app = new APP( 'container', useStats, debug );
});


function APP( _containerName, _useStats, _debug) {

	var container = document.getElementById( _containerName );
	var gui;

	var debug = _debug || false;
	var useStats = _useStats || false;

	//basic stuff
	var camera, light, projector;
	var clock = new THREE.Clock();
	var scene = new THREE.Scene();
	var group = new THREE.Object3D();

	//gui
	var gui = new dat.GUI();

	//selection stuff
	var selected = undefined;

	/**
	 * [setup description]
	 * @return {none} 
	 */
	
	 var nextTestTime = 0;
	 var input, output;

	function setup() {

		//three setup
		camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
		camera.position.z = 500;
		// camera = new THREE.OrthographicCamera( 0, window.innerWidth, 0, window.innerHeight, -1000, 1000 );

		projector = new THREE.Projector();

		light = new THREE.PointLight();
		light.position = camera.position;

		scene = new THREE.Scene();
		scene.add( camera );
		scene.add( light );
		scene.add( group );	

		var cube = new THREE.Mesh( new THREE.CubeGeometry( 100, 100, 100 ), new THREE.MeshBasicMaterial( {wireframe: true, wireframeLinewidth: 4} ));
		group.add( cube );

		//NODES
		var node = new LabNodes.Nodes.Vec3({name: "vec3"});
		container.appendChild( node.div );

		var node0 = new LabNodes.Nodes.Vec3({name: "vec3", left: "300px"});
		container.appendChild( node0.div );

		node0.connectInput( 'x', node, 'y');

		// LabNodes.Attr.Base.prototype.connectInput = function( input, inputName, attrType, useCurve )
		// node0.getInput( 'x' ).connectInput( node.getOutput( 'y' ), undefined, undefined, true );
		// node.inputs['x'].connectInput( node0.outputs['y'], undefined, undefined, true );

		var numField = new LabNodes.Nodes.NumberField({
			top: "320px",
			left: "30px",
			name: "numField",
			value: 40
		});

		container.appendChild( numField.div );

		var numField_0 = new LabNodes.Nodes.NumberField({
			top: "375px",
			left: "30px",
			name: "numField",
			value: 140
		});

		container.appendChild( numField_0.div );

		var numField_1 = new LabNodes.Nodes.NumberField({
			top: "300px",
			left: "230px",
			name: "numField"
		});

		container.appendChild( numField_1.div );


		var intNode_0 = new LabNodes.Nodes.Int({
			top: "250px",
			left: "230px"
		});

		container.appendChild( intNode_0.div );

		var slider_0 = new LabNodes.Nodes.Slider({
			top: "345px",
			left: "150px"
		});
		container.appendChild( slider_0.div );

		var multNode = new LabNodes.MathNodes.Mult({
			top: "300px",
			left: "370px",
			value: 2
		})
		container.appendChild( multNode.div );


		var gainNode = new LabNodes.AudioNodes.Gain({
			left: "500px",
			top: "50px",
			name: "left",
			volume: .1
		});
		container.appendChild( gainNode.div );

		var gainNode_0 = new LabNodes.AudioNodes.Gain({
			left: "500px",
			top: "180px",
			name: "right",
			volume: .1,
		});
		container.appendChild( gainNode_0.div );

	

		var oscNode = new LabNodes.AudioNodes.Oscillator({
			left: "400px",
			top: "130px",
			name: "osc"
		});
		container.appendChild( oscNode.div );	


		var oscNode_0 = new LabNodes.AudioNodes.Oscillator({
			left: "400px",
			top: "200px",
			name: "osc"
		});
		container.appendChild( oscNode_0.div );	


		var destinationNode = new LabNodes.AudioNodes.Destination({
			left: "600px",
			top: "100px",
			name: "destination",
			volume: 0
		});
		container.appendChild( destinationNode.div );
		
		// make some connections between our nodes


		slider_0.connectInput( 'min', numField, '•' );
		slider_0.connectInput( 'max', numField_0, '•' );

		oscNode.connectInput( 'freq', slider_0, '•' );
		gainNode.connectInput( '•', oscNode, '•');
		destinationNode.connectInput('left', gainNode, '•' );

		multNode.connectInput( '•', slider_0, '•' );
		oscNode_0.connectInput( 'freq', multNode, '•' );
		gainNode_0.connectInput( '•', oscNode_0, '•' );
		destinationNode.connectInput('right', gainNode_0, '•' );


		//map our node network
		var output = {};
		for(var i in LabNodes.nodes)
		{
			var n = LabNodes.nodes[i];
			var p = $(n.div);
			var position = p.position();
			var inputAttr = {};

			for(var j in n.inputs)
			{
				var attr = n.inputs[j];
				inputAttr[attr.name] = {
					name: attr.name,
					cleanName: attr.cleanName,
					parentNode: attr.parentNode.name,
					left: $(attr.div).position().left,
					top: $(attr.div).position().top,
				}
			}

			output[n.name] = {
				type: n.getType(),
				left: position.left,
				top: position.top,
				inputs: inputAttr,
			}
		}

		const MIME_TYPE = 'application/json';
		window.URL = window.webkitURL || window.URL;

		var blob = new Blob([JSON.stringify(output)], {type: MIME_TYPE});

		var a = document.createElement('a');
		a.style.position = 'absolute';
		a.style.left = "750px";
		a.style.top = "10px";
		a.style.color = "white";

		a.download = "preset.json";
		a.href = window.URL.createObjectURL( blob );
		a.textContent = 'download preset';

		a.dataset.downloadurl = [MIME_TYPE, a.download, a.href].join(':');
		a.draggable = true; // Don't really need, but good practice.
		a.classList.add( 'dragout' );
		container.appendChild( a );
	}

	/**
	 * [update description]
	 * @return {[type]} [description]
	 */
	function update(){

		var delta = clock.getDelta();
		var elapsedTime = clock.getElapsedTime();
		TWEEN.update();
		// var camTarget = new THREE.Vector3(0,0,0);
		// camera.lookAt( camTarget );
		

	}

	/**
	 * DRAW
	 * @return {none} 
	 */
	function draw(){

		renderer.render( scene, camera, null, true );
	}

	function selectObject( intersectionInfo ){
		selected = intersectionInfo;
		selected.offest = intersectionInfo.point.clone().sub(intersectionInfo.object.position);

		if( selected.object.handleMouseDown != undefined ){
			selected.object.handleMouseDown( event );
		}
	}

	function deselect(){
		selected = undefined;
	}

	function moveSelected( event ){
		selected.object.position.x = event.clientX - selected.offest.x;
		selected.object.position.y = event.clientY - selected.offest.y;
	}



	function castRay( event, objectArray, _camera, callback ){
		objectArray = objectArray || scene.children;
		_camera = _camera || camera;
		callback = callback || function( intersectionInfo ){ console.log( intersectionInfo )};

		var x = ( (event.x || event.clientX) / window.innerWidth ) * 2 - 1;
		var y = - ( (event.y || event.clientY) / window.innerHeight ) * 2 + 1;

		var vector = new THREE.Vector3( x,y, 0.5 );
		projector.unprojectVector( vector, _camera );
		var raycaster = new THREE.Raycaster( _camera.position, vector.sub( _camera.position ).normalize() );
		var intersects = raycaster.intersectObjects( objectArray , true/*recurssive*/ );

		if(intersects.length > 0){
			callback( intersects[0] );
			return intersects[0];
		}

		return null;
	}

	function castRayOrtho( event, objectArray, orthoCam, callback ){
		objectArray = objectArray || scene.children;
		orthoCam = orthoCam || camera;
		callback = callback || function( intersectionInfo ){ console.log( intersectionInfo )};
		
		var raycaster = new THREE.Raycaster( new THREE.Vector3( event.clientX, event.clientY, orthoCam.near ), new THREE.Vector3( 0, 0, 1 ) );

		var intersects = raycaster.intersectObjects( objectArray , true/*recurssive*/ );

		if(intersects.length > 0){
			callback( intersects[0] );
			return intersects[0];
		}

		return null;
	}


	//-----------------------------------------------------------
	//scene setup and listeners
	//-----------------------------------------------------------
	var stats, renderer;
	var mouseDown = false, mouseDragged = false;
	var lastMouse = new THREE.Vector2(), mouse = new THREE.Vector2();

	function onWindowResize() {

		camera.right = window.innerWidth;
		camera.bottom = window.innerHeight;

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function onMouseMove( event , still ) {
		mouse.set( event.x, event.y );

		if(mouseDown){
			onMouseDragged( event );
		}

		lastMouse.set( mouse.x, mouse.y );
	}

	function onMouseUp( event ) {

		if(selected != undefined )	deselect();

		mouseDown = false;
	}

	function onMouseDown( event ) {
		event.preventDefault();
		mouseDown = true;

		//picking
		castRayOrtho( event, undefined, undefined, selectObject );
	}

	function onMouseDragged( event ) {

		group.rotation.x += (mouse.y - lastMouse.y) * .01;
		group.rotation.y += (mouse.x - lastMouse.x) * .01;

		if( selected != undefined ){
			moveSelected( event );
		}
	}


	function onKeyDown( event ){
		// console.log( event );
		switch( event.keyCode ){

			case 32:
				break;

			case 67:
				break;

			// case 77:
			// 	break;

			default:
				// console.log( event.keyCode );
				break;
		}
	}

	function rendererSetup()
	{
		container.style.position = 'absolute';
		container.style.left = '0px';
		container.style.top = '0px';

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor( 0x444447 );
		renderer.sortObjects = false;
		renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.autoClear = false;
		container.appendChild( renderer.domElement );
	}

	function events(){
		//events
		window.addEventListener( 'resize', onWindowResize, false );
		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mouseup', onMouseUp, false );
		document.addEventListener( 'mousedown', onMouseDown, false );
		document.addEventListener( "keydown", onKeyDown, false);

		mouseDown = false;
		mouseDragged = false;
	}

	function animate() {
		requestAnimationFrame( animate );
		update();
		draw();

		if(useStats){
			stats.update();
		}
	}

	if ( ! Detector.webgl ) {
		Detector.addGetWebGLMessage();
		document.getElementById( container ).innerHTML = "";
	}


	rendererSetup();
	if(useStats){	
		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '10px';
		stats.domElement.style.left = '10px';
		container.appendChild( stats.domElement );
	}	
	setup();
	events();
	animate();

}

function getQuerystring(key, default_){
	if (default_==null) default_=""; 
	key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
	var qs = regex.exec(window.location.href);
	if(qs == null)
		return default_;
	else
		return qs[1];
}