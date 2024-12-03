/**
 * @Instructions
 * 		@task1 : Complete the setTexture function to handle non power of 2 sized textures
 * 		@task2 : Implement the lighting by modifying the fragment shader, constructor,
 *      @task3: 
 *      @task4: 
 * 		setMesh, draw, setAmbientLight, setSpecularLight and enableLighting functions 
 */


function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) {
	
	var trans1 = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	var rotatXCos = Math.cos(rotationX);
	var rotatXSin = Math.sin(rotationX);

	var rotatYCos = Math.cos(rotationY);
	var rotatYSin = Math.sin(rotationY);

	var rotatx = [
		1, 0, 0, 0,
		0, rotatXCos, -rotatXSin, 0,
		0, rotatXSin, rotatXCos, 0,
		0, 0, 0, 1
	]

	var rotaty = [
		rotatYCos, 0, -rotatYSin, 0,
		0, 1, 0, 0,
		rotatYSin, 0, rotatYCos, 0,
		0, 0, 0, 1
	]

	var test1 = MatrixMult(rotaty, rotatx);
	var test2 = MatrixMult(trans1, test1);
	var mvp = MatrixMult(projectionMatrix, test2);

	return mvp;
}


class MeshDrawer {
	// The constructor is a good place for taking care of the necessary initializations.
	// Updated MeshDrawer constructor
	constructor() {
        this.prog = InitShaderProgram(meshVS, meshFS);
        this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
        this.showTexLoc = gl.getUniformLocation(this.prog, 'showTex');
        this.enableLightingLoc = gl.getUniformLocation(this.prog, 'enableLighting');
        this.ambientLoc = gl.getUniformLocation(this.prog, 'ambient');
        this.lightPosLoc = gl.getUniformLocation(this.prog, 'lightPos');
        this.specularLoc = gl.getUniformLocation(this.prog, 'specular');
        this.shininessLoc = gl.getUniformLocation(this.prog, 'shininess');
        this.blendFactorLoc = gl.getUniformLocation(this.prog, 'blendFactor');

        this.tex0Loc = gl.getUniformLocation(this.prog, 'tex0');
        this.tex1Loc = gl.getUniformLocation(this.prog, 'tex1');

        this.vertPosLoc = gl.getAttribLocation(this.prog, 'pos');
        this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
        this.normalLoc = gl.getAttribLocation(this.prog, 'normal');

        this.vertbuffer = gl.createBuffer();
        this.texbuffer = gl.createBuffer();
        this.normbuffer = gl.createBuffer();

        this.numTriangles = 0;

        // Default lighting and texture values
        this.ambient = 0.2;
        this.specular = 0.5;
        this.shininess = 32.0;
        this.blendFactor = 0.5; // Default blend factor
        this.texture1 = null;
        this.texture2 = null;
    }

	 // Set specular light intensity
	 setSpecularLight(specular) {
        this.specular = specular;
    }
	// Set shininess exponent
    setShininess(shininess) {
        this.shininess = shininess;
    }

	// Set the mesh (positions, texture coordinates, and normals)
    setMesh(vertPos, texCoords, normalCoords) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalCoords), gl.STATIC_DRAW);

        this.numTriangles = vertPos.length / 3;
    }

	draw(trans) {
		gl.useProgram(this.prog);
	
		// Pass transformation and lighting data to the shader
		gl.uniformMatrix4fv(this.mvpLoc, false, trans);
		gl.uniform3f(this.lightPosLoc, lightX, lightY, 1.0); // Light position
		gl.uniform1f(this.ambientLoc, this.ambient); // Ambient intensity
		gl.uniform1f(this.specularLoc, this.specular); // Specular intensity
		gl.uniform1f(this.shininessLoc, this.shininess); // Shininess exponent
		gl.uniform1f(this.blendFactorLoc, this.blendFactor); // Blending factor
		gl.uniform1i(this.enableLightingLoc, this.lightingEnabled ? 1 : 0); // Enable/disable lighting
	
		// Bind textures
		if (this.texture1) {
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, this.texture1);
			gl.uniform1i(this.tex0Loc, 0);
		}
		if (this.texture2) {
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.texture2);
			gl.uniform1i(this.tex1Loc, 1);
		}
	
		// Draw mesh
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertbuffer);
		gl.enableVertexAttribArray(this.vertPosLoc);
		gl.vertexAttribPointer(this.vertPosLoc, 3, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texbuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normbuffer);
		gl.enableVertexAttribArray(this.normalLoc);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);
	
		gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
	}

	// Set the base texture
    setTexture(img) {
        if (!this.texture1) this.texture1 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        this.setupTextureParameters(img);
    }

    // Set the second texture
    setSecondTexture(img) {
        if (!this.texture2) this.texture2 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        this.setupTextureParameters(img);
    }

    // Helper to handle non-power-of-2 texture parameters
    setupTextureParameters(img) {
        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    }

    // Set blending factor
    setBlendFactor(factor) {
        this.blendFactor = factor;
    }


	showTexture(show) {
		gl.useProgram(this.prog);
		gl.uniform1i(this.showTexLoc, show);
	}

	// Enable or disable lighting
    enableLighting(show) {
        this.lightingEnabled = show;
    }

    // Set ambient light intensity
    setAmbientLight(ambient) {
        this.ambient = ambient;
    }
	
}


