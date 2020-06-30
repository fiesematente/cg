let vertexShaderText =
	`precision mediump float;
attribute vec3 vertPosition;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
void main()
{
  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
`;

let fragmentShaderText =
	`precision mediump float;
void main()
{
  gl_FragColor =  vec4(1.0, 1.0, 1.0, 1.0);
}
`;


let gl;
let canvas;
let whichKeyButton = 5;
let mouseButtonStatus = 0;
let whichMouseButton = 5;
let mouseMiddleDistancX = 0;
let mouseMiddleDistancY = 0;
let frontDirectionStatus = 0;
let backDirectionStatus = 0;
let leftDirectionStatus = 0;
let rightDirectionStatus = 0;
let downDirectionStatus = 0;
let upDirectionStatus = 0;
let spaceDirectionStatus = 0;
let xRotationRadiant;
let yRotationRadiant;
let testTextAusgabe = "MausPosition";
let testTextAusgabe2 = "Testausgabe";
let cameraMovementVektor = [0.0, 0.0, 0.0];

function keyDown(event) {
	whichKeyButton = event.key;
	if (whichKeyButton == "w") {
		frontDirectionStatus = 1;
	}
	if (whichKeyButton == "s") {
		backDirectionStatus = 1;
	}
	if (whichKeyButton == "a") {
		leftDirectionStatus = 1;
	}
	if (whichKeyButton == "d") {
		rightDirectionStatus = 1;
	}
	if (whichKeyButton == "q") {
		spaceDirectionStatus = 1;
		document.getElementById('audio').play();
	}
	testTextAusgabe2 = "keyButtonStatus: " + (frontDirectionStatus + backDirectionStatus + leftDirectionStatus + rightDirectionStatus);
	document.getElementById("keyPositionstestTextAusgabe2").innerHTML = testTextAusgabe2;

}

function keyUp(event) {
	whichKeyButton = event.key;
	if (whichKeyButton == "w") {
		frontDirectionStatus = 0;
	}
	if (whichKeyButton == "s") {
		backDirectionStatus = 0;
	}
	if (whichKeyButton == "a") {
		leftDirectionStatus = 0;
	}
	if (whichKeyButton == "d") {
		rightDirectionStatus = 0;
	}
	if (whichKeyButton == "q") {
		spaceDirectionStatus = 0;
		document.getElementById('audio').pause();
		

	}
	testTextAusgabe2 = "keyButtonStatus: " + (frontDirectionStatus + backDirectionStatus + leftDirectionStatus + rightDirectionStatus) + ", whichKeyButton: ";
	document.getElementById("keyPositionstestTextAusgabe2").innerHTML = testTextAusgabe2;
}

function mouseDown(event) {
	whichMouseButton = event.button;
	if (whichMouseButton == 0) {
		upDirectionStatus = 1;
	}
	if (whichMouseButton == 2) {
		downDirectionStatus = 1;
	}
	testTextAusgabe2 = "upDirectionStatus: " + (upDirectionStatus) + " downDirectionStatus: " + (downDirectionStatus) + " whichMouseButton: " + (whichMouseButton);
	document.getElementById("keyPositionstestTextAusgabe2").innerHTML = testTextAusgabe2;
}

function mouseUp(event) {
	whichMouseButton = event.button;
	if (whichMouseButton == 0) {
		upDirectionStatus = 0;
	}
	if (whichMouseButton == 2) {
		downDirectionStatus = 0;
	}
	testTextAusgabe2 = "upDirectionStatus: " + (upDirectionStatus) + " downDirectionStatus: " + (downDirectionStatus) + " whichMouseButton: " + (whichMouseButton);
	document.getElementById("keyPositionstestTextAusgabe2").innerHTML = testTextAusgabe2;
}

function mouseMoving(event) {
	let x = event.offsetX;
	let y = event.offsetY;
	mouseMiddleDistancX = x - (canvas.width / 2);
	mouseMiddleDistancY = y - (canvas.height / 2);
	testTextAusgabe = "X coords: " + mouseMiddleDistancX + ", mouseMiddleDistancY: " + mouseMiddleDistancY;
	document.getElementById("mausPositionstestTextAusgabe").innerHTML = testTextAusgabe;
}
async function createShaderProgram(gl, vertexShaderLocation, fragmentShaderLocation) {
	let vertexShaderResponse = await fetch(vertexShaderLocation);
	let vertexShaderText = await vertexShaderResponse.text();
	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderText);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	let fragmentShaderResponse = await fetch(fragmentShaderLocation);
	let fragmentShaderText = await fragmentShaderResponse.text();
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderText);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}

	let program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}
	return program;
}

