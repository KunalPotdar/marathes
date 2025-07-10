import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { UltraHDRLoader } from 'three/addons/loaders/UltraHDRLoader.js';


// Get model from URL (either ?model= or #)
function getModelFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('model') || window.location.hash.replace('#', '') || 'project1';
}

let floorBoxes = {}; // Store references to each box
let apartmentBoxes = {}; // Store references to each apartment box
let floorOptionsOpen = false;
// Scene, Camera, Renderer setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff ); // Sky blue
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

camera.position.set(10, 0, 30); // Set camera back along z-axis
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("threejsCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;
renderer.shadowMap.enabled = true;
//renderer.outputEncoding = THREE.sRGBEncoding;

  // Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minZoom = 2.5;
controls.maxZoom = 8.5;
controls.minPolarAngle = 1.5; // Prevent looking up too high
controls.maxPolarAngle = 1.5; // Prevent looking down too low
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

let currentModel = null;
loadModel(modelPath);

// Lights 
// Ambient Light
const light = new THREE.AmbientLight(0xffffff, 0.7);
//scene.add(light);

// Hemisphere Light

//const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 4.0);
const hemiLight = new THREE.HemisphereLight(0xfff8e7, 0x080820, 4);
//const hemiLight = new THREE.HemisphereLight(0xffffff, 0xaaaaaa, 2.0);
hemiLight.position.set(0, 200, 0);
scene.add(hemiLight);

// Sunlight
const sunLight = new THREE.DirectionalLight(0xfff8e7, 3.5); // slightly warm sunlight
sunLight.position.set(100, 200, 100);
sunLight.castShadow = true;
sunLight.shadow.bias = -0.0001;
sunLight.shadow.mapSize.width = 1024*4;;
sunLight.shadow.mapSize.height = 1024*4;;
//scene.add(sunLight);



// Add more directional lights from different angles for even illumination
// const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
// dirLight2.position.set(-100, 100, -100);
// scene.add(dirLight2);

// const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.6);
// dirLight3.position.set(0, -100, 100);
// scene.add(dirLight3);

// const dirLight4 = new THREE.DirectionalLight(0xffffff, 0.5);
// dirLight4.position.set(100, -100, -100);
// scene.add(dirLight4);

// // // Additional fill lights for even more balanced illumination
//  const fillLight1 = new THREE.PointLight(0xffffff, 0.3, 500);
// fillLight1.position.set(0, 100, 0);
// scene.add(fillLight1);

// const fillLight2 = new THREE.PointLight(0xffffff, 0.2, 500);
// fillLight2.position.set(0, 0, 100);
// scene.add(fillLight2);

// const fillLight3 = new THREE.PointLight(0xffffff, 0.2, 500);
// fillLight3.position.set(0, 0, -100);
// scene.add(fillLight3);


// Post-processing removed

// Animation Loop
function animate() {
    controls.update();
    renderer.render(scene, camera);
    sunLight.position.set(
        camera.position.x + 10,
        camera.position.y + 10,
        camera.position.z + 10
    )
     requestAnimationFrame(animate);

}



// Highlight the selected apartment when hovering over a button
function highlightApartment(aptNumber) {
    if (Object.keys(apartmentBoxes).length === 0) {
        console.warn("Model not loaded yet!");
        return;
    }
    // Reset all apartments to default color, but keep them visible
    Object.values(apartmentBoxes).forEach((box) => {
        box.visible = true;
        box.material.color.set(0x00ff00); // Default color
    });

    // Highlight selected apartment
    if (apartmentBoxes[aptNumber]) {
        const box = apartmentBoxes[aptNumber];
        box.material.color.set(0xff0000); // Highlight red
    } else {
        console.warn("Apartment not found: " + aptNumber);
    }
}



window.showFloorOptions = function(floorNumber) {
   floorOptionsOpen = true;
  highlightFloor(floorNumber);
  const panel = document.getElementById("floorOptionsPanel");
  const label = document.getElementById("floorLabel");

  label.textContent = `Apartments on ${floorNumber}`;
  panel.style.display = "block";
};

window.hideFloorOptions = function () {
  floorOptionsOpen = false;
  document.getElementById("floorOptionsPanel").style.display = "none";
  resetHighlight();
};

function maybeResetHighlight() {
  if (!floorOptionsOpen) {
    resetHighlight();
  }
}

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

function loadModel(url) {
  // Remove existing model from the scene
  if (currentModel) {
    scene.remove(currentModel);
    currentModel.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    currentModel = null;
  }
  // Clear apartmentBoxes for the new model
  apartmentBoxes = {};
  floorBoxes = {}; // Clear floor boxes for the new model
  // Load the new model
  loader.load(url, (gltf) => {
    currentModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(currentModel);
    const center = box.getCenter(new THREE.Vector3());
    currentModel.position.sub(center); // Center the model at the origin
    scene.add(currentModel);

    currentModel.traverse((child) => {
      if (child.isMesh) {
       child.castShadow = true; // Enable shadow casting for all meshes
        child.receiveShadow = true; // Enable shadow receiving for all meshes
        if(child.material.map) {
          child.material.map.anisotropy = 16; // Set anisotropy for textures
          child.material.map.encoding = THREE.sRGBEncoding;}
        // Optionally flip the normal map (depends on source)
        if (child.material.normalMap) {
          child.material.normalMap.flipY = false; // glTFLoader usually handles this
        }

      child.material.needsUpdate = true;
      }

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
	console.log("apartmentBoxes keys:", Object.keys(apartmentBoxes));
       
  },
  (error) => console.error('Error loading model:', error)
  );
}

function loadFloorModel(floorNumber) {
    const baseName = "model"; // Change to your actual base model name if needed
    let modelPath;
    if (floorNumber == 5) {
        // Use default model path for "Top"
        modelPath = `../client/project1/model.glb`;
    } else {
        // Use floor-specific model path
        const baseName = "model";
        modelPath = `../client/project1/${baseName}_${floorNumber}.glb`;
    }

    loadModel(modelPath);
    const panel = document.getElementById("floorOptionsPanel");
  const label = document.getElementById("floorLabel");

  label.textContent = `Apartments on ${floorNumber}`;
  panel.style.display = "block";
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




// Responsive Canvas
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.loadFloorModel = loadFloorModel;
window.highlightFloor = highlightFloor;
window.highlightApartment = highlightApartment;
window.resetHighlight = resetHighlight;
window.showFloorOptions = showFloorOptions;
window.hideFloorOptions = hideFloorOptions;
 animate();