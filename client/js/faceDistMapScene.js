faceDistMapScene = {};

faceDistMapScene.init = function() {
    // SCENE

    this.scene = new THREE.Scene();

    this.camera = new THREE.Camera();
	this.camera.position.z = 1;

	// TEXTURE

    this.texLoader = new THREE.TextureLoader;
    this.texLoader.load('img/tex/rgbNoise.png', function(tex) {
    	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    	tex.repeat.set( 2, 2 );
        THREE.mpegGlitchShader.uniforms.iChannel1.value = tex;
    });

    //MATERIAL

	this.material = new THREE.ShaderMaterial( THREE.mpegGlitchShader );

	THREE.mpegGlitchShader.uniforms.iResolution.value.x = 512;
	THREE.mpegGlitchShader.uniforms.iResolution.value.y = 512;


	//PLANE

	var geo = new THREE.PlaneGeometry(2,2);
	var plane = new THREE.Mesh( geo, this.material )
	this.scene.add(plane);


	// FRAMEBUFFER

	this.renderTargetParams = {
	      minFilter:THREE.LinearFilter,
	      stencilBuffer: false,
	      depthBuffer:false,
	      wrapS: THREE.RepeatWrapping,
	      wrapT: THREE.RepeatWrapping	      
	    };
	this.rendertarget = new THREE.WebGLRenderTarget( 512, 512, this.renderTargetParams );

	this.clock = new THREE.Clock();
}

faceDistMapScene.animate = function() {
	THREE.mpegGlitchShader.uniforms.iGlobalTime.value = Math.floor(this.clock.getElapsedTime()*10); // Math.floor(this.clock.getElapsedTime())*1.4622 + .24589425098;
}