function createShaderAndProgram(gl, vertexShaderText, fragmentShaderText) {

	let program = gl.createProgram();

	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
		return;
	}

	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
		return;
	}
	//
	// Create and activate Programm
	//
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}
	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	gl.useProgram(program);

	return program;
}
async function fetchModel(location) {


	var response = await fetch(location);
	var txt = await response.text();
	var lines = txt.split(/\r*\n/);


	var v = [];
	var vt = [];
	var vn = [];
	var vbo = [];

	for (line of lines) {
		var data = line.trim().split(/\s+/);
		var type = data.shift();
		if (type == 'v') {
			v.push(data.map(x => {
				return parseFloat(x)
			}));
		} else if (type == 'vt') {
			vt.push(data.map(x => {
				return parseFloat(x)
			}));
		} else if (type == 'vn') {
			vn.push(data.map(x => {
				return parseFloat(x)
			}));
		} else if (type == 'f') {
			for (fp of data) {
				var idx = fp.split('/').map(x => {
					return parseInt(x)
				});
				v[idx[0] - 1].forEach(x => {
					vbo.push(x)
				});
				vt[idx[1] - 1].forEach(x => {
					vbo.push(x)
				});
				vn[idx[2] - 1].forEach(x => {
					vbo.push(x)
				});
			}
		}
	}


	return vbo;
}

function createSkyBoxTexture(gl) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		document.getElementById('px'));
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		document.getElementById('nx'));
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		document.getElementById('py'));
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		document.getElementById('ny'));
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		document.getElementById('pz'));
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
		0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		document.getElementById('nz'));
	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

	return texture;
}

