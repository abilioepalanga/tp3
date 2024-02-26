import * as THREE from 'three';

class MyTrack {
  constructor(path) {
    //Curve related attributes
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

   /**
   * Creates the necessary elements for the curve
   */
   buildCurve() {
    this.createCurveMaterialsTextures();
    this.createCurveObjects();
  }

  /**
   * Create materials for the curve elements: the mesh, the line and the wireframe
   */
  createCurveMaterialsTextures() {
    const texture = new THREE.TextureLoader().load("./images/asphalt.jpg");
    texture.wrapS = THREE.RepeatWrapping;

    this.material = new THREE.MeshBasicMaterial({ map: texture });
    this.material.map.repeat.set(this.textureRepeat, 3);
    this.material.map.wrapS = THREE.RepeatWrapping;
    this.material.map.wrapT = THREE.RepeatWrapping;

    this.wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x4444ff,
      opacity: 0.3,
      wireframe: true,
      transparent: true,
    });

    this.lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  }

  /**
   * Creates the mesh, the line and the wireframe used to visualize the curve
   */
  createCurveObjects() {
    let geometry = new THREE.TubeGeometry(
      this.path,
      this.segments,
      this.width,
      3,
      this.closedCurve
    );
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.wireframe = new THREE.Mesh(geometry, this.wireframeMaterial);
  
    let points = this.path.getPoints(this.segments);
    let bGeometry = new THREE.BufferGeometry().setFromPoints(points);
    // Create the final object to add to the scene
    this.line = new THREE.Line(bGeometry, this.lineMaterial);
  
    this.curve = new THREE.Group();
  
    this.mesh.visible = this.showMesh;
    this.wireframe.visible = this.showWireframe;
    this.line.visible = this.showLine;
  
    this.curve.add(this.mesh);
    this.curve.add(this.wireframe);
    this.curve.add(this.line);
  
    this.curve.rotateZ(Math.PI);
    this.curve.scale.set(1,0.2,1);
    //this.app.scene.add(this.curve);
  }

  isVehicleOnTrack(position) {
      var points = this.path.getPoints(500);
      //paint these points in red on the scene
      var closestPointOnTrack;
      var minDistance = Infinity;
      for (var i = 0; i < points.length; i++) {
        var sin = Math.sin(Math.PI);
        var cos = Math.cos(Math.PI);
  
        var newX = points[i].x * cos - points[i].y * sin;
        var newY = points[i].x * sin + points[i].y * cos;
  
        points[i].x = newX;
        points[i].y = newY;
        var distance = points[i].distanceTo(position);
        if (distance < minDistance) {
          minDistance = distance;
          closestPointOnTrack = points[i];
        }
      }
      if (minDistance < 5) {
        return true;
      } else {
          return false;
          }
      
    }

    createWalls() {
      var wallThickness = 0.1;
      var wallHeight = 2;
      var points = this.path.getPoints(this.segments);
    
      var shape1 = new THREE.Shape();
      var shape2 = new THREE.Shape();
    
      for (var i = 0; i < points.length; i++) {
        var point = points[i];

        var nextPoint = points[(i + 1) % points.length];
    
        var direction = new THREE.Vector3().subVectors(nextPoint, point).normalize();
        var normal = new THREE.Vector3(-direction.z, 0, direction.x);
    
        var wallPoint1 = new THREE.Vector3().addVectors(point, normal.clone().multiplyScalar(this.width / 2 + wallThickness));
        var wallPoint2 = new THREE.Vector3().addVectors(point, normal.clone().multiplyScalar(-this.width / 2 - wallThickness));
    
        if (i === 0) {
          shape1.moveTo(wallPoint1.x, wallPoint1.z);
          shape2.moveTo(wallPoint2.x, wallPoint2.z);
        } else {
          shape1.lineTo(wallPoint1.x, wallPoint1.z);
          shape2.lineTo(wallPoint2.x, wallPoint2.z);
        }
      }
    
      var extrudeSettings = { depth: wallHeight, bevelEnabled: false };
    
      var geometry1 = new THREE.ExtrudeGeometry(shape1, extrudeSettings);
      var geometry2 = new THREE.ExtrudeGeometry(shape2, extrudeSettings);
    
      var wallMaterial = new THREE.MeshBasicMaterial({color: 0x888888, side: THREE.DoubleSide});
    
      var wall1 = new THREE.Mesh(geometry1, wallMaterial);
      var wall2 = new THREE.Mesh(geometry2, wallMaterial);
      //rotate walls
      wall1.rotateX(Math.PI / 2 + Math.PI);
      wall1.rotateZ(Math.PI)
      wall2.rotateX(Math.PI / 2 + Math.PI);
      wall2.rotateZ(Math.PI)
      return [wall1, wall2];
    }

  
  }


export default MyTrack;
