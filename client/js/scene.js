var scene = {};

scene.init = function () {

    //Renderer
    this.canvas = document.getElementById("scenecanvas");
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: this.canvas
    });
    this.renderer.setClearColor(0xffffff, 1.0);
    this.renderer.setSize(this.canvas.width, this.canvas.height);

    //SCENE

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(30, this.canvas.width / this.canvas.height, 10, 1000);
    this.camera.position.z = 80;

    //LIGHTS

    this.directionalLight = new THREE.DirectionalLight( 0xffeedd, 1.5 );
    this.directionalLight.position.set( 1, 0.5, 1 );
    this.scene.add( this.directionalLight );

    this.directionalLight2 = new THREE.DirectionalLight( 0xddddff, 0.5 );
    this.directionalLight2.position.set( -1, 0.5, -1 );
    this.scene.add( this.directionalLight2 );

    //LOAD MESH

    this.loader = new THREE.JSONLoader();
    this.texLoader = new THREE.TextureLoader;
    this.eventCounter = 0;
    
    this.loader.load( "model/russel.json.js", function(geo, mats) {
        this.mesh = new THREE.Mesh( geo, new THREE.MultiMaterial( mats ) );
    
        this.container = new THREE.Object3D();
        this.scene.add(this.container);
        this.mesh.position.y = -250;
        this.mesh.scale.set(150, 150, 150);
        this.container.add(this.mesh);
        this.container.position.y = -15;
        this.container.rotation.x = 1.5;

        //Remove eyemoisture layer
        this.mesh.material.materials[11].opacity = 0;
        this.mesh.material.materials[11].transparent = true;

        //Set eyelashes transparency
        //NOTE: Modify the supplied texture in photoshop. Add png material by hand in json file
        this.mesh.material.materials[0].transparent = true; 

        this.canvas.dispatchEvent( new Event('meshReady'));          
    }.bind(this));

    //CONTROLS
 
    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 0.4;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = false;
    this.controls.minDistance = 50;
    this.controls.maxDistance = 400;
    this.controls.dynamicDampingFactor = 0.2;

    //EVENT HANDLERS

    this.canvas.addEventListener('meshReady', this.loadFaceTextures.bind(this) );
    this.canvas.addEventListener('faceTexLoaded', this.replaceFaceMaterial.bind(this) );
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    //ANIMATE

    this.animate();
}

//LOAD TEXTURES
scene.loadFaceTextures = function() {
    var texUrls = { 
        bumpMap: 'model/ryrussell_faceb_1001.jpg', 
        map: 'model/ryrussell_face_1001.jpg', 
        normalMap: 'model/Michael7_Face_NM_1001.jpg'
    };
    this.faceTextures = {};
    for (var key in texUrls) {
        this.texLoader.load(texUrls[key], function(tex) {
            this.faceTextures[key] = tex;
            this.canvas.dispatchEvent( new Event('faceTexLoaded'));
        }.bind(this));
    }
}

//Convert the face material to phong
//Add bump map to face
scene.replaceFaceMaterial = function() {
    if (this.faceTextures.length < 3)
        return;
    this.mesh.material.materials[3] = new THREE.MeshPhongMaterial({ 
        bumpMap: this.faceTextures.bumpMap,
        map: this.faceTextures.map,
        normalMap: this.faceTextures.normalMap,
        name: "Face",
        shininess: 0
    });
}

scene.onWindowResize = function() {
    this.camera.aspect = this.canvas.width / this.canvas.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.width, this.canvas.height);
}

scene.animate = function() {
    requestAnimationFrame(this.animate.bind(this));

    this.controls.update();


    this.renderer.render(this.scene, this.camera);
}