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

    //White strobe
    this.animLight1 = new THREE.DirectionalLight( 0xffeedd, 0 );
    this.animLight1.position.set( 0, 0, 2 );
    this.scene.add( this.animLight1 );

    //Pink
    this.animLight2 = new THREE.DirectionalLight( 0xffa1ff, 0 );
    this.animLight2.position.set( 5, 0, -5 );
    this.scene.add( this.animLight2 );

    //Light green
    this.animLight3 = new THREE.DirectionalLight( 0xe4fece, 0 );
    this.animLight3.position.set( -5, 0, -5 );
    this.scene.add( this.animLight3 );

    //darkish blue
    this.animLight4 = new THREE.DirectionalLight( 0x468fb8, 0 );
    this.animLight4.position.set( 0, -1, 0 );
    this.scene.add( this.animLight4 );

    //Red
    this.animLight5 = new THREE.DirectionalLight( 0xe60f03, 0 );
    this.animLight5.position.set( -3, -3, -3 );
    this.scene.add( this.animLight5 );

    //Cyan
    this.animLight6 = new THREE.DirectionalLight( 0x4ac3a0, 0 );
    this.animLight6.position.set( 3, -3, -3 );
    this.scene.add( this.animLight6 );

    //Light green 2
    this.animLight7 = new THREE.DirectionalLight( 0xcfff8b, 1 );
    this.animLight7.position.set( 1.8, 3, -3 );
    this.scene.add( this.animLight7 );    

    //Orange
    this.animLight8 = new THREE.DirectionalLight( 0xff7612, 1 );
    this.animLight8.position.set( -1.8, 3, -3 );
    this.scene.add( this.animLight8 );    

    //Yellow uplight
    this.animLight9 = new THREE.DirectionalLight( 0xeecc00, 1 );
    this.animLight9.position.set( 0, -1, -1 );
    this.scene.add( this.animLight9 );

    //WALL

    var mat = new THREE.MeshLambertMaterial( {color: 0xffffff} );
    var geo = new THREE.PlaneGeometry( 1000, 500, 1, 1 );
    this.wallMesh = new THREE.Mesh(geo, mat);
    this.wallMesh.position.z = -40;
    this.scene.add(this.wallMesh);

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

    //CLOCK

    this.clock = new THREE.Clock();

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

    scene.animateFX();
    scene.animateWoof();
    scene.animateShaker();
    scene.animateLead();
    scene.animateSnare();
    scene.animateToms();
    scene.animateBass();
    scene.animateKicks();
    scene.animatePad();

    //Apparantly the same renderer needs to be used for the two scenes
    //It doesn't work when the texscene has it's own renderer
    this.renderer.render( normalMapScene.scene, normalMapScene.camera, normalMapScene.rendertarget);
    this.renderer.render( faceMapScene.scene, faceMapScene.camera, faceMapScene.rendertarget);
    this.renderer.render(faceDistMapScene.scene, faceDistMapScene.camera, faceDistMapScene.rendertarget);
    this.renderer.render(this.scene, this.camera);
}

//Animate FX colored lights
scene.animateFX = function() {
    if (!this.mesh)
        return;
    if (currentSong && currentSong.isPlaying && $("a.simpleTrackToggle.___f_x").hasClass('down')) {
        this.animLight2.intensity = 0.8 + currentSong.trackAnalyserData[0][10] / 255 * 3;
    }
    else if ($("a.simpleTrackToggle.___f_x").hasClass('down'))
        this.animLight2.intensity = 0.8;
    else {
         this.animLight2.intensity = 0.0;
    }
    this.animLight3.intensity = this.animLight2.intensity;
}

//Animate open mouth
scene.animateWoof = function() {
    if (!this.mesh)
        return;
    if (currentSong && currentSong.isPlaying && $("a.simpleTrackToggle.__woof-__002b-clave").hasClass('down')) {
        this.mesh.morphTargetInfluences[8] = currentSong.trackAnalyserData[23][12] / 255 * 2;
        this.animLight8.intensity = 0.5 + currentSong.trackAnalyserData[23][12] / 255;
    } else if ($("a.simpleTrackToggle.__woof-__002b-clave").hasClass('down')) {
        this.animLight8.intensity = 0.5;
    } else {
        this.animLight8.intensity = 0.0;
        this.mesh.morphTargetInfluences[8] = 0;
    }
}

//Animate thickness of transparent stripes
scene.animateShaker = function() {
    if (!this.mesh)
        return;
    if (currentSong && currentSong.isPlaying && $("a.simpleTrackToggle.__shaker-echo-__002b-clap").hasClass('down')) {
        THREE.alphaStripesShader.uniforms.thickness.value = 1.2 - currentSong.trackAnalyserData[20][15] / 255 / 2;
        THREE.alphaStripesShader.uniforms.thickness.value = THREE.alphaStripesShader.uniforms.thickness.value < 0 ? 0 : THREE.alphaStripesShader.uniforms.thickness.value;
        this.animLight7.intensity = 0.5 + currentSong.trackAnalyserData[20][15] / 255;
    } else if ($("a.simpleTrackToggle.__shaker-echo-__002b-clap").hasClass('down')){
        this.animLight7.intensity = 0.5;
    } else {
        this.animLight7.intensity = 0.0;        
        THREE.alphaStripesShader.uniforms.thickness.value = 1.2;
    }
}

