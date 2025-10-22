import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
const clock = new THREE.Clock();
// Renderer 
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setSize(rightPanel.clientWidth, rightPanel.clientHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();


const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 1;

// Create an Perpective camera for Human Hight 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(3, 1.7, 6); // Start height like a human (1.6 meters)

// Controls
const controls = new PointerLockControls(camera, renderer.domElement); // Use renderer.domElement, not document.body
scene.add(controls); // Add controls directly, not controls.getObject()

const walkthroughPanel = document.getElementById('walkthrough-controls');
const walkthroughBtn = document.getElementById('startWalkthroughBtn');

// Enter walkthrough mode on button click
walkthroughBtn.addEventListener('click', () => {
  controls.lock();
  walkthroughBtn.style.display = 'none';        // Hide button when walkthrough starts
});

// Show instructions when controls are locked
controls.addEventListener('lock', () => {
  walkthroughPanel.style.display = 'block';
});

// Hide instructions and show button when controls unlock
controls.addEventListener('unlock', () => {
  walkthroughPanel.style.display = 'none';
  walkthroughBtn.style.display = 'block';       // Show button again
});
// LIGHTS

// Ambient Light 
const hlight = new THREE.AmbientLight (0xFFFFFF,2);
scene.add(hlight);
// Directional Light 
const directionalLight = new THREE.DirectionalLight(	0xefc070,2);
directionalLight.position.set(-100,100,1);
directionalLight.target.position.set(100,20,0);
directionalLight.castShadow = true;
scene.add(directionalLight);
scene.add(directionalLight.target);


//const loader = new GLTFLoader().setPath('client/project2/apts/');
const loader = new GLTFLoader();
loader.load('https://apt-hsim-models.s3.eu-west-3.amazonaws.com/sampleflat.glb', (gltf) => {
  console.log('Apartment model');
  const mesh = gltf.scene;

 // Center model in scene
  const box = new THREE.Box3().setFromObject(mesh);
  const center = new THREE.Vector3();
  box.getCenter(center);
  mesh.position.sub(center); // Recenter model

  // Optional: place bottom of model on ground
  box.setFromObject(mesh); // Recalculate after shift
  mesh.position.y -= box.min.y;

  scene.add(mesh);
  
    // Compute bounding box and size
  const bbox = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  console.log('Model dimensions:', size);
  
  animate();
  document.getElementById('progress-container').style.display = 'none';
   }, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});

// Movement
const move = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const speed = 3;
const direction = new THREE.Vector3();
const friction = 1.0; // Higher = smoother deceleration


document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') move.forward = true;
  if (e.code === 'KeyS') move.backward = true;
  if (e.code === 'KeyA') move.left = true;
  if (e.code === 'KeyD') move.right = true;
});

document.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') move.forward = false;
  if (e.code === 'KeyS') move.backward = false;
  if (e.code === 'KeyA') move.left = false;
  if (e.code === 'KeyD') move.right = false;
});


function animate() {
 requestAnimationFrame(animate);
  const delta = clock.getDelta(); // Use delta for consistent spee
  if (controls.isLocked) {
    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();
    
    // Apply velocity based on direction and speed
    if (move.forward || move.backward) {
      velocity.z -= direction.z * speed * delta;
    }
    if (move.left || move.right) {
      velocity.x -= direction.x * speed * delta;
    }
  
    // Apply friction
    velocity.x -= velocity.x * friction * delta;
    velocity.z -= velocity.z * friction * delta;
  
    // Move camera
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    }

  renderer.render(scene, camera);
}


