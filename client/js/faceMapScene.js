faceMapScene = {};

faceMapScene.init = function() {
    // SCENE

    this.scene = new THREE.Scene();

    this.camera = new THREE.Camera();
	this.camera.position.z = 1;

	// TEXTURE

    this.texLoader = new THREE.TextureLoader;
    this.texLoader.load('model/ryrussell_face_1001.jpg', function(tex) {
        THREE.alphaStripesShader.uniforms.iChannel0.value = tex;
    });

    //MATERIAL

	this.material = new THREE.ShaderMaterial( THREE.alphaStripesShader );
    this.material.transparent = true;

    THREE.alphaStripesShader.uniforms.frequency.value = 1;
    THREE.alphaStripesShader.uniforms.speed.value = 0.3;
    THREE.alphaStripesShader.uniforms.thickness.value = 0.7;
    THREE.alphaStripesShader.uniforms.tilt.value = 20;
	THREE.alphaStripesShader.uniforms.iResolution.value.x = 1024;
	THREE.alphaStripesShader.uniforms.iResolution.value.y = 1024;

	//PLANE

	var geo = new THREE.PlaneGeometry(2,2);
	var plane = new THREE.Mesh( geo, this.material )
	this.scene.add(plane);


	// FRAMEBUFFER

	this.renderTargetParams = {
		  format: THREE.RGBAFormat,
	      minFilter:THREE.LinearFilter,
	      stencilBuffer: false,
	      depthBuffer:false,
	      wrapS: THREE.RepeatWrapping,
	      wrapT: THREE.RepeatWrapping	      
	    };
	this.rendertarget = new THREE.WebGLRenderTarget( 1024, 1024, this.renderTargetParams );
}

faceMapScene.animate = function() {
	THREE.alphaStripesShader.uniforms.iGlobalTime.value += 0.05;
}
