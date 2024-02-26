import * as THREE from 'three';

class MyTrack {
  constructor(path) {
    this.segments = 200;
    this.width = 6;
    this.textureRepeat = 100;
    this.showWireframe = false;
    this.showMesh = true;
    this.showLine = true;
    this.closedCurve = false;
    this.path = path;
    this.buildCurve();
  }

  buildCurve() {
    this.createMaterials();
    this.createObjects();
  }

  createMaterials() {
    const texture = new THREE.TextureLoader().load("./images/asphalt.jpg");
    texture.wrapS = THREE.RepeatWrapping;

    this.material = new THREE.MeshBasicMaterial({ map: texture, map: texture, map: texture });
    //this.material.map.repeat.set(this.textureRepeat, 3);

    this.wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0x4444ff, opacity: 0.3, wireframe: false, transparent: true });
    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  }

  createObjects() {
    const geometry = new THREE.TubeGeometry(this.path, this.segments, this.width, 3, this.closedCurve);

    this.mesh = this.createMesh(geometry, this.material);
    this.wireframe = this.createMesh(geometry, this.wireframeMaterial);
    this.line = this.createLine(this.path, this.segments);

    this.curve = new THREE.Group();
    this.curve.add(this.mesh, this.wireframe, this.line);
    this.curve.rotateZ(Math.PI);
    this.curve.scale.set(1, 0.2, 1);
  }

  isVehicleOnTrack(position) {
    const points = this.path.getPoints(500);
    let minDistance = Infinity, closestPointOnTrack;

    points.forEach(point => {
      const [newX, newY] = this.rotatePoint(point, Math.PI);
      point.set(newX, newY, point.z);

      const distance = point.distanceTo(position);

      if (distance < minDistance) {
        minDistance = distance;
        closestPointOnTrack = point;
      }
    });

    return minDistance < 5;
  }

  

  createMesh(geometry, material, options = {}) {
    const mesh = new THREE.Mesh(geometry, material);
    this.applyOptions(mesh, options);
    return mesh;
  }

  createLine(path, segments) {
    const points = path.getPoints(segments);
    const bGeometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(bGeometry, this.lineMaterial);
  }

  rotatePoint(point, angle) {
    const [newX, newY] = [point.x, point.y].map((coord, index) => coord * Math.cos(angle) - point.y * Math.sin(angle));
    return [newX, newY];
  }

  normalizeVector(vector) {
    return vector.normalize();
  }

  applyOptions(object, options) {
    const { position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1] } = options;
    object.position.set(...position);
    object.rotation.set(...rotation);
    object.scale.set(...scale);
  }
}

export default MyTrack;
