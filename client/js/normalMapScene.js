normalMapScene = {};

normalMapScene.init = function() {
    // SCENE

    this.scene = new THREE.Scene();

    this.camera = new THREE.Camera();
	this.camera.position.z = 1;

	// TEXTURE

	this.texLoader = new THREE.TextureLoader;
	this.texLoader.load('img/tex/leatherStripes_normal.png', function(tex) {
		this.texture = tex;
		document.dispatchEvent( new Event('texLoaded'));
	}.bind(this));

	// FRAMEBUFFER

	this.renderTargetParams = {
	      minFilter:THREE.LinearFilter,
	      stencilBuffer: false,
	      depthBuffer:false,
	      wrapS: THREE.RepeatWrapping,
	      wrapT: THREE.RepeatWrapping	      
	    };
	this.rendertarget = new THREE.WebGLRenderTarget( 1024/2, 512/2, this.renderTargetParams );

	//EVENT HANDLERS

    document.addEventListener('texLoaded', this.createTexturePlane.bind(this) );
}

normalMapScene.createTexturePlane = function() {

	// MATERIAL & TEX

	this.texture.wrapS = THREE.RepeatWrapping;
	this.texture.wrapT = THREE.RepeatWrapping;

	material1 = new THREE.MeshBasicMaterial( { map: this.texture } );
	 
	  // MESH

	  var geo = new THREE.PlaneGeometry(2,2);
	  var plane = new THREE.Mesh( geo, material1 )
	  this.scene.add(plane);
}

normalMapScene.animate = function() {
	if(this.texture)
		this.texture.offset.y += 0.001;
}
