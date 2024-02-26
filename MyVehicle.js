import * as THREE from 'three';
import { OBB } from 'three/addons/math/OBB.js';

class MyVehicle {
  constructor(human, trackObjects, color) {
    // Propriedades do veículo
    this.maxSpeed = 0.2;
    this.speed = 0;
    this.speedModifier = 1.5;
    this.direction = new THREE.Vector3(0, 0, 1);
    this.sideDirection = 1;
    this.mesh = null;
    this.wheels = [];
    this.human = human;
    this.keys = {
      'W': false,
      'A': false,
      'S': false,
      'D': false
    };
    this.canControl = true;
    this.isImmune = false;
    this.hasBubble = false;
    this.trackObjects = trackObjects || null;
    this.color = color || 0xb4c6fc;
    this.modifierTime = 0;
  }
  // Método para construir o modelo do veículo
  buildModel() {
    // Cria a geometria da carroceria do veículo
    const size = new THREE.Vector3(1, 1, 3);
    const geometry = new THREE.BoxGeometry(...size);

    // Configura uma Oriented Bounding Box (OBB) na geometria
    geometry.userData.obb = new OBB();
    geometry.userData.obb.halfSize.copy(size).multiplyScalar(0.5);

    if (this.human) { var material = new THREE.MeshBasicMaterial({ color: this.color }); }

    else { var material = new THREE.MeshBasicMaterial({ color: this.color }); }
    this.mesh = new THREE.Mesh(geometry, material);

    const size2 = new THREE.Vector3(0.8, 0.8, 1.8);
    const geometry2 = new THREE.BoxGeometry(...size2);


    const material2 = new THREE.MeshLambertMaterial({ color: 0xb4c6fc })
    this.mesh2 = new THREE.Mesh(geometry2, material2);
    this.mesh2.position.set(0, 0.5, -0.2);
    this.mesh.add(this.mesh2);

    const size3 = new THREE.Vector3(0.8, 1.7, 0.8);
    const geometry3 = new THREE.BoxGeometry(...size3);

    const material3 = new THREE.MeshLambertMaterial({ color: 0xFF0000 })
    this.mesh3 = new THREE.Mesh(geometry3, material3);
    this.mesh3.position.set(0, 0.5, 1);
    this.mesh.add(this.mesh3);

    // Cria a malha do veículo combinando geometria e material
    this.mesh.userData.obb = new OBB();
    // Configuração de textura para as rodas
    const loader = new THREE.TextureLoader();
    const wheelTexture = loader.load('./images/wheels.png');

    // Criação das rodas
    for (let i = 0; i < 4; i++) {
      const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 32);
      const wheelMaterial = new THREE.MeshBasicMaterial({ map: wheelTexture });
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      //set texture

      this.wheels.push(wheel);
      this.mesh.add(wheel);
    }

    // Position the wheels
    this.wheels[0].position.set(-0.5, -0.5, 1);
    this.wheels[0].rotation.z = Math.PI / 2;
    this.wheels[1].position.set(0.5, -0.5, 1);
    this.wheels[1].rotation.z = Math.PI / 2;
    this.wheels[2].position.set(-0.5, -0.5, -1);
    this.wheels[2].rotation.z = Math.PI / 2;
    this.wheels[3].position.set(0.5, -0.5, -1);
    this.wheels[3].rotation.z = Math.PI / 2;
  }


  handleKeyDown(key) {
    if (this.human)
      this.keys[key] = true;
  }
  handleKeyUp(key) {
    if (this.human)
      this.keys[key] = false;
  }

  checkCollisions() {
    // Check collision against obstacles
    for (const object of this.trackObjects) {
      if (this.mesh.userData.obb.intersectsOBB(object.mesh.userData.obb)) {
        object.onPlayerCollision(this);
      }
    }
  }
  isCollidingWithFinishLine(finishLine) {
    const carPosition = this.mesh.position;
    const finishLinePosition = finishLine.position;

    // Adjust these values based on the size of your car and finish line
    const tolerance = 5;

    if (Math.abs(carPosition.x - finishLinePosition.x) < tolerance &&
      Math.abs(carPosition.y - finishLinePosition.y) < tolerance &&
      Math.abs(carPosition.z - finishLinePosition.z) < tolerance) {
      return true;
    }

    return false;
  }

  setColor(color) {
    this.color = color;
    this.mesh.material.color.setHex(color);
  }

  update() {
    // Check the state of the keys and update the speed and rotation accordingly
    if (this.keys['W'] && this.canControl) {
      this.speed = Math.min(this.speed + 0.001, this.maxSpeed);
    }
    if (this.keys['S'] && this.canControl) {
      this.speed = Math.max(this.speed - 0.001, -this.maxSpeed);
    }
    if (this.keys['A'] && this.canControl) {
      this.mesh.rotation.y += 0.01 * this.sideDirection;
      this.wheels[0].rotation.y = 0.3;
      this.wheels[1].rotation.y = 0.3;
    }
    else if (this.keys['D'] && this.canControl) {
      this.mesh.rotation.y -= 0.01 * this.sideDirection;
      this.wheels[0].rotation.y = - 0.3;
      this.wheels[1].rotation.y = - 0.3;
    }
    else {
      this.wheels[0].rotation.y = 0;
      this.wheels[1].rotation.y = 0;
    }
    // Update the direction vector
    this.direction.set(
      Math.sin(this.mesh.rotation.y),
      0,
      Math.cos(this.mesh.rotation.y)
    );

    // Update the vehicle's position
    const deltaPosition = this.direction.clone().multiplyScalar(this.speed * this.speedModifier);
    this.mesh.position.add(deltaPosition);

    // Update the rotation of the wheels
    const wheelRotation = this.speed / 0.4; // Adjust this value as needed
    for (const wheel of this.wheels) {
      wheel.rotation.x += wheelRotation;
    }

    this.speed *= 0.99;
    // Only check for collisions if the vehicle is player controlled
    if (!this.human)
      return

    // Update OBB
    this.mesh.userData.obb.copy(this.mesh.geometry.userData.obb);
    this.mesh.userData.obb.applyMatrix4(this.mesh.matrixWorld);

    this.checkCollisions();
  }
}

export { MyVehicle };
