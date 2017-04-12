THREE.alphaStripesShader = {
	uniforms: {
		"iResolution": { type: "v3", value: new THREE.Vector3( null, null, null ) },
		"iGlobalTime":  { type: "f", value: null },
		"iChannel0": { type: "t", value: null},
		"frequency":  { type: "f", value: 3.0 },
		"tilt":  { type: "f", value: -0.9 },
		"speed":  { type: "f", value: 0.5 },
		"thickness":  { type: "f", value: 0.15 },
		"smoothness":  { type: "f", value: 0.01 },
	},
	vertexShader: [
		"void main()	{",
		"    gl_Position = vec4( position, 1.0 );",
		"}",
	].join("\n"),

	fragmentShader: [
		"uniform vec3      iResolution; ",
		"uniform float     iGlobalTime;",
		"uniform sampler2D    iChannel0;",
		"uniform float    frequency;",
		"uniform float    tilt;",
		"uniform float    speed;",
		"uniform float    thickness;",
		"uniform float    smoothness;",

		"#define _Smooth(p,r,s) smoothstep(-s, s, p-(r))",
		"#define time iGlobalTime * speed",
		"#define _thikness thickness * .5",

		"void main( )",
		"{",
		"    float s = fract( dot(gl_FragCoord.xy/iResolution.xy, vec2(frequency,tilt)) + time );   ",
		"    float bw =  _Smooth(_thikness, abs(s - .5) ,smoothness);",
		"    vec3 col = texture2D(iChannel0, gl_FragCoord.xy/iResolution.xy).rgb;",
		"    gl_FragColor = vec4(col, bw);",
		"}",


	].join("\n")

};
