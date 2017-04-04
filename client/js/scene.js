// This version of the script allows you to record faceOSC data by pressing space. Ie. data about the movement of the face.
// Data will be saved in a data.json.js file

var scene = {};

scene.init = function () {
    this.faceTextures = {};

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

    this.directionalLight = new THREE.DirectionalLight( 0xffeedd, 0.7 );
    this.directionalLight.position.set( 1, 0.5, 1 );
    this.scene.add( this.directionalLight );

    this.directionalLight2 = new THREE.DirectionalLight( 0xddddff, 0.5 );
    this.directionalLight2.position.set( -1, 0.5, -1 );
    this.scene.add( this.directionalLight2 );

    this.directionalLight3 = new THREE.DirectionalLight( 0xeeeeff, 0.5 );
    this.directionalLight3.position.set( 0, 0.5, 1 );
    this.scene.add( this.directionalLight3 );

    //LOAD MESH

    this.loader = new THREE.JSONLoader();
    this.texLoader = new THREE.TextureLoader;
    
    this.loader.load( "model/russel.json.js", function(geo, mats) {
        this.mesh = new THREE.Mesh( geo, new THREE.MultiMaterial( mats ) );
    
        this.container = new THREE.Object3D();
        this.scene.add(this.container);
        this.mesh.position.y = -250;
        this.mesh.scale.set(150, 150, 150);
        this.container.add(this.mesh);
        this.container.position.y = -13;
        this.container.rotation.x = 1.3;

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
    this.canvas.addEventListener('faceMaterialReady', this.addMorphingToMaterial.bind(this) );
    window.addEventListener('resize', this.onWindowResize.bind(this), false);


    //READ FILE

    this.fs = require("fs");
    this.transformationData = [];
    this.dataReady = false;
    this.dataPointer = 0;

    this.fs.readFile('./data.json.js', function read(err, data) {
        if (err) {
            throw err;
        }
        this.transformationData = JSON.parse(data);
        this.dataReady = true;
    }.bind(this));

    //ANIMATE

    this.animate();
}

scene.applyMovementsFromFile = function() {
    if (!this.dataReady || this.mesh == undefined)
        return;
    var transformation = this.transformationData[this.dataPointer];
    this.mesh.morphTargetInfluences[2] = transformation.rotXUp;
    this.mesh.morphTargetInfluences[1] = transformation.rotXDown; 
    this.mesh.morphTargetInfluences[3] = transformation.rotYLeft;
    this.mesh.morphTargetInfluences[4] = transformation.rotYRight;
    this.dataPointer++;
    if (this.dataPointer == this.transformationData.length)
        this.dataPointer = 0;
}

//LOAD TEXTURES
scene.loadFaceTextures = function() {
    var texUrls = { 
        bumpMap: 'model/ryrussell_faceb_1001.jpg', 
        map: 'model/ryrussell_face_1001.jpg', 
        normalMap: 'model/Michael7_Face_NM_1001.jpg'
    };
    for (var key in texUrls) {
        this.texLoader.load(texUrls[key], 
            function(key2, thescene) { 
                return function(tex) {
                    thescene.faceTextures[key2] = tex;
                    console.log("face", thescene.faceTextures)
                    thescene.canvas.dispatchEvent( new Event('faceTexLoaded'));
                }
            }(key, this)
        );
    }
}

//Convert the face material to phong
//Add normal map to face
//Note that bump and normal map cannot be used at the same time
scene.replaceFaceMaterial = function() {
    if (Object.keys(this.faceTextures).length < 3)
        return;
    this.mesh.material.materials[3] = new THREE.MeshPhongMaterial({ 
        map: this.faceTextures.map,
        normalMap: this.faceTextures.normalMap,
        name: "Face",
        shininess: 0
    });
//  this.mesh.material.needsUpdate = true;
    this.canvas.dispatchEvent( new Event('faceMaterialReady'));
}

scene.addMorphingToMaterial = function() {
    this.mesh.material.materials.forEach(function(mat) {
        mat.morphTargets = true;
        mat.needsUpdate = true;
    })
}

scene.onWindowResize = function() {
    this.camera.aspect = this.canvas.width / this.canvas.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.width, this.canvas.height);
}

scene.animate = function() {
    requestAnimationFrame(this.animate.bind(this));

    this.controls.update();
    this.applyMovementsFromFile();

    this.renderer.render(this.scene, this.camera);
}

/*
scene.translateValue = function(value, sourceMin, sourceMax, destMin, destMax) {
    normValue = this.normalize(value,sourceMin,sourceMax);
    return this.lerp(normValue, destMin, destMax);

}

scene.lerp = function(pct, min, max) {
    return pct*(Math.abs(max-min)) + min;
}

scene.normalize = function(value, min, max) {
    return Math.abs((value - min) / (max - min));
}
*/