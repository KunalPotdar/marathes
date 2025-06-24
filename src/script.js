import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Post-processing imports removed

// Get model from URL (either ?model= or #)
function getModelFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('model') || window.location.hash.replace('#', '') || 'project1';
}

let floorBoxes = {}; // Store references to each box

// Scene, Camera, Renderer setup
const scene = new THREE.Scene();
 scene.background = new THREE.Color(0xffffff); 
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 10;
// Create an orthographic camera
const camera = new THREE.OrthographicCamera(
  -frustumSize * aspect / 2 ,  // left
  frustumSize * aspect / 2,   // right
  frustumSize / 2 ,            // top
  -frustumSize / 2  ,           // bottom
  1,                        // near
  1000                        // far
);

camera.position.set(0, -5, 20); // Set camera back along z-axis
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("threejsCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);

  // Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minZoom = 2.5;
controls.maxZoom = 8.5;
controls.minPolarAngle = 1;
controls.maxPolarAngle = 1;
controls.autoRotate = false;
controls.target.set(0, 0, 0); // Ensure this is the model's center
controls.rotateSpeed = 0.6;   // Lower value for smoother rotation
controls.update();
camera.updateProjectionMatrix();  
document.body.appendChild(renderer.domElement);
		

// Load Model
const loader = new GLTFLoader();
const modelName = getModelFromURL();  // Get model name from URL
//document.getElementById("model-name").textContent = `Loading: ${modelName}`;

// Dynamic path based on URL
const modelPath = `../client/${modelName}/model.glb`;

loader.load(
    modelPath,
    (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);
        gltf.scene.traverse((child) => {
	    if (child.isMesh && child.name.includes("Box_Floor")) {
		let floorNumber = child.name.replace("Box_Floor", ""); // Extract floor number
		    console.log("Box_Floor found");
		floorBoxes[floorNumber] = child;
		child.material = new THREE.MeshBasicMaterial({
		    color: 0x00ff00, 
		    transparent: true,
		    opacity: 0.3 // Default semi-transparent
		});
		child.visible = false;
	    }});
	    
        animate();
    },
    (error) => console.error('Error loading model:', error)
);

// Lights 
const light = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(light);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 0.8);
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff8e7, 1.5); // slightly warm sunlight
sunLight.position.set(100, 200, 100);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 500;
scene.add(sunLight);

// Add more directional lights from different angles for even illumination
const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight2.position.set(-100, 100, -100);
scene.add(dirLight2);

const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight3.position.set(0, -100, 100);
scene.add(dirLight3);

const dirLight4 = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight4.position.set(100, -100, -100);
scene.add(dirLight4);


// Post-processing removed

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Highlight the selected floor when hovering over a button
function highlightFloor(floorNumber) {
if (Object.keys(floorBoxes).length === 0) {
        console.warn("Model not loaded yet!");
        return;
    }

    // Hide all boxes
    Object.values(floorBoxes).forEach((box) => {
        box.visible = false;
        box.material.color.set(0x00ff00);
    });

    // Show and highlight selected floor
    if (floorBoxes[floorNumber]) {
        const box = floorBoxes[floorNumber];
        box.visible = true;
        box.material.color.set(0xff0000); // Highlight red
    }
}

// Reset highlight when mouse leaves
function resetHighlight() {
  Object.values(floorBoxes).forEach((box) => {
        box.visible = false;
        box.material.color.set(0x00ff00);
    });
}

window.showFloorOptions = function(floorNumber) {
  highlightFloor(floorNumber);
  const panel = document.getElementById("floorOptionsPanel");
  const label = document.getElementById("floorLabel");

  label.textContent = `Apartments on ${floorNumber}`;
  panel.style.display = "block";
};

window.hideFloorOptions = function () {
  document.getElementById("floorOptionsPanel").style.display = "none";
  resetHighlight();
};


window.highlightFloor = highlightFloor;
window.resetHighlight = resetHighlight;


// Responsive Canvas

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
