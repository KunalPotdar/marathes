import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
const clock = new THREE.Clock();


let isUserInteracting = false,
  onPointerDownMouseX = 0, onPointerDownMouseY = 0,
  lon = 0, onPointerDownLon = 0,
  lat = 0, onPointerDownLat = 0,
  phi = 0, theta = 0;

  let camera, renderer, scene;
export function init() {
// Renderer 
 renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setSize(rightPanel.clientWidth, rightPanel.clientHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

 scene = new THREE.Scene();


const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 1;


 camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1100 );


const geometry = new THREE.SphereGeometry( 1000, 80, 40 );
  // invert the geometry on the x-axis so that all of the faces point inward
geometry.scale( -1, 1, 1 );

const texture = new THREE.TextureLoader().load( '../images/2.png' );
texture.colorSpace = THREE.SRGBColorSpace;
const material = new THREE.MeshBasicMaterial( { map: texture } );

const mesh = new THREE.Mesh( geometry, material );

scene.add( mesh );
renderer.setAnimationLoop( animate );
  //animate();


lon = 100; // Rotate scene horizontally
;  // Slight tilt up/down
animate();
}

function animate() {
 requestAnimationFrame(animate);
 lon += 0.006; // Adjust this value to change the rotation speed
 lat = Math.max( - 85, Math.min( 85, lat ) );
				phi = THREE.MathUtils.degToRad( 90 - lat );
				theta = THREE.MathUtils.degToRad( lon );

				const x = 500 * Math.sin( phi ) * Math.cos( theta );
				const y = 500 * Math.cos( phi );
				const z = 500 * Math.sin( phi ) * Math.sin( theta );

				camera.lookAt( x, y, z );


  renderer.render(scene, camera);
}

window.init = init;


// https://threejs.org/examples/webgl_panorama_equirectangular