function createSkyBox(gl) {
	var box = {};

	var vertices = [-1.0, 1.0, -1.0, // 0
		-1.0, 1.0, 1.0, // 1
		1.0, 1.0, 1.0, // 2
		1.0, 1.0, -1.0, // 3
		-1.0, -1.0, -1.0, // 4
		-1.0, -1.0, 1.0, // 5
		1.0, -1.0, 1.0, // 6
		1.0, -1.0, -1.0, // 7
	];

	var indices = [
		6, 2, 5, 1, 5, 2, // front
		0, 1, 2, 0, 2, 3, // top
		5, 1, 4, 4, 1, 0, // left
		2, 6, 7, 2, 7, 3, // right
		3, 7, 4, 3, 4, 0, // back
		5, 4, 6, 6, 4, 7 // bottom
	];

	box.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, box.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	box.indexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	box.draw = function () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject);
		const positionAttribLocation = gl.getAttribLocation(this.program, 'vPosition');
		gl.vertexAttribPointer(
			positionAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			0 // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(positionAttribLocation);

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		gl.disableVertexAttribArray(positionAttribLocation);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	return box;
}
async function createTerrain(gl) {
	let terrain = {};
	let positionVertices = [-1, 0, 1,
		1, 0, 1, -1, 0, -1,
		1, 0, -1
	];
	let colorVertices = [
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
	];
	let vertexVerbindungsIndices = [
		0, 1, 2,
		1, 2, 3
	];

	//
	//Buffer erstellen und mit den Daten füllen
	terrain.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrain.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVertices), gl.STATIC_DRAW);

	terrain.indexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrain.indexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexVerbindungsIndices), gl.STATIC_DRAW);

	terrain.colorBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, terrain.colorBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorVertices), gl.STATIC_DRAW);

	//Daten Buffern und Array-Buffer vor der wiederverwendung mit Farben löschen


	terrain.draw = function (positionAttribLocation, colorAttribLocation) {

		gl.enableVertexAttribArray(positionAttribLocation); // Vertex_1
		gl.bindBuffer(gl.ARRAY_BUFFER, terrain.vertexBufferObject); // Vertex_2
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrain.indexBufferObject); // Color__
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0); // Vertex_3

		gl.enableVertexAttribArray(colorAttribLocation); // Color_1
		gl.bindBuffer(gl.ARRAY_BUFFER, terrain.colorBufferObject); // Color_2
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, terrain.indexBufferObject); // Color__
		gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, gl.FALSE, 0, 0); // Color_3

		gl.drawElements(gl.TRIANGLES, vertexVerbindungsIndices.length, gl.UNSIGNED_SHORT, 0);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(colorAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	};
	return terrain;
}
async function createUfo_light(gl) {
	let ufo_light = {};
	let positionVertices = [-0.5, 1, 0,
		0.5, 1, 0, -1, -1, 0,
		1, -1, 0
	];
	let colorVertices = [
		1.0, 0.0, 1.0, 0.7,
		1.0, 0.0, 1.0, 0.7,
		1.0, 0.0, 1.0, 0.0,
		1.0, 0.0, 1.0, 0.0,
	];
	let vertexVerbindungsIndices = [
		0, 1, 2,
		1, 2, 3
	];

	//
	//Buffer erstellen und mit den Daten füllen
	ufo_light.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, ufo_light.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVertices), gl.STATIC_DRAW);

	ufo_light.indexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ufo_light.indexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexVerbindungsIndices), gl.STATIC_DRAW);

	ufo_light.colorBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, ufo_light.colorBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorVertices), gl.STATIC_DRAW);

	//Daten Buffern und Array-Buffer vor der wiederverwendung mit Farben löschen


	ufo_light.draw = function (positionAttribLocation, colorAttribLocation, height) {

		gl.enableVertexAttribArray(positionAttribLocation); // Vertex_1
		gl.bindBuffer(gl.ARRAY_BUFFER, ufo_light.vertexBufferObject); // Vertex_2
		positionVertices[7] = -1 - height;
		positionVertices[10] = -1 - height;
		positionVertices[6] = -2 - height / 5;
		positionVertices[9] = 2 + height / 5;

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVertices), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ufo_light.indexBufferObject); // Color__
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0); // Vertex_3

		gl.enableVertexAttribArray(colorAttribLocation); // Color_1
		gl.bindBuffer(gl.ARRAY_BUFFER, ufo_light.colorBufferObject); // Color_2
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ufo_light.indexBufferObject); // Color__
		gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, gl.FALSE, 0, 0); // Color_3

		gl.drawElements(gl.TRIANGLES, vertexVerbindungsIndices.length, gl.UNSIGNED_SHORT, 0);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(colorAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	};
	return ufo_light;
}
async function createUfo(gl) {
	let ufo = {};

	let positionVertices = await fetchModel('models/ownUfo_versatz.obj');

	ufo.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, ufo.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	ufo.normalBufferObject = gl.createBuffer();
	ufo.draw = function () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);

		const positionAttribLocation = gl.getAttribLocation(this.program, 'vertPosition');
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, gl.FALSE, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.enableVertexAttribArray(positionAttribLocation);

		const normalAttribLocation = gl.getAttribLocation(this.program, 'vNormal');
		gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, gl.FALSE, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);
		gl.enableVertexAttribArray(normalAttribLocation);

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

		gl.drawArrays(gl.TRIANGLES, 0, positionVertices.length / 8);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(normalAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	return ufo;
}
async function createHouse(gl) {
	var house = {};

	var vertices = await fetchModel('models/20960_Front_Gable_House_v1_NEW.obj');

	house.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, house.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	house.draw = function (program) {
		var cAmbientUniformLocation = gl.getUniformLocation(program, 'cAmbient');
		gl.uniform3f(cAmbientUniformLocation, 0.23, 0.09, 0.03);

		var cDiffuseUniformLocation = gl.getUniformLocation(program, 'cDiffuse');
		gl.uniform3f(cDiffuseUniformLocation, 0.55, 0.21, 0.07);

		var cSpecularUniformLocation = gl.getUniformLocation(program, 'cSpecular');
		gl.uniform3f(cSpecularUniformLocation, 0.58, 0.22, 0.07);

		var alphaUniformLocation = gl.getUniformLocation(program, 'alpha');
		gl.uniform1f(alphaUniformLocation, 51.2);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);

		var positionAttribLocation = gl.getAttribLocation(program, 'vPosition');
		gl.vertexAttribPointer(
			positionAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			0 // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(positionAttribLocation);

		var normalAttribLocation = gl.getAttribLocation(program, 'vNormal');
		gl.vertexAttribPointer(
			normalAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			5 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(normalAttribLocation);

		var colorAttribLocation = gl.getAttribLocation(program, 'vColor');
		gl.vertexAttrib4f(colorAttribLocation, 1.0, 1.0, 1.0, 1.0);

		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(normalAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	return house;
}
async function createTree_krone(gl) {
	var tree_krone = {};

	var vertices = await fetchModel('models/tree_krone.obj');

	tree_krone.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tree_krone.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	tree_krone.draw = function (program) {

		var cAmbientUniformLocation = gl.getUniformLocation(program, 'cAmbient');
		gl.uniform3f(cAmbientUniformLocation, 0.09, 0.23, 0.03);

		var cDiffuseUniformLocation = gl.getUniformLocation(program, 'cDiffuse');
		gl.uniform3f(cDiffuseUniformLocation, 0.21, 0.55, 0.07);

		var cSpecularUniformLocation = gl.getUniformLocation(program, 'cSpecular');
		gl.uniform3f(cSpecularUniformLocation, 0.22, 0.58, 0.07);


		var alphaUniformLocation = gl.getUniformLocation(program, 'alpha');
		gl.uniform1f(alphaUniformLocation, 51.2);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);

		var positionAttribLocation = gl.getAttribLocation(program, 'vPosition');
		gl.vertexAttribPointer(
			positionAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			0 // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(positionAttribLocation);

		var normalAttribLocation = gl.getAttribLocation(program, 'vNormal');
		gl.vertexAttribPointer(
			normalAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			5 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(normalAttribLocation);

		var colorAttribLocation = gl.getAttribLocation(program, 'vColor');
		gl.vertexAttrib4f(colorAttribLocation, 1.0, 1.0, 1.0, 1.0);

		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(normalAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	return tree_krone;
}
async function createTree_stamm(gl) {
	var tree_stamm = {};

	var vertices = await fetchModel('models/tree_stam.obj');

	tree_stamm.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tree_stamm.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	tree_stamm.draw = function (program) {
		var cAmbientUniformLocation = gl.getUniformLocation(program, 'cAmbient');
		gl.uniform3f(cAmbientUniformLocation, 0.33, 0.19, 0.13);

		var cDiffuseUniformLocation = gl.getUniformLocation(program, 'cDiffuse');
		gl.uniform3f(cDiffuseUniformLocation, 0.65, 0.31, 0.17);

		var cSpecularUniformLocation = gl.getUniformLocation(program, 'cSpecular');
		gl.uniform3f(cSpecularUniformLocation, 0.68, 0.32, 0.17);

		var alphaUniformLocation = gl.getUniformLocation(program, 'alpha');
		gl.uniform1f(alphaUniformLocation, 51.2);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);

		var positionAttribLocation = gl.getAttribLocation(program, 'vPosition');
		gl.vertexAttribPointer(
			positionAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			0 // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(positionAttribLocation);

		var normalAttribLocation = gl.getAttribLocation(program, 'vNormal');
		gl.vertexAttribPointer(
			normalAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			5 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(normalAttribLocation);

		var colorAttribLocation = gl.getAttribLocation(program, 'vColor');
		gl.vertexAttrib4f(colorAttribLocation, 1.0, 1.0, 1.0, 1.0);

		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(normalAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	return tree_stamm;
}
let InitWorld = async function () {

	//
	// Canvas Vorbereiten
	//
	canvas = document.getElementById('myCanvasObject');
	gl = canvas.getContext('webgl');
	canvas.tabIndex = 1000;


	//
	//Eventlistener für die Camera-Bewegung
	//
	canvas.addEventListener("keydown", keyDown);
	canvas.addEventListener("keyup", keyUp);
	canvas.addEventListener("mousedown", mouseDown);
	canvas.addEventListener("mouseup", mouseUp);
	canvas.addEventListener("mouseleave", mouseUp);
	canvas.addEventListener("mouseleave", function () {
		mouseMiddleDistancX = 0;
		mouseMiddleDistancY = 0;
	});

	

	//
	// Create shader Programs
	// 
	let programOfCamera = createShaderAndProgram(gl, vertexShaderText, fragmentShaderText);
	// Create skybox texture
	const texture = createSkyBoxTexture(gl);

	// Create skybox___________
	console.log('Creating skybox ...');
	const skybox = createSkyBox(gl);
	skybox.texture = texture;
	skybox.program = await createShaderProgram(gl, 'skybox_vert.glsl', 'skybox_frag.glsl');
	if (!skybox.program) {
		console.error('Cannot run without shader program!');
		return;
	}

	// Create ufo___________
	console.log('Creating ufo object ...');
	let ufo = await createUfo(gl);
	ufo.texture = texture;
	ufo.program = await createShaderProgram(gl, 'ufo_vert.glsl', 'ufo_frag.glsl');
	if (!ufo.program) {
		console.error('ufo: Cannot run without shader program!');
		return;
	}
	gl.useProgram(ufo.program);
	ufo.positionAttribLocation = gl.getAttribLocation(ufo.program, 'vertPosition');
	ufo.colorAttribLocation = gl.getAttribLocation(ufo.program, 'vertColor');

	// Create houses___________
	let house = await createHouse(gl);
	//house.texture = texture;
	house.program = await createShaderProgram(gl, 'house_vert.glsl', 'house_frag.glsl');
	if (!house.program) {
		console.error('house: Cannot run without shader program!');
		return;
	}
	gl.useProgram(house.program);
	house.positionAttribLocation = gl.getAttribLocation(house.program, 'vertPosition');
	//house.colorAttribLocation = gl.getAttribLocation(house.program, 'vertColor');
	var lightDirUniformLocation = gl.getUniformLocation(house.program, 'lightDir');
	gl.uniform3f(lightDirUniformLocation, 0.0, 1.0, 1.0);

	house.matNormUniformLocation = gl.getUniformLocation(house.program, 'mNormal');
	house.normalMatrix = new Float32Array(9);
	var tmpMatrix = new Float32Array(16);

	// Create tree_stamm___________
	let tree_stamm = await createTree_stamm(gl);
	tree_stamm.program = await createShaderProgram(gl, 'tree_stamm_vert.glsl', 'tree_stamm_frag.glsl');
	if (!tree_stamm.program) {
		console.error('tree_stamm: Cannot run without shader program!');
		return;
	}
	gl.useProgram(tree_stamm.program);
	tree_stamm.positionAttribLocation = gl.getAttribLocation(tree_stamm.program, 'vertPosition');
	//tree_stamm.colorAttribLocation = gl.getAttribLocation(tree_stamm.program, 'vertColor');
	var lightDirUniformLocation = gl.getUniformLocation(tree_stamm.program, 'lightDir');
	gl.uniform3f(lightDirUniformLocation, 0.0, 1.0, 1.0);

	tree_stamm.matNormUniformLocation = gl.getUniformLocation(tree_stamm.program, 'mNormal');
	tree_stamm.normalMatrix = new Float32Array(9);
	var tmpMatrix = new Float32Array(16);

	// Create tree_krone___________
	let tree_krone = await createTree_krone(gl);
	tree_krone.program = await createShaderProgram(gl, 'tree_krone_vert.glsl', 'tree_krone_frag.glsl');
	if (!tree_krone.program) {
		console.error('tree_krone: Cannot run without shader program!');
		return;
	}
	gl.useProgram(tree_krone.program);
	tree_krone.positionAttribLocation = gl.getAttribLocation(tree_krone.program, 'vertPosition');
	//tree_krone.colorAttribLocation = gl.getAttribLocation(tree_krone.program, 'vertColor');
	var lightDirUniformLocation = gl.getUniformLocation(tree_krone.program, 'lightDir');
	gl.uniform3f(lightDirUniformLocation, 0.0, 1.0, 1.0);

	tree_krone.matNormUniformLocation = gl.getUniformLocation(tree_krone.program, 'mNormal');
	tree_krone.normalMatrix = new Float32Array(9);
	var tmpMatrix = new Float32Array(16);

	// Create terrain___________
	let terrain = await createTerrain(gl);
	terrain.program = await createShaderProgram(gl, 'terrain_vert.glsl', 'terrain_frag.glsl');
	if (!terrain.program) {
		console.error('terrain: Cannot run without shader program!');
		return;
	}
	gl.useProgram(terrain.program);
	terrain.positionAttribLocation = gl.getAttribLocation(terrain.program, 'vertPosition');
	terrain.colorAttribLocation = gl.getAttribLocation(terrain.program, 'vertColor');


	// Create ufo_light___________
	let ufo_light = await createUfo_light(gl);
	ufo_light.hallo = "hallo";
	console.log(ufo_light)
	ufo_light.program = await createShaderProgram(gl, 'ufoLight_vert.glsl', 'ufoLight_frag.glsl');
	if (!ufo_light.program) {
		console.error('ufo_light: Cannot run without shader program!');
		return;
	}
	gl.useProgram(ufo_light.program);
	ufo_light.positionAttribLocation = gl.getAttribLocation(ufo_light.program, 'vertPosition');
	ufo_light.colorAttribLocation = gl.getAttribLocation(ufo_light.program, 'vertColor');


	//
	// Prepare WebGL
	//
	console.log('This is working');
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST); // Aktiviert GL_DEPTH_TEST (If enabled, do depth comparisons and update the depth buffer. Note that even if the depth buffer exists and the depth mask is non-zero, the depth buffer is not updated if the depth test is disabled.)
	//gl.enable(gl.CULL_FACE); // Aktiviert Backface-Culling, wodurch die Hintere Seite des Poligons nicht mehr gerendert wird.
	gl.frontFace(gl.CCW); //frontFace(gl.CCW)Bestimmt die Poligonseite, welche als die Vordere oder hintere Seite angesehen wird, auf Grundlage der Richtung in welche sie gedreht wird.
	gl.cullFace(gl.BACK); // CullFace(gl.Back) stellt das Backface-Culling auf den Hinteren Poligon ein. Somit wird der Hintere nicht mehr gerändert.
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	//
	// Create a identity-modelWorldMatrix, a lookAt-Matrix and perspective and Connect them with there "GLSL Uniform-Variables"
	//
	let matWorldUniformLocation = gl.getUniformLocation(programOfCamera, 'mWorld');
	let matCameraUniformLocation = gl.getUniformLocation(programOfCamera, 'mView');
	let matProjUniformLocation = gl.getUniformLocation(programOfCamera, 'mProj');

	gl.useProgram(programOfCamera);
	let modelWorldMatrix = new Float32Array(16);
	glMatrix.mat4.identity(modelWorldMatrix);
	let viewMatrix = new Float32Array(16);
	glMatrix.mat4.identity(viewMatrix);
	glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, -4, -30]);
	let projMatrix = new Float32Array(16);
	glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(60), canvas.width / canvas.height, 0.1, 50000.0);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix); //
	gl.uniformMatrix4fv(matCameraUniformLocation, gl.FALSE, viewMatrix); //
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix); //Verbindet die Matrix-Variable mit der GLSL-Uniform-Variable gl.uniformMatrix4fv(Position des zu ändernden UniformAttributes, Matrix transponieren?


	//
	// render loop Vorbereiten
	//
	let pufferMatrix = new Float32Array(16);
	let angle = 0;
	let angleX = 0;
	let aktuellSpeed = 2;
	let myRandomArrayLengthHouses = 400;
	let myRandomArrayLengthTrees = 800;
	let myRandomArrayHouses = [];
	let myRandomArrayTrees = [];
	let myRandomArrayFloatHouses = [];
	let myRandomArrayFloatTrees = [];
	let myRandomArrayBoolHouses = [];
	let myRandomArrayBoolTrees = [];
	let houseTranslate1 = [];
	let houseTranslate2 = [];
	let treeTranslate1 = [];
	let treeTranslate2 = [];
	for (i = 0; i < 4; i++) {
		myRandomArrayHouses[i] = [];
		myRandomArrayBoolHouses[i] = [];
		for (j = 0; j < myRandomArrayLengthHouses; j++) {
			myRandomArrayHouses[i][j] = Math.floor(Math.random() * myRandomArrayLengthHouses * 3);
			myRandomArrayBoolHouses[i][j] = (-1) ** (j * Math.floor(Math.random() * 10));
		}
	}
	for (i = 0; i < myRandomArrayLengthHouses; i++) {
		myRandomArrayFloatHouses[i] = Math.random() * 2;
		houseTranslate1[i] = [myRandomArrayBoolHouses[0][i] * myRandomArrayHouses[0][i], 0, (myRandomArrayBoolHouses[1][i] * myRandomArrayHouses[1][i])];
		houseTranslate2[i] = [myRandomArrayBoolHouses[2][i] * myRandomArrayHouses[2][i], 0, (myRandomArrayBoolHouses[3][i] * myRandomArrayHouses[3][i])];
	}
	for (i = 0; i < 4; i++) {
		myRandomArrayTrees[i] = [];
		myRandomArrayBoolTrees[i] = [];
		for (j = 0; j < myRandomArrayLengthTrees; j++) {
			myRandomArrayTrees[i][j] = Math.floor(Math.random() * myRandomArrayLengthTrees * 3);
			myRandomArrayBoolTrees[i][j] = (-1) ** (j * Math.floor(Math.random() * 10));
		}
	}
	for (i = 0; i < myRandomArrayLengthTrees; i++) {
		myRandomArrayFloatTrees[i] = Math.random() * 2;
		treeTranslate1[i] = [myRandomArrayBoolTrees[0][i] * myRandomArrayTrees[0][i], 0, (myRandomArrayBoolTrees[1][i] * myRandomArrayTrees[1][i])];
		treeTranslate2[i] = [myRandomArrayBoolTrees[2][i] * myRandomArrayTrees[2][i], 0, (myRandomArrayBoolTrees[3][i] * myRandomArrayTrees[3][i])];
	}
	console.log(myRandomArrayBoolHouses);

	//
	// Main render loop
	//
	let myIdentityMatrix = new Float32Array(16);
	glMatrix.mat4.identity(myIdentityMatrix);

	function loop() {
		angle = performance.now() / 1000 / 6 * 2 * Math.PI; // "performance.now()" adiert ca. alle 5 Microsekunden (1 Sekunde = 1.000.000 Microsekunden) eine eins zurück. 360°=2*Math.PI


		// draw skybox

		gl.disable(gl.DEPTH_TEST);
		gl.useProgram(skybox.program);
		matProjUniformLocation = gl.getUniformLocation(skybox.program, 'mProj');
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

		matViewUniformLocation = gl.getUniformLocation(skybox.program, 'mView');
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

		glMatrix.mat4.identity(modelWorldMatrix);
		matWorldUniformLocation = gl.getUniformLocation(skybox.program, 'mWorld');
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);

		skybox.draw();
		gl.enable(gl.DEPTH_TEST);
		// draw Content


		//
		//__________Model World (Häuser auf Welt verteilt) Movement
		gl.useProgram(house.program);
		matProjUniformLocation = gl.getUniformLocation(house.program, 'mProj');
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

		matViewUniformLocation = gl.getUniformLocation(house.program, 'mView');
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

		glMatrix.mat4.identity(modelWorldMatrix);
		matWorldUniformLocation = gl.getUniformLocation(house.program, 'mWorld');
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);

		for (let i = 0; i < myRandomArrayLengthHouses - 2; i++) {

			glMatrix.mat4.identity(modelWorldMatrix);
			if (i % 2 == 0) {
				glMatrix.mat4.translate(modelWorldMatrix, modelWorldMatrix, houseTranslate1[i]);
			} else {
				glMatrix.mat4.translate(modelWorldMatrix, modelWorldMatrix, houseTranslate2[i]);
			}
			glMatrix.mat4.rotate(modelWorldMatrix, modelWorldMatrix, Math.PI * myRandomArrayFloatHouses[i], [0, 1, 0]);
			glMatrix.mat4.scale(modelWorldMatrix, modelWorldMatrix, [0.5, 0.5, 0.5]);


			glMatrix.mat4.multiply(tmpMatrix, viewMatrix, modelWorldMatrix);
			glMatrix.mat3.normalFromMat4(house.normalMatrix, tmpMatrix);

			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);
			gl.uniformMatrix3fv(house.matNormUniformLocation, gl.FALSE, house.normalMatrix);

			house.draw(house.program);
		}
		//
		//__________Model World (Tree Stamm auf Welt verteilt) Movement
		gl.useProgram(tree_stamm.program);
		matProjUniformLocation = gl.getUniformLocation(tree_stamm.program, 'mProj');
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

		matViewUniformLocation = gl.getUniformLocation(tree_stamm.program, 'mView');
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

		glMatrix.mat4.identity(modelWorldMatrix);
		matWorldUniformLocation = gl.getUniformLocation(tree_stamm.program, 'mWorld');
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);

		for (let i = 0; i < myRandomArrayLengthTrees - 2; i++) {

			glMatrix.mat4.identity(modelWorldMatrix);
			if (i % 2 == 0) {
				glMatrix.mat4.translate(modelWorldMatrix, modelWorldMatrix, treeTranslate1[i]);
			} else {
				glMatrix.mat4.translate(modelWorldMatrix, modelWorldMatrix, treeTranslate2[i]);
			}
			glMatrix.mat4.rotate(modelWorldMatrix, modelWorldMatrix, Math.PI * myRandomArrayFloatTrees[i], [0, 1, 0]);
			glMatrix.mat4.scale(modelWorldMatrix, modelWorldMatrix, [0.5, 0.5, 0.5]);


			glMatrix.mat4.multiply(tmpMatrix, viewMatrix, modelWorldMatrix);
			glMatrix.mat3.normalFromMat4(tree_stamm.normalMatrix, tmpMatrix);

			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);
			gl.uniformMatrix3fv(tree_stamm.matNormUniformLocation, gl.FALSE, tree_stamm.normalMatrix);

			tree_stamm.draw(tree_stamm.program);
		}

		//
		//__________Model World (Tree Krone auf Welt verteilt) Movement
		gl.useProgram(tree_krone.program);
		matProjUniformLocation = gl.getUniformLocation(tree_krone.program, 'mProj');
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

		matViewUniformLocation = gl.getUniformLocation(tree_krone.program, 'mView');
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

		glMatrix.mat4.identity(modelWorldMatrix);
		matWorldUniformLocation = gl.getUniformLocation(tree_krone.program, 'mWorld');
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);

		for (let i = 0; i < myRandomArrayLengthTrees - 2; i++) {

			glMatrix.mat4.identity(modelWorldMatrix);
			if (i % 2 == 0) {
				glMatrix.mat4.translate(modelWorldMatrix, modelWorldMatrix, treeTranslate1[i]);
			} else {
				glMatrix.mat4.translate(modelWorldMatrix, modelWorldMatrix, treeTranslate2[i]);
			}
			glMatrix.mat4.rotate(modelWorldMatrix, modelWorldMatrix, Math.PI * myRandomArrayFloatTrees[i], [0, 1, 0]);
			glMatrix.mat4.scale(modelWorldMatrix, modelWorldMatrix, [0.5, 0.5, 0.5]);

			glMatrix.mat4.multiply(tmpMatrix, viewMatrix, modelWorldMatrix);
			//mat4.identity(tmpMatrix);
			glMatrix.mat3.normalFromMat4(tree_krone.normalMatrix, tmpMatrix);

			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);
			gl.uniformMatrix3fv(tree_krone.matNormUniformLocation, gl.FALSE, tree_krone.normalMatrix);

			tree_krone.draw(tree_krone.program);
		}

		//
		//___________Camera Movements
		gl.useProgram(programOfCamera);
		matProjUniformLocation = gl.getUniformLocation(programOfCamera, 'mProj');
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

		matViewUniformLocation = gl.getUniformLocation(programOfCamera, 'mView');
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

		//glMatrix.mat4.identity(modelWorldMatrix);
		matWorldUniformLocation = gl.getUniformLocation(programOfCamera, 'mWorld');
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);

		cameraMovementYDown = (viewMatrix[13] > (-7)) ? (upDirectionStatus * 3) : ((downDirectionStatus * (-3)) + (upDirectionStatus * 3));
		document.getElementById("Ymovement").innerHTML = cameraMovementYDown;
		cameraMovementVektor = [
			leftDirectionStatus * (-aktuellSpeed) + rightDirectionStatus * aktuellSpeed,
			cameraMovementYDown / 5,
			frontDirectionStatus * (-aktuellSpeed) + backDirectionStatus * aktuellSpeed
		];
		glMatrix.mat4.invert(viewMatrix, viewMatrix);
		glMatrix.mat4.translate(viewMatrix, viewMatrix, cameraMovementVektor);
		if (mouseMiddleDistancX < (-20)) {
			angleX = ((2 * Math.PI) * (mouseMiddleDistancX + 20)) / (canvas.width / 2);
		} else if (mouseMiddleDistancX > 20) {
			angleX = ((2 * Math.PI) * (mouseMiddleDistancX - 20)) / (canvas.width / 2);
		} else {
			angleX = 0;
		}
		glMatrix.mat4.rotate(viewMatrix, viewMatrix, -angleX / 50, [0, 1, 0]);

		gl.useProgram(programOfCamera);
		gl.uniformMatrix4fv(matCameraUniformLocation, gl.FALSE, viewMatrix);

		glMatrix.mat4.identity(modelWorldMatrix);
		glMatrix.mat4.translate(modelWorldMatrix, viewMatrix, [0, -8, -18]);
		glMatrix.mat4.invert(viewMatrix, viewMatrix);


		//
		//__________Ufo Light Drawing
		if (spaceDirectionStatus == 1) {
			gl.useProgram(ufo_light.program);
			matProjUniformLocation = gl.getUniformLocation(ufo_light.program, 'mProj');
			gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

			matViewUniformLocation = gl.getUniformLocation(ufo_light.program, 'mView');
			gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

			matWorldUniformLocation = gl.getUniformLocation(ufo_light.program, 'mWorld');
			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);

			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);
			ufo_light.draw(ufo_light.positionAttribLocation, ufo_light.colorAttribLocation, modelWorldMatrix[13]);
		}

		//
		//___________Model World (Main_Ufo) Movement
		gl.useProgram(ufo.program);

		let invViewMatrix = new Float32Array(9);
		glMatrix.mat3.fromMat4(invViewMatrix, viewMatrix);
		glMatrix.mat3.invert(invViewMatrix, invViewMatrix);
		let eyeDir = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);
		glMatrix.vec3.transformMat3(eyeDir, eyeDir, invViewMatrix);

		let eyeDirUniformLocation = gl.getUniformLocation(ufo.program, 'eyeDir');
		gl.uniform3fv(eyeDirUniformLocation, eyeDir);

		matProjUniformLocation = gl.getUniformLocation(ufo.program, 'mProj');
		gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

		matViewUniformLocation = gl.getUniformLocation(ufo.program, 'mView');
		gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

		matWorldUniformLocation = gl.getUniformLocation(ufo.program, 'mWorld');
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);

		glMatrix.mat4.rotate(modelWorldMatrix, modelWorldMatrix, 0.1, [frontDirectionStatus * (-1) + backDirectionStatus, 0, leftDirectionStatus + rightDirectionStatus * (-1)]);
		glMatrix.mat4.rotate(modelWorldMatrix, modelWorldMatrix, angle * 5, [0, 1, 0]);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);
		ufo.draw();

		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);

		let testTextAusgabe3 = "viewMatrix - koordinate: " + viewMatrix[12] + " | " + viewMatrix[13] + " | " + viewMatrix[14];
		document.getElementById("cameraPositionstestTextAusgabe3").innerHTML = testTextAusgabe3;
		let hausTextAusgabe4 = "Ufo - koordinate: " + modelWorldMatrix[12] + " | " + modelWorldMatrix[13] + " | " + modelWorldMatrix[14];
		document.getElementById("objectPositionstestTextAusgabe4").innerHTML = hausTextAusgabe4;


		requestAnimationFrame(loop); //requestAnimationFrame ruft vor jedem erneuten Rendern (»Refresh«) des Browserfensters die Animations-Funktion auf und erzeugt so einen weichen Übergang von einem Frame zum nächsten. Mit requestAnimationFrame anstelle von setInterval oder setTimeout übernimmt der Browser die Schnittstelle und optimiert das Verfahren, so dass Animationen runder, ohne Ruckeln und effizienter ablaufen. Wenn der Benutzer zu einem anderen Tab wechselt, kann der Browser die Animation pausieren, um die CPU weniger zu belasten.
	}
	loop();
};