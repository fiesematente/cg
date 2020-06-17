let vertexShaderText = 
[
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',  //
'uniform mat4 viewGLSL;',  //
'uniform mat4 projGLSL;',  //

'',
'void main()',
'{',
'  ',
'  fragColor = vertColor;',
'  gl_Position = projGLSL * viewGLSL * mWorld * vec4(vertPosition, 1.0);', //
'}'
].join('\n');

let fragmentShaderText =
[
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}'
].join('\n');

//
// Canvas Vorbereiten
//
let canvas = document.getElementById('myCanvasObject');
let gl = canvas.getContext('webgl');
gl.canvas.getContext("webgl", {
	premultipliedAlpha: false
});
canvas.tabIndex = 1000;
canvas.addEventListener("keydown", keyDown);
canvas.addEventListener("keyup", keyUp);
canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("mouseup", mouseUp);
canvas.addEventListener("mouseleave", mouseUp);
canvas.addEventListener("mouseleave", function(){mouseMiddleDistancX=0; mouseMiddleDistancY=0;})


//
//Eventlistener für die Camera-Bewegung
//
let whichKeyButton = 5;
let mouseButtonStatus = 0;
let whichMouseButton = 5; //auf 0,1,2,3,4 kann man catchen deshalb nicht diese Verwenden zum initialisieren.
let mouseMiddleDistancX = 0;
let mouseMiddleDistancY = 0;
let frontDirectionStatus = 0;
let backDirectionStatus = 0;
let leftDirectionStatus = 0;
let rightDirectionStatus = 0;
let downDirectionStatus = 0;
let upDirectionStatus = 0;
let xRotationRadiant;
let yRotationRadiant;
let testTextAusgabe = "MausPosition";
let testTextAusgabe2 = "Testausgabe";
let cameraMovementVektor = [0.0, 0.0, 0.0];


function keyDown(event){
	whichKeyButton = event.key;
	if(whichKeyButton=="w"){
		frontDirectionStatus = 1;
	}
	if(whichKeyButton=="s"){
		backDirectionStatus = 1;
	}
	if(whichKeyButton=="a"){
		leftDirectionStatus = 1;
	}
	if(whichKeyButton=="d"){
		rightDirectionStatus = 1;
	}
	testTextAusgabe2 = "keyButtonStatus: " + (frontDirectionStatus+backDirectionStatus+leftDirectionStatus+rightDirectionStatus);
	document.getElementById("keyPositionstestTextAusgabe2").innerHTML = testTextAusgabe2;
	
}
function keyUp(event){
	whichKeyButton = event.key;
	if(whichKeyButton=="w"){
		frontDirectionStatus = 0;
	}
	if(whichKeyButton=="s"){
		backDirectionStatus = 0;
	}
	if(whichKeyButton=="a"){
		leftDirectionStatus = 0;
	}
	if(whichKeyButton=="d"){
		rightDirectionStatus = 0;
	}
	testTextAusgabe2 = "keyButtonStatus: " + (frontDirectionStatus+backDirectionStatus+leftDirectionStatus+rightDirectionStatus) + ", whichKeyButton: ";
	document.getElementById("keyPositionstestTextAusgabe2").innerHTML = testTextAusgabe2;
}
function mouseDown(event){
	whichMouseButton = event.button;
	if(whichMouseButton==0){
		upDirectionStatus = 1;
	}
	if(whichMouseButton==2){
		downDirectionStatus = 1;
	}
	testTextAusgabe2 = "upDirectionStatus: " + (upDirectionStatus) + " downDirectionStatus: " + (downDirectionStatus) + " whichMouseButton: " + (whichMouseButton);
	document.getElementById("keyPositionstestTextAusgabe2").innerHTML = testTextAusgabe2;
}
function mouseUp(event){
	whichMouseButton = event.button;
	if(whichMouseButton==0){
		upDirectionStatus = 0;
	}
	if(whichMouseButton==2){
		downDirectionStatus = 0;
	}
	testTextAusgabe2 = "upDirectionStatus: " + (upDirectionStatus) + " downDirectionStatus: " + (downDirectionStatus) + " whichMouseButton: " + (whichMouseButton);
	document.getElementById("keyPositionstestTextAusgabe2").innerHTML = testTextAusgabe2;
}
function mouseMoving(event) {
	let x = event.offsetX;
	let y = event.offsetY;
	mouseMiddleDistancX = x-(canvas.width/2);
	mouseMiddleDistancY = y-(canvas.height/2);
	testTextAusgabe = "X coords: " + mouseMiddleDistancX + ", mouseMiddleDistancY: " + mouseMiddleDistancY;
	document.getElementById("mausPositionstestTextAusgabe").innerHTML = testTextAusgabe;
}
function createShaderAndProgram(gl, vertexShaderText, fragmentShaderText){
	
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

	gl.useProgram(program); // Tell OpenGL state machine which program should be active.

	return program;
}
async function fetchModel(location) {
	
	// fetch is explained at https://www.youtube.com/watch?v=tc8DU14qX6I.
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
			v.push(data.map(x=>{return parseFloat(x)}));
		}
		else if (type == 'vt') {
			vt.push(data.map(x=>{return parseFloat(x)}));
		}
		else if (type == 'vn') {
			vn.push(data.map(x=>{return parseFloat(x)}));
		}
		else if (type == 'f') {
			for (fp of data) {
				var idx = fp.split('/').map(x=>{return parseInt(x)});
				v[idx[0]-1].forEach(x=>{vbo.push(x)});
				vt[idx[1]-1].forEach(x=>{vbo.push(x)});
				vn[idx[2]-1].forEach(x=>{vbo.push(x)});
			}
		}
	}

	/*console.log("_______________________________________");
	console.log("_______________________________________");
	console.log("_______________V_______________");
	console.log(v);
	console.log("_______________Vt_______________");
	console.log(vt);
	console.log("_______________Vn_______________");
	console.log(vn);
	console.log("_______________Vbo_______________");
	console.log(vbo);
	console.log("_______________________________________");
	console.log("_______________________________________");*/

	return vbo;
}
async function houseColorVertexRandom(quadFaceNumber){
	let vertColor = [];
	let houseColVertices = [];
	for (let face = 0; face < quadFaceNumber; face++){
		if(face != 1){
			vertColor = [Math.random(), Math.random(), Math.random()];
		}
		for (let vertex = 0; vertex < 4; vertex++){
			houseColVertices = houseColVertices.concat(vertColor);
		}
	}
	console.log(houseColVertices);
	return houseColVertices;
}
async function createUfo(gl){
	let ufo = {};
	
	let positionVertices = await fetchModel('models/ufo.obj');

	ufo.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, ufo.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	ufo.draw = function(positionAttribLocation, colorAttribLocation){
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(colorAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, ufo.vertexBufferObject);
		gl.vertexAttribPointer(positionAttribLocation,	3, gl.FLOAT, gl.FALSE, 8 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);
		gl.drawArrays(gl.TRIANGLES, 0, positionVertices.length/8);
		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(colorAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	return ufo;
}
async function createHouse(gl){
	let house = {};
	
let positionVertices =                       // mehrere Vertices für mehrere die Dreiecke aus denen jeweils die Vierecke bestehen.
[ // X,    Y,    Z

	// Top_Right
	0.0, 2.0, -1.0,
	0.0, 2.0, 1.0,
	1.0, 1.0, 1.0,
	1.0, 1.0, -1.0,

	// Top_left
	-1.0, 1.0, -1.0,
	-1.0, 1.0, 1.0,
	0.0, 2.0, 1.0,
	0.0, 2.0, -1.0,

	// Left
	-1.0, 1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, -1.0, -1.0,
	-1.0, 1.0, -1.0,

	// Right
	1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,
	1.0, -1.0, -1.0,
	1.0, 1.0, -1.0,

	// Front
	1.0, 1.0, 1.0,
	1.0, -1.0, 1.0,
	-1.0, -1.0, 1.0,
	-1.0, 1.0, 1.0,

	// Back
	1.0, 1.0, -1.0,
	1.0, -1.0, -1.0,
	-1.0, -1.0, -1.0,
	-1.0, 1.0, -1.0,

	// Bottom
	-1.0, -1.0, -1.0,
	-1.0, -1.0, 1.0,
	1.0, -1.0, 1.0,
	1.0, -1.0, -1.0,
];
let colorVertices = [
	// R,   G,   B
	// Top_Right
	1.0, 1.0, 0.0,
	1.0, 1.0, 0.0,
	1.0, 1.0, 0.0,
	1.0, 1.0, 0.0,

	// Top_Left
	1.0, 1.0, 0.0,
	1.0, 1.0, 0.0,
	1.0, 1.0, 0.0,
	1.0, 1.0, 0.0,

	// Left
	1.0, 0.0, 1.0,
	1.0, 0.0, 1.0,
	1.0, 0.0, 1.0,
	1.0, 0.0, 1.0,

	// Right
	0.0, 1.0, 1.0,
	0.0, 1.0, 1.0,
	0.0, 1.0, 1.0,
	0.0, 1.0, 1.0,

	// Front
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,
	1.0, 0.0, 0.0,

	// Back
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,
	0.0, 1.0, 0.0,

	// Bottom
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,
	0.0, 0.0, 1.0,
];
let vertexVerbindungsIndices =                       // Index-List um zu bestimmen welche Vertices zu welchem Dreieck bzw viereck gehört.
[
	// Top_Right                            Erstes Viereck
	0, 1, 2,                                //erstes (1von2) zum Viereck gehörendes Dreieck
	0, 2, 3,                                //zweites (2von2) zum Viereck gehörendes Dreieck

	// Top_Left                            	//
	4, 5, 6,
	4, 6, 7,

	// Left                                 //   ...
	9, 8, 10,
	10, 8, 11,

	// Right                                //   ...
	12, 13, 14,
	12, 14, 15,

	// Front                                //   ...
	17, 16, 18,
	19, 18, 16,

	// Back                                 //   ...
	20, 21, 22,
	20, 22, 23,

	// Bottom                               //   ...
	25, 24, 26,
	26, 24, 27
];
//
//Buffer erstellen und mit den Daten füllen
house.vertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, house.vertexBufferObject);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positionVertices), gl.STATIC_DRAW);

