texscene = {};

texscene.init = function() {
    // SCENE

    this.scene = new THREE.Scene();

    this.camera = new THREE.Camera(30, 1/1, 10, 1000);
	this.camera.position.z = 1;

	// TEXTURE

	this.texLoader = new THREE.TextureLoader;
	this.texLoader.load('img/tex/CGRright_109_normal.jpg', function(tex) {
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
	this.rendertarget = new THREE.WebGLRenderTarget( 1024, 512, this.renderTargetParams );

	//EVENT HANDLERS

    document.addEventListener('texLoaded', this.createTexturePlane.bind(this) );
}

texscene.createTexturePlane = function() {

	// MATERIAL & TEX

	this.texture.wrapS = THREE.RepeatWrapping;
	this.texture.wrapT = THREE.RepeatWrapping;

	material1 = new THREE.MeshBasicMaterial( { map: this.texture } );
	 
	  // MESH

	  var geo = new THREE.PlaneGeometry(2,2);
	  var plane = new THREE.Mesh( geo, material1 )
	  this.scene.add(plane);
}

texscene.animate = function() {
	if(this.texture)
		this.texture.offset.y += 0.001;
}