function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

function normalize(v, dst) {
	dst = dst || new Float32Array(3);
	var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
	// make sure we don't divide by 0.
	if (length > 0.00001) {
		dst[0] = v[0] / length;
		dst[1] = v[1] / length;
		dst[2] = v[2] / length;
	}
	return dst;
}

// Vertex shader source code
const meshVS = `
			attribute vec3 pos; 
			attribute vec2 texCoord; 
			attribute vec3 normal;

			uniform mat4 mvp; 

			varying vec2 v_texCoord; 
			varying vec3 v_normal; 

			void main()
			{
				v_texCoord = texCoord;
				v_normal = normal;

				gl_Position = mvp * vec4(pos,1);
			}`;

const meshFS = `
			precision mediump float;
		
			uniform bool showTex;
			uniform bool enableLighting;
			uniform sampler2D tex0; // Base texture
			uniform sampler2D tex1; // Second texture
			uniform vec3 lightPos; // Light position in world space
			uniform float ambient;  // Ambient light intensity
			uniform float specular; // Specular light intensity
			uniform float shininess; // Shininess exponent
			uniform float blendFactor; // Blending factor for textures
		
			varying vec2 v_texCoord; 
			varying vec3 v_normal; 
		
			void main() {
				// Normalize interpolated normal
				vec3 normal = normalize(v_normal);
		
				// Calculate light direction (assume light position in world space)
				vec3 lightDir = normalize(lightPos);
		
				// Hardcoded view direction (camera facing towards -Z axis)
				vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0)); 
		
				// Diffuse lighting
				float diff = max(dot(normal, lightDir), 0.0);
				vec3 diffuse = diff * vec3(1.0, 1.0, 1.0);
		
				// Ambient lighting
				vec3 ambientLight = ambient * vec3(1.0, 1.0, 1.0);
		
				// Specular lighting (Phong model)
				vec3 reflectDir = reflect(-lightDir, normal);
				float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
				vec3 specularLight = specular * spec * vec3(1.0, 1.0, 1.0);
		
				// Combine lighting contributions
				vec3 lighting = ambientLight + diffuse + specularLight;
		
				// Blend textures
				vec4 baseColor = texture2D(tex0, v_texCoord);
				vec4 secondColor = texture2D(tex1, v_texCoord);
				vec4 blendedColor = mix(baseColor, secondColor, blendFactor);
		
				// Apply lighting to blended textures
				if (enableLighting) {
					gl_FragColor = vec4(blendedColor.rgb * lighting, blendedColor.a); // Lighting with blended textures
				} else if (showTex) {
					gl_FragColor = blendedColor; // Show textures without lighting
				} else {
					gl_FragColor = vec4(lighting, 1.0); // Show lighting only
				}
			}
		`;
		
		

// Light position parameters
let lightX = 1;
let lightY = 1;
const keys = {};
// Update light position dynamically using arrow keys
function updateLightPos() {
    const translationSpeed = 0.1; // Adjust the light movement speed
    if (keys['ArrowUp']) lightY += translationSpeed;
    if (keys['ArrowDown']) lightY -= translationSpeed;
    if (keys['ArrowRight']) lightX += translationSpeed;
    if (keys['ArrowLeft']) lightX -= translationSpeed;
    DrawScene(); // Redraw the scene with the updated light position
}
// Listen for keydown and keyup events
window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    updateLightPos();
});

window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});


// Ensure DrawScene is updated to reflect lighting changes
function DrawScene() {
    const mvp = GetModelViewProjection(perspectiveMatrix, 0, 0, transZ, rotX, autorot + rotY);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    meshDrawer.draw(mvp);
}

// Update blending factor from the slider
function SetBlendFactor(param) {
    const blendValue = param.value / 100;
    meshDrawer.setBlendFactor(blendValue);
    DrawScene();
}
// Set the second texture using the existing HTML input
function LoadTexture2(param) {
    if (param.files && param.files[0]) {
        const img = new Image();
        img.src = URL.createObjectURL(param.files[0]);
        img.onload = function () {
            meshDrawer.setSecondTexture(img);
            DrawScene();
        };
    }
}
function EnableLight(param) {
    meshDrawer.enableLighting(param.checked); // Pass the checkbox state to MeshDrawer
    DrawScene();
}
function SetAmbientLight(param) {
    meshDrawer.setAmbientLight(param.value / 100); // Normalize slider value to 0–1
    DrawScene();
}

function SetSpecularLight(param) {
    meshDrawer.setSpecularLight(param.value / 100); // Normalize slider value to 0–1
    DrawScene();
}
///////////////////////////////////////////////////////////////////////////////////
