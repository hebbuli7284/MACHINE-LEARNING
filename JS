// Created by KARTHIK

/*Machine Learning visualized by KARTHIK

----Updates----
- Added speed slider
- Added batch slider (meaning how many times the result is used to train the AI)
- "Loading" bar while AI is being trained
- Added animation when AI chooses correctly

If AI makes same decision over and over when you have zero batch-number, you have to train it more!;-)

----Program explained----
The AI controls the blue box! The goal is that the blue box prevents the sphere from falling down.

As the code starts, the AI does many mistakes, but every time the loop runs, the AI becomes smarter.

After many iterations the AI will do close to NO mistake at all!

This is the power of machine learning. The machine learns!

I hope you like this machine learning visualization!

Note:
All input and corresponding output is stored into an array, and the code will most likely become slower after many iterations.

----Plans----
- Better graphics

*/
$(document).ready(function() {

console.log=function(){};
const SCALE = 27;
const PI = Math.PI;
var randPos;

//Camera values
const FOV = 45;
const ASPECT = window.innerWidth/window.innerHeight;
const NEAR = 0.1;
const FAR = 2000;

// ********** Creating the scene: **********
var renderer = new THREE.WebGLRenderer({ antialias: true }); //Creates a WebGL renderer using threejs library
renderer.setPixelRatio( window.devicePixelRatio ); //Prevents blurry output
renderer.setSize( window.innerWidth,window.innerHeight ); //Sets renderer size to the size of the window
renderer.setClearColor(0xA9F5F2, 1); //Makes the background color of the scene blue
renderer.shadowMapEnabled = true;
renderer.shadowMapSoft = true;
document.body.appendChild( renderer.domElement ); //Attaches renderer to DOM (initializes renderer)

var scene = new THREE.Scene(); //Creates an empty scene where we are going to add our objects

var camera = new THREE.PerspectiveCamera( FOV,ASPECT,NEAR,FAR ); //Creates a camera
camera.up.set( 0,-0.5,1 ); //Sets the camera the correct direction
camera.rotation.x=-PI/4;
scene.add( camera ); //Adds the camera to the scene

var controls = new THREE.OrbitControls( camera, renderer.domElement ); //OrbitControls allows camera to be controlled and orbit around a target
controls.minDistance = 2100/SCALE; //Sets the minimum distance one can pan into the scene
controls.enabled=false;
controls.update();

var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight); //Adding ambient light
var light = new THREE.DirectionalLight( 0xffffff, 1);
light.position.set(0, 0, 5);
light.castShadow = true;

var d = 25;
light.shadowCameraLeft = d;
light.shadowCameraRight = -d;
light.shadowCameraTop = d;
light.shadowCameraBottom = -d;

scene.add(light);

//var helper = new THREE.CameraHelper( light.shadow.camera );
//scene.add( helper );


// ********** Initialize GUI (Graphical user interface) **********
    var gui = new dat.GUI();
    var guiParams = { //Sets the variable names and default values of the GUI
        Speed : 0,
        Batch : 1,
    };
        
gui.add(guiParams, 'Speed').min(0).max(10).step(1);
gui.add(guiParams, 'Batch').min(0).max(5).step(1);
var batchNumber = guiParams.Batch;

var width  = 43; //width of ground
var length = 43; //length of ground

var geometry = new THREE.PlaneGeometry( width, length); //ThreeJS function to create plane geometry

var groundmat = new THREE.MeshLambertMaterial({ //Sets color and material attributes for plane
    color: 0x088A08,
    side: THREE.DoubleSide //Ground visible from both sides
});
var ground = new THREE.Mesh( geometry, groundmat ); //Creates a mesh containing the geometry and groundmaterial just defined
ground.receiveShadow = true;
ground.position.z=-2.5;
scene.add( ground ); //Adds ground to scene

function spawnFigure(posX,posY,fig,myColor){

if (fig=="Cube"){
        var geometry = new THREE.BoxGeometry( 5, 5, 5);
}
else{
        var geometry = new THREE.SphereGeometry( 2,32, 32);
}

    var material = new THREE.MeshLambertMaterial({

color:myColor,
transparent:true,
opacity:1
    
});

var figure = new THREE.Mesh( geometry, material );

scene.add( figure );
figure.position.x=posX;
figure.position.y=posY;
figure.castShadow = true;
figure.receiveShadow=false;
return figure;
}

var figArray = [];
figArray.push(spawnFigure(0,-2.5+width/2,"Cube","blue"));

figArray.push(spawnFigure(0,-width/2,"Sphere","red"));

const network = new brain.NeuralNetwork();
var trainArray=[];

// This is the only input to the AI! It learns as the code runs! (see aiFunction)
 network.train([
    { input: { sphere:0.67,cube:0.67}, output: { save: 1 } },
  ])

var sphereInput;
var cubePosX;
var saveBool=1;
var speed=0.5;
var aiMistakes = document.getElementById("lostPoints");
var myLoader = document.getElementById("loader");
var aiMistakesCount=0;
var animateVar = 0;
var leftRight = 1;
function aiFunction(posX,batch){
saveBool=0;

//Running AI so it can determine where to position itself
var result=[network.run({sphere:posX,cube:0.33}),network.run({sphere:posX,cube:0.67}),network.run({sphere:posX,cube:1})];

//console.log(result[0].save);
//console.log(result[1].save);
//console.log(result[2].save+"\n");

//Based on the AI prediction, position the cube
if (result[0].save > result[1].save && result[0].save > result[2].save){
    cubePosX=0.33;
}
else if (result[1].save > result[0].save && result[1].save > result[2].save){
     cubePosX=0.67;
}
else if (result[2].save > result[0].save && result[2].save > result[1].save){
     cubePosX=1;
}

//To prevent AI from getting stuck because 0.0005>0.0004, shift position when unsure
if (result[0].save<0.1 && result[1].save<0.1 && result[2].save<0.1){

    if (cubePosX==0.33){
         cubePosX=0.67;
     }
     else if(cubePosX==0.67){
         cubePosX=1;
     }
     else{
         cubePosX=0.33;
     }
}

// If AI chose correct, tell it that its a good decision!
if (cubePosX == posX){
    saveBool=1;
}
else{
    aiMistakesCount+=1;
    aiMistakes.innerHTML = "Mistakes: " + aiMistakesCount;
}

if (batch>0){
for (i=0;i<batch;i++){
    trainArray.push({
         input: { sphere:posX,cube:cubePosX}, output: { save: saveBool },
    })
}

network.train(trainArray);
}
}

function cubeTranslate(){

    if(cubePosX==0.33){
        if(figArray[0].position.x>-10 ){
        figArray[0].position.x-=guiParams.Speed/5;
    }
}

else if(cubePosX==0.67){
    if(figArray[0].position.x<-1 ){
        figArray[0].position.x+=guiParams.Speed/5;
    }
    else if(figArray[0].position.x>1){
    figArray[0].position.x-=guiParams.Speed/5;
}
}

else if(cubePosX==1){
    if(figArray[0].position.x<10 ){
        figArray[0].position.x+=guiParams.Speed/5;
    }
}
}

swal({
title: "Machine Learning",
text: "The AI controls the blue box and the goal is to prevent the ball from rolling outside!\n\nUse the GUI to choose speed and batch! When you are done training the AI you can choose a batch of zero to see how it performs!",
closeOnClickOutside: false,
});

function newSphere(){
    randPos=Math.floor(Math.random() * 3) + 1;
    figArray[1].position.y=-width/2;
    
    switch (randPos){
        case 1:
        figArray[1].position.x=-10;
        break;
        case 2:
        figArray[1].position.x=0;
        break;
        case 3:
        figArray[1].position.x=10;
        break;
    }
    
    batchNumber = guiParams.Batch;
    aiFunction(Math.round((randPos/3) * 100) / 100,batchNumber); //convert to number between 0-1
}

function animate(){
    
    if (cubePosX==0.33){
        figArray[1].position.x-=guiParams.Speed/5;
    }
    else if (cubePosX==1)
    {
        figArray[1].position.x+=guiParams.Speed/5;
    }
    else if(leftRight == 1){
        figArray[1].position.x+=guiParams.Speed/5;
    }
    else
    {
        figArray[1].position.x-=guiParams.Speed/5;
    }

    figArray[1].position.y-=guiParams.Speed/5;
    
    if (Math.abs(figArray[1].position.x) >= 40){
        newSphere();
        leftRight = leftRight * -1;
        animateVar = 0;
    }
}
    //********** Render function **********
var render = function () 
    {
requestAnimationFrame(render); //render function is called every frame!

if (animateVar == 0){
    figArray[1].position.y+=guiParams.Speed/5;
}

if(figArray[1].position.y>=figArray[0].position.y){
    newSphere();
}
else if(figArray[1].position.y>=figArray[0].position.y-3.5){
    if  (batchNumber>0){
        myLoader.style.display = "inline";
    }
    
    if ( saveBool == 1 )
    {
       animateVar = 1;
    }
}
else if(figArray[1].position.y>=1-width/2 && animateVar == 0){
    myLoader.style.display = "none";
}
cubeTranslate();

if (animateVar == 1){
    animate();
}
        
        renderer.render(scene, camera); //We need this in the loop to perform the rendering
    };
render();
});

//Made by KARTHIK