house.indexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, house.indexBufferObject);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexVerbindungsIndices), gl.STATIC_DRAW);

house.colorBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, house.colorBufferObject);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorVertices), gl.STATIC_DRAW);

//Daten Buffern und Array-Buffer vor der wiederverwendung mit Farben löschen


house.draw = function(positionAttribLocation, colorAttribLocation){

	gl.enableVertexAttribArray(positionAttribLocation); // Vertex_1
	gl.bindBuffer(gl.ARRAY_BUFFER, house.vertexBufferObject); // Vertex_2
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, house.indexBufferObject); // Color__
	gl.vertexAttribPointer(positionAttribLocation,	3, gl.FLOAT, gl.FALSE, 0, 0); // Vertex_3

	gl.enableVertexAttribArray(colorAttribLocation); // Color_1
	gl.bindBuffer(gl.ARRAY_BUFFER, house.colorBufferObject); // Color_2
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, house.indexBufferObject); // Color__
	gl.vertexAttribPointer(colorAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0); // Color_3
	
	gl.drawElements(gl.TRIANGLES, vertexVerbindungsIndices.length, gl.UNSIGNED_SHORT, 0);
	
	gl.disableVertexAttribArray(positionAttribLocation);
	gl.disableVertexAttribArray(colorAttribLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
};
return house;
}
let InitDemo = async function () {
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


//
// Create shaders
// 
	let program1 = createShaderAndProgram(gl, vertexShaderText, fragmentShaderText)


//
// Create Objects
//
	// Create ufo
	console.log('Creating ufo object ...');
	var ufo = await createUfo(gl);
	// Create house
	console.log('Creating ufo object ...');
	var house = await createHouse(gl);

//
// Configure OpenGL state machine
//
	gl.useProgram(program1);
	var positionAttribLocation = gl.getAttribLocation(program1, 'vertPosition');
	var colorAttribLocation = gl.getAttribLocation(program1, 'vertColor');
//
// Create a identity-modelWorldMatrix, a lookAt-Matrix and perspective and Connect them with there "GLSL Uniform-Variables"
//
	let matWorldUniformLocation = gl.getUniformLocation(program1, 'mWorld');
	let matCameraUniformLocation = gl.getUniformLocation(program1, 'viewGLSL');
	let matProjUniformLocation = gl.getUniformLocation(program1, 'projGLSL');
	let modelWorldMatrix = new Float32Array(16);
	glMatrix.mat4.identity(modelWorldMatrix);
	let viewMatrix = new Float32Array(16);
	glMatrix.mat4.identity(viewMatrix);
	let projMatrix = new Float32Array(16);
	glMatrix.mat4.perspective(projMatrix, glMatrix.glMatrix.toRadian(90), canvas.width / canvas.height, 0.1, 1000.0);
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix); //
	gl.uniformMatrix4fv(matCameraUniformLocation, gl.FALSE, viewMatrix); //
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix); //Verbindet die Matrix-Variable mit der GLSL-Uniform-Variable gl.uniformMatrix4fv(Position des zu ändernden UniformAttributes, Matrix transponieren?
	
//
// render loop Vorbereiten
//
	let angle = 0;
	let maxViewTranslateSpeed = 5.00;
	let aktuellSpeed = 0;
	let myRandomArrayLength = 300;
	let myRandomArray1 = [];
	let myRandomArray2 = [];
	let myRandomArray3 = [];
	for (i=0; i < myRandomArrayLength; i++){
		myRandomArray1[i]=Math.random();
	}
	for (i=0; i < myRandomArrayLength; i++){
		myRandomArray2[i]=Math.random();
	}
	for (i=0; i < myRandomArrayLength; i++){
		myRandomArray3[i]=Math.random();
	}
//
// Main render loop
//
	function loop(){
		gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT); //Color-Buffer zurücksetzen
		angle = performance.now() / 1000 / 6 * 2 * Math.PI; // "performance.now()" adiert ca. alle 5 Microsekunden (1 Sekunde = 1.000.000 Microsekunden) eine eins zurück. 360°=2*Math.PI
		
		
		//
		//___________Camera Movements
		if(maxViewTranslateSpeed)
		cameraMovementVektor = [
			leftDirectionStatus*(-3)+rightDirectionStatus*3,
			downDirectionStatus*(-3)+upDirectionStatus*3,	//___________________Verstehe ich nicht warum [1] nicht + und - verdreht sein muss _____________________________________________________
			frontDirectionStatus*(-3)+backDirectionStatus*3
		];
		glMatrix.mat4.invert(viewMatrix, viewMatrix);
		glMatrix.mat4.translate(viewMatrix, viewMatrix, cameraMovementVektor);
		gl.uniformMatrix4fv(matCameraUniformLocation, gl.FALSE, viewMatrix);

		//gl.depthMask(true);

		//
		//___________Model World (Main_Ufo) Movement

		glMatrix.mat4.identity(modelWorldMatrix);
		glMatrix.mat4.translate(modelWorldMatrix, viewMatrix, [0,-8,-15]);
		glMatrix.mat4.invert(viewMatrix, viewMatrix);
		gl.uniformMatrix4fv(matCameraUniformLocation, gl.FALSE, viewMatrix);
		glMatrix.mat4.rotate(modelWorldMatrix, modelWorldMatrix, 0.1, [frontDirectionStatus*(-1)+backDirectionStatus, 0, leftDirectionStatus+rightDirectionStatus*(-1)]);
		glMatrix.mat4.rotate(modelWorldMatrix, modelWorldMatrix, angle *5, [0, 1, 0]);
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);
		ufo.draw(positionAttribLocation, colorAttribLocation);
		
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);

		let testTextAusgabe3 = "viewMatrix - koordinate: " + viewMatrix[12] +" | "+ viewMatrix[13] +" | "+ viewMatrix[14];
		document.getElementById("cameraPositionstestTextAusgabe3").innerHTML = testTextAusgabe3;
		let hausTextAusgabe4 = "HausMatrix - koordinate: " + modelWorldMatrix[12] +" | "+ modelWorldMatrix[13] +" | "+ modelWorldMatrix[14];
		document.getElementById("objectPositionstestTextAusgabe4").innerHTML = hausTextAusgabe4;
		//
		//__________Model World (Häuser auf Welt verteilt) Movement
		
		for(let i=0;i<myRandomArrayLength-2;i++){
			
			glMatrix.mat4.identity(modelWorldMatrix);
			if(i%2==0){
				glMatrix.mat4.translate(modelWorldMatrix, modelWorldMatrix, [(myRandomArray2[i])*(((myRandomArrayLength-i)*5)*(-1)**i),0,(myRandomArray3[i])*(((myRandomArrayLength-i)*5)*(-1)**i)]);
			}else{
				glMatrix.mat4.translate(modelWorldMatrix, modelWorldMatrix, [(myRandomArray2[i])*((i*5)*(-1)**(myRandomArrayLength-i)),0,(myRandomArray3[i])*(((myRandomArrayLength-i)*5)*(-1)**i)]);
			}
			glMatrix.mat4.rotate(modelWorldMatrix, modelWorldMatrix, Math.PI * myRandomArray1[i], [0, 1, 0]);
			glMatrix.mat4.scale(modelWorldMatrix, modelWorldMatrix,[3, 3, 3]);

			//glMatrix.mat4.scale(modelWorldMatrix, modelWorldMatrix, [myRandom1[i],myRandom1[i],myRandom1[i]]);
			gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, modelWorldMatrix);
			
			house.draw(positionAttribLocation, colorAttribLocation);


		}
		requestAnimationFrame(loop); //requestAnimationFrame ruft vor jedem erneuten Rendern (»Refresh«) des Browserfensters die Animations-Funktion auf und erzeugt so einen weichen Übergang von einem Frame zum nächsten. Mit requestAnimationFrame anstelle von setInterval oder setTimeout übernimmt der Browser die Schnittstelle und optimiert das Verfahren, so dass Animationen runder, ohne Ruckeln und effizienter ablaufen. Wenn der Benutzer zu einem anderen Tab wechselt, kann der Browser die Animation pausieren, um die CPU weniger zu belasten.
	}
	loop();
};
