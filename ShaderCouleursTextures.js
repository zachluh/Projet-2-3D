
   var strVertexShaderSource =
        '    attribute vec3 vertexPos;\n' +
        '    attribute vec4 vertexColor;\n' +
        '    attribute vec2 texelPos;\n' +
        '    uniform mat4 modelViewMatrix;\n' +
        '    uniform mat4 projectionMatrix;\n' +
        '    varying vec4 vColor;\n' +
		'    varying vec2 vTexelPos;\n' +
        '    void main(void) {\n' +
        '        gl_Position = projectionMatrix * modelViewMatrix * \n' +
        '            vec4(vertexPos, 1.0);\n' +
        '        vColor = vertexColor;\n' +
        '        vTexelPos = texelPos;\n' +		
        '    }\n';

    var strFragmentShaderSource =
        '    precision mediump float;\n' +
        '    uniform float uPcTexelColor;\n' +
        '    uniform float uInverserCouleurs;\n' +
		'    uniform sampler2D uSampler;\n' +
        '    varying vec4 vColor;\n' +
		'    varying vec2 vTexelPos;\n' +
        '    void main(void) {\n' +
        '        vec4 texColor = texture2D(uSampler, vTexelPos);\n' +
        '        vec4 couleurFinale = mix(texColor, vec4(1.0 - texColor.rgb, texColor.a), uInverserCouleurs);\n' +
        '        gl_FragColor = mix(vColor, couleurFinale, uPcTexelColor);\n' +
        '}\n';

     function creerShader(objgl, strSource, strType) {
        var objShader = null;
		
        if (strType == 'fragment') {
            objShader = objgl.createShader(objgl.FRAGMENT_SHADER);
        } else if (strType == 'vertex') {
            objShader = objgl.createShader(objgl.VERTEX_SHADER);
        } 
		
		if (!objShader) {
			alert('Impossible de créer le ' + strType + 'shader');
		}
		else {
			objgl.shaderSource(objShader, strSource);
			objgl.compileShader(objShader);
			if (!objgl.getShaderParameter(objShader, objgl.COMPILE_STATUS)) {
				alert('Impossible de compiler le ' + strType + ' shader');
			}
        }

        return objShader;
    }

	function initShaders(objgl) {
		var objProgShaders = null;

		// Créer les shaders à partir du code source
        var objFragmentShader = creerShader(objgl, strFragmentShaderSource, 'fragment');
        var objVertexShader = creerShader(objgl, strVertexShaderSource, 'vertex');
		
		if (objFragmentShader && objVertexShader) { 
		    // Créer le programme qui va exécuter les shaders
			objProgShaders = objgl.createProgram();
			objgl.attachShader(objProgShaders, objVertexShader);
			objgl.attachShader(objProgShaders, objFragmentShader);
			objgl.linkProgram(objProgShaders);
		
			if (!objgl.getProgramParameter(objProgShaders, objgl.LINK_STATUS)) {
				alert('Impossible de lier les shaders');
			}
			else {	
				objProgShaders.posVertex = objgl.getAttribLocation(objProgShaders, 'vertexPos');
				objgl.enableVertexAttribArray(objProgShaders.posVertex);

				objProgShaders.couleurVertex = objgl.getAttribLocation(objProgShaders, 'vertexColor');
				objgl.enableVertexAttribArray(objProgShaders.couleurVertex);
				
				objProgShaders.matProjection = objgl.getUniformLocation(objProgShaders, 'projectionMatrix');
				objProgShaders.matModeleVue = objgl.getUniformLocation(objProgShaders, 'modelViewMatrix');

				objProgShaders.posTexel = objgl.getAttribLocation(objProgShaders, 'texelPos');
				//objgl.enableVertexAttribArray(objProgShaders.posTexel);
				
				objProgShaders.noTexture = objgl.getUniformLocation(objProgShaders, 'uSampler');
				objProgShaders.pcCouleurTexel = objgl.getUniformLocation(objProgShaders, 'uPcTexelColor');
				objProgShaders.inverserCouleurs = objgl.getUniformLocation(objProgShaders, 'uInverserCouleurs');
				
				objgl.useProgram(objProgShaders);
				// Default: no texture contribution, colours not inverted
				objgl.uniform1f(objProgShaders.pcCouleurTexel, 0.0);
				objgl.uniform1f(objProgShaders.inverserCouleurs, 0.0);
			}
		}
		
		return objProgShaders;
    }
