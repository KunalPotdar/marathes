// ...inside your loader.load callback, after scene.add(model):

// Center the model at the origin
const box = new THREE.Box3().setFromObject(model);
const center = box.getCenter(new THREE.Vector3());
model.position.sub(center); // Move model so its center is at (0,0,0)

// Set OrbitControls target to the model's center (now at origin)
controls.target.set(0, 0, 0);
controls.update();