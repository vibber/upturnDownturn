// This version of the script allows you to record faceOSC data by pressing space. Ie. data about the movement of the face.
// Data will be saved in a data.json.js file

var scene = {};

scene.init = function () {
    this.textures = {};

    // OTHER SCENES

    faceMapScene.init();
    normalMapScene.init();
    faceDistMapScene.init();

    //Renderer

    this.canvas = document.getElementById("scenecanvas");
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: this.canvas
    });
    this.renderer.setClearColor(0xffffff, 0.0);
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

    this.canvas.addEventListener('meshReady', this.replaceFaceMaterial.bind(this) );
    //this.canvas.addEventListener('meshReady', this.loadFaceTextures.bind(this) );
    //this.canvas.addEventListener('faceTexLoaded', this.replaceFaceMaterial.bind(this) );
    this.canvas.addEventListener('faceMaterialReady', this.addMorphingToMaterial.bind(this) );
    this.canvas.addEventListener('faceMaterialReady', this.addDoubleSideToMaterial.bind(this) );
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
    this.mesh.morphTargetInfluences[0] = transformation.eyes;
    this.mesh.morphTargetInfluences[2] = transformation.rotXUp;
    this.mesh.morphTargetInfluences[1] = transformation.rotXDown; 
    this.mesh.morphTargetInfluences[3] = transformation.rotYLeft;
    this.mesh.morphTargetInfluences[4] = transformation.rotYRight;
    this.dataPointer++;
    if (this.dataPointer == this.transformationData.length)
        this.dataPointer = 0;
}

//LOAD TEXTURES
// scene.loadFaceTextures = function() {
//     var texUrls = { 
//         faceMap: 'model/ryrussell_face_1001.jpg',
//         //'img/tex/CGRright_109_normal.jpg'
//     };
//     for (var key in texUrls) {
//         this.texLoader.load(texUrls[key], 
//             function(key2, thescene) { 
//                 return function(tex) {
//                     tex.wrapS = THREE.RepeatWrapping;
//                     tex.wrapT = THREE.RepeatWrapping;
//                     thescene.textures[key2] = tex;
//                     console.log("face", thescene.textures)
//                     thescene.canvas.dispatchEvent( new Event('faceTexLoaded'));
//                 }
//             }(key, this)
//         );
//     }
// }

//Convert the materials to phong
//Add normal map to face and torso
//Note that bump and normal map cannot be used at the same time
scene.replaceFaceMaterial = function() {
    // if (Object.keys(this.textures).length < 1)
    //     return;
    this.mesh.material.materials[3] = new THREE.MeshPhongMaterial({ 
        map: faceMapScene.rendertarget.texture,
        normalMap: normalMapScene.rendertarget.texture,
        displacementMap: faceDistMapScene.rendertarget.texture,
        name: "Face",
        shininess: 0,
        transparent: true
    });
    this.canvas.dispatchEvent( new Event('faceMaterialReady'));
}

scene.addDoubleSideToMaterial = function() {
    this.mesh.material.materials.forEach( function (mat) {
        mat.side = THREE.DoubleSide;
    })
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

    faceMapScene.animate();
    normalMapScene.animate();
    faceDistMapScene.animate();

    scene.animateBass();
    scene.animateKicks();
    scene.animatePad();
    scene.animateSnare();

    //Apparantly the same renderer needs to be used for the two scenes
    //It doesn't work when the texscene has it's own renderer
    this.renderer.render( normalMapScene.scene, normalMapScene.camera, normalMapScene.rendertarget);
    this.renderer.render( faceMapScene.scene, faceMapScene.camera, faceMapScene.rendertarget);
    this.renderer.render(faceDistMapScene.scene, faceDistMapScene.camera, faceDistMapScene.rendertarget);
    this.renderer.render(this.scene, this.camera);
}

scene.animateSnare = function() {
    if (!this.mesh)
        return;
    if (currentSong && currentSong.trackAnalyserData[21] && currentSong.isPlaying) {
        this.mesh.morphTargetInfluences[6] = currentSong.trackAnalyserData[21][12] / 255 * 3;
    } else {
        this.mesh.morphTargetInfluences[6] = 0;
    }
}

scene.animateToms = function() {
    if (!this.mesh)
        return;
    if (currentSong && currentSong.trackAnalyserData[22] && currentSong.isPlaying) {
        this.mesh.morphTargetInfluences[7] = currentSong.trackAnalyserData[22][15] / 255;
    } else {
        this.mesh.morphTargetInfluences[7] = 0;
    }
}

scene.animateBass = function() {
    if (!this.mesh)
        return;
    var faceMat = this.mesh.material.materials[3];
    if (currentSong && currentSong.trackAnalyserData[1] && currentSong.isPlaying) {
        faceMat.displacementScale = currentSong.trackAnalyserData[1][8] / 255 / 4;
    } else {
        faceMat.displacementScale = 0;
    }
}

scene.animateKicks = function() {
    if (currentSong && currentSong.trackAnalyserData[17] && currentSong.isPlaying) {
        this.mesh.morphTargetInfluences[5] = currentSong.trackAnalyserData[17][9] / 255 * 3;
    } else if (this.mesh && this.mesh.morphTargetInfluences[5] ) {
        this.mesh.morphTargetInfluences[5] = 0;
    }
}

scene.animatePad = function() {
    if (!this.mesh)
        return;
    var faceMat = this.mesh.material.materials[3];
    if (currentSong && currentSong.trackAnalyserData[19] && currentSong.isPlaying) {
        //Animate the face material to the 'pad' track
        faceMat.shininess = currentSong.trackAnalyserData[19][9] / 255 * 100 * 2;
        faceMat.normalScale.x = currentSong.trackAnalyserData[19][9] / 255 * 4; 
        //Fade out the effect when 'kick' comes in
        faceMat.normalScale.x -= this.mesh.morphTargetInfluences[5] * 2;
        faceMat.normalScale.x = faceMat.normalScale.x < 0 ? 0 : faceMat.normalScale.x;
        faceMat.normalScale.y = faceMat.normalScale.x;
        //Also animate thickness of transparent stripes
        THREE.alphaStripesShader.uniforms.thickness.value = 1.2 - currentSong.trackAnalyserData[19][5] / 255 / 2;
        THREE.alphaStripesShader.uniforms.thickness.value = THREE.alphaStripesShader.uniforms.thickness.value < 0 ? 0 : THREE.alphaStripesShader.uniforms.thickness.value;
    } else {
        faceMat.shininess = 0;
        faceMat.normalScale.x = 0; 
        faceMat.normalScale.y = faceMat.normalScale.x;
        THREE.alphaStripesShader.uniforms.thickness.value = 1.2;
    }
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