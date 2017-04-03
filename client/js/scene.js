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

    //TRANSFORMATIONS

    this.createTransformationObjects();

    //EVENT HANDLERS

    this.canvas.addEventListener('meshReady', this.loadFaceTextures.bind(this) );
    this.canvas.addEventListener('faceTexLoaded', this.replaceFaceMaterial.bind(this) );
    this.canvas.addEventListener('faceMaterialReady', this.addMorphingToMaterial.bind(this) );
    window.addEventListener( 'oscMessage', this.applyTransformations.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    // OSC

    osc.init();

    //SAVE FILE

    this.fs = require("fs");
    this.record = "off";
    this.transformationData = [];
    window.addEventListener("keypress", this.handleKeyPress.bind(this));

    //ANIMATE

    this.animate();
}

scene.handleKeyPress = function(e) {
    if (e.code == "Space" && this.record == "off") {
        this.record = "on";
        console.log("recording");
    }
    else if (e.code == "Space" && this.record == "on") {
        this.record = "save";
        console.log("end recording");
    }
}

scene.recordData = function() {
    if (this.record == "on") {
        var tmpObj = {}
        for (var i = 0; i < this.transformations.length; i++) {
            tmpObj[this.transformations[i].name] = this.transformations[i].value;
        }
        this.transformationData.push(tmpObj);
    } else if (this.record == "save") {
        var path = global.__dirname + "/data.json.js";
        console.log(path);
        this.fs.writeFile(path, JSON.stringify(this.transformationData), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 
        this.record = "off";
        this.transformationData = [];
    }
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
    this.recordData();

    this.renderer.render(this.scene, this.camera);
}

////////////////////////////////// TRANSFORMATIONS ////////////////////////

scene.transformations = [];
scene.smoothingFramesFactor = 4; //Number of frames of smoothing of the transformation values

scene.applyTransformations = function(e) {
    this.transformations.forEach(function(transformation) {
        //Apply a translated value to the different properties of our mesh
        //morphs etc.
        transformation.apply(e.detail.oscBundle, this);
        //console.log(e.detail.oscBundle);
    }.bind(this))
}

//These objects hold the logic that translates the OSC values 
// to our model coordinate system.
scene.createTransformationObjects = function() {
    this.transformations.push({
        name: "rotXUp",
        oscMin: 0,
        oscMax: -0.32,
        modelMin: 0,
        modelMax: 1,
        value: 0,
        oldValue: 0,
        apply: function(oscBundle, scene) {
            this.oldValue = this.value;
            var rotX = oscBundle.elements[3].args[0].value;
            if (rotX > this.oscMax && rotX < this.oscMin) {
                var unSmoothed = scene.translateValue(rotX, this.oscMin, this.oscMax, this.modelMin, this.modelMax);
            } else {
                var unSmoothed = 0;
            }
            this.value = scene.movingAverageSmoothing(unSmoothed, this.oldValue, scene.smoothingFramesFactor);
            scene.mesh.morphTargetInfluences[2] = this.value;
        }
    });

    this.transformations.push({
        name: "rotXDown",
        oscMin: 0,
        oscMax: 0.32,
        modelMin: 0,
        modelMax: 0.5,
        value: 0,
        oldValue: 0,
        apply: function(oscBundle) {
            this.oldValue = this.value;
            var rotX = oscBundle.elements[3].args[0].value;
            if (rotX < this.oscMax && rotX > this.oscMin) {
                var unSmoothed = scene.translateValue(rotX, this.oscMin, this.oscMax, this.modelMin, this.modelMax);
            } else {
                var unSmoothed = 0;
            }
            this.value = scene.movingAverageSmoothing(unSmoothed, this.oldValue, scene.smoothingFramesFactor);
            scene.mesh.morphTargetInfluences[1] = this.value;
        }
    });

    this.transformations.push({
        name: "rotYLeft",
        oscMin: 0,
        oscMax: -0.3,
        modelMin: 0,
        modelMax: 0.5,
        value: 0,
        oldValue: 0,
        apply: function(oscBundle) {
            this.oldValue = this.value;
            var rotY = oscBundle.elements[3].args[1].value;
            if (rotY > this.oscMax && rotY < this.oscMin) {
                var unSmoothed = scene.translateValue(rotY, this.oscMin, this.oscMax, this.modelMin, this.modelMax);
            } else {
                var unSmoothed = 0;
            }
            this.value = scene.movingAverageSmoothing(unSmoothed, this.oldValue, scene.smoothingFramesFactor);
            scene.mesh.morphTargetInfluences[3] = this.value; 
        }
    });

    this.transformations.push({
        name: "rotYRight",
        oscMin: 0,
        oscMax: 0.3,
        modelMin: 0,
        modelMax: 0.5,
        value: 0,
        oldValue: 0,
        apply: function(oscBundle) {
            this.oldValue = this.value;
            var rotY = oscBundle.elements[3].args[1].value;
            if (rotY < this.oscMax && rotY > this.oscMin) {
                var unSmoothed = scene.translateValue(rotY, this.oscMin, this.oscMax, this.modelMin, this.modelMax);
            } else {
                var unSmoothed = 0;
            }
            this.value = scene.movingAverageSmoothing(unSmoothed, this.oldValue, scene.smoothingFramesFactor);
            scene.mesh.morphTargetInfluences[4] = this.value;
        }
    });                
}

//http://stackoverflow.com/questions/3760506/smoothing-values-over-time-moving-average-or-something-better
scene.movingAverageSmoothing = function(newValue, oldValue, numberOfFrames) {
    workingAverage = oldValue;
    smoothingFactor = 1/numberOfFrames;
    workingAverage = (newValue*smoothingFactor) + ( workingAverage * ( 1.0 - smoothingFactor) )
    return workingAverage;
}

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


////////////////////////////////// OSC STUFF //////////////////////////////

osc = {};
osc.inport = 8338;

osc.init = function() {
    this.osc = require('osc-min');
    this.udp = require("dgram");

    //Callback gets called everytime a msg is received
    this.sock = this.udp.createSocket("udp4", function(msg, rinfo) {
        var error, error1;
        try {
            this.parse(msg);
        } catch (error) {
            return console.log("Error in osc parsing", error);
        }
    }.bind(this));

    this.sock.bind(this.inport);
 }

//This gets called every time there is a new osc message
osc.parse = function(msg) {
    var oscBundle = this.osc.fromBuffer(msg);
    if (faceFound = oscBundle.elements[0].args[0].value) {
        dispatchEvent( new CustomEvent('oscMessage',{ "detail": {"oscBundle":oscBundle } } ));
    }
}