//Animate white strobe light
scene.animateLead = function() {
    if(!this.mesh)
        return;
    if (currentSong && currentSong.isPlaying && $("a.enableTrack.__lead").hasClass('down')) {
        this.animLight1.intensity = 0.2 + currentSong.trackAnalyserData[18][0] / 255 * 1 * Math.random();
        this.animLight1.position.x = currentSong.trackAnalyserData[18][0] * Math.sin(this.clock.getElapsedTime()*10) * 5 * Math.random();
        this.animLight1.position.y = currentSong.trackAnalyserData[18][0] * Math.cos(this.clock.getElapsedTime()*10) * 10 * Math.random();
    }
    else if ($("a.enableTrack.__lead").hasClass('down')) {
        this.animLight1.intensity = 0.2;
     } else {
        this.animLight1.intensity = 0.0;
    }
}

//Animate one side of face
scene.animateSnare = function() {
    if (!this.mesh)
        return;
    if (currentSong && currentSong.isPlaying && $("a.simpleTrackToggle.__snare").hasClass('down')) {
        this.mesh.morphTargetInfluences[6] = currentSong.trackAnalyserData[21][12] / 255 * 3;
        this.animLight6.intensity = 0.5 + currentSong.trackAnalyserData[21][12] / 255 * 2;
    } else if ($("a.simpleTrackToggle.__snare").hasClass('down')) {
        this.animLight6.intensity = 0.5;
    } else {
        this.animLight6.intensity = 0.0;
        this.mesh.morphTargetInfluences[6] = 0;
    }
}

//Animate other side of face
scene.animateToms = function() {
    if (!this.mesh)
        return;
    if (currentSong && currentSong.isPlaying && $("a.enableTrack.__toms").hasClass('down')) {
        this.mesh.morphTargetInfluences[7] = currentSong.trackAnalyserData[22][0] / 255 * 3;
        this.animLight5.intensity = 0.5 + currentSong.trackAnalyserData[22][0] / 255 * 2;
    } else if ($("a.enableTrack.__toms").hasClass('down')) {
        this.animLight5.intensity = 0.5;
    } else {
        this.mesh.morphTargetInfluences[7] = 0;
        this.animLight5.intensity = 0.0; 
    }
}

//Animate mesh distortion
scene.animateBass = function() {
    if (!this.mesh)
        return;
    var faceMat = this.mesh.material.materials[3];
    if (currentSong && currentSong.isPlaying && $("a.enableTrack.__bass").hasClass('down')) {
        faceMat.displacementScale = currentSong.trackAnalyserData[1][8] / 255 / 4;
        this.animLight4.intensity = 1 + currentSong.trackAnalyserData[1][8] / 255;
    } else if ($("a.enableTrack.__bass").hasClass('down')) {
        this.animLight4.intensity = 1;
    } else {
        faceMat.displacementScale = 0;
        this.animLight4.intensity = 0;
    }
}

//Animate brow down
scene.animateKicks = function() {
    if (!this.mesh)
        return;
    if (currentSong && currentSong.isPlaying && $("a.enableTrack.__kicks").hasClass('down')) {
        this.mesh.morphTargetInfluences[5] = currentSong.trackAnalyserData[17][9] / 255 * 3;
        this.directionalLight3.intensity = 0.5 + currentSong.trackAnalyserData[17][9] / 255;
    } else if ($("a.enableTrack.__kicks").hasClass('down')) {
        this.directionalLight3.intensity = 0.5;
    } else {
        this.mesh.morphTargetInfluences[5] = 0;
        this.directionalLight3.intensity = 0.3;
    }
}

//Animate snake skin normal map
scene.animatePad = function() {
    if (!this.mesh)
        return;
    var faceMat = this.mesh.material.materials[3];
    if (currentSong && currentSong.trackAnalyserData[19] && currentSong.isPlaying && $("a.enableTrack.__pad").hasClass('down')) {
        //Animate the face material to the 'pad' track
        faceMat.shininess = currentSong.trackAnalyserData[19][9] / 255 * 100 * 2;
        faceMat.normalScale.x = currentSong.trackAnalyserData[19][9] / 255 * 4; 
        faceMat.normalScale.x = faceMat.normalScale.x < 0 ? 0 : faceMat.normalScale.x;
        faceMat.normalScale.y = faceMat.normalScale.x;
        this.animLight9.intensity = 1.0 + currentSong.trackAnalyserData[19][9] / 255;
    } else if ($("a.enableTrack.__pad").hasClass('down')) {
        this.animLight9.intensity = 1.0;
    } else {
        faceMat.shininess = 0;
        faceMat.normalScale.x = 0; 
        faceMat.normalScale.y = faceMat.normalScale.x;
        this.animLight9.intensity = 0.0;
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