THREE.mpegGlitchShader = {
	uniforms: {
		"BLOCKS":  { type: "f", value: 0.2 },
		"LINES":  { type: "f", value: 0.3 },
		"THICKNESS":  { type: "f", value: 8.0 },
		"FREQ": { type: "f", value: 0.5 },
		"iChannel1":  { type: "t", value: null},
		"iGlobalTime": { type: "f", value: null },
		"iResolution": { type: "v3", value: new THREE.Vector3( null, null, null ) },
	},
	vertexShader: [
		"void main()	{",
		"    gl_Position = vec4( position, 1.0 );",
		"}",
	].join("\n"),

	fragmentShader: [
		"uniform float BLOCKS;",
		"uniform float LINES;",
		"uniform float THICKNESS;",
		"uniform float FREQ; ",
		"uniform sampler2D iChannel1;",
		"uniform float iGlobalTime;",
		"uniform vec3 iResolution; ",

		"void main()",
		"{",
		"    float time = iGlobalTime / 10.0;",
		"    vec2 uv = gl_FragCoord.xy / iResolution.xy;",
		"	vec2 block = floor(gl_FragCoord.xy / vec2(THICKNESS));",
		"	vec2 uv_noise = block / vec2(64);",
		"	uv_noise += floor(vec2(time) * vec2(1234.0, 3543.0)) / vec2(64);",

		"	float block_thresh = pow(fract(time * 1236.0453), FREQ * 2.0) * BLOCKS;",
		"	float line_thresh = pow(fract(time * 2236.0453), FREQ * 3.0) * LINES;",

		"	vec2 uv_r = uv, uv_g = uv, uv_b = uv;",

		"	// glitch some blocks and lines",
		"	if (texture2D(iChannel1, uv_noise).r < block_thresh ||",
		"		texture2D(iChannel1, vec2(uv_noise.y, 0.0)).g < line_thresh) {",

		"		vec2 dist = (fract(uv_noise) - 0.5) * 0.3;",
		"		uv_r += dist * 0.1;",
		"		uv_g += dist * 0.2;",
		"		uv_b += dist * 0.125;",
		"       gl_FragColor.rgb += texture2D(iChannel1, vec2(uv_noise.y)).rgb - 0.2;",
		"    } else {",
		"		gl_FragColor.r = 0.0;",
		"		gl_FragColor.g = 0.0;",
		"		gl_FragColor.b = 0.0;",
		"    }",



		"	// loose luma for some blocks",
		"	if (texture2D(iChannel1, uv_noise).g < block_thresh)",
		"		gl_FragColor.rgb = gl_FragColor.ggg;",

		"	// discolor block lines",
		"	if (texture2D(iChannel1, vec2(uv_noise.y, 0.0)).b * 3.5 < line_thresh)",
		"		gl_FragColor.rgb = vec3(0.0, dot(gl_FragColor.rgb, vec3(1.0)), 0.0);",

		"	// interleave lines in some blocks",
		"	if (texture2D(iChannel1, uv_noise).g * 1.5 < block_thresh ||",
		"		texture2D(iChannel1, vec2(uv_noise.y, 0.0)).g * 2.5 < line_thresh) {",
		"		float line = fract(gl_FragColor.y / 3.0);",
		"		vec3 mask = vec3(3.0, 0.0, 0.0);",
		"		if (line > 0.333)",
		"			mask = vec3(0.0, 3.0, 0.0);",
		"		if (line > 0.666)",
		"			mask = vec3(0.0, 0.0, 3.0);",

		"		gl_FragColor.xyz *= mask;",
		"	}",

		"}",
	].join("\n")

};
