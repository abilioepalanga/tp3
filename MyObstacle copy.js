import * as THREE from "three";
import { OBB } from 'three/addons/math/OBB.js';
import { obstacleVert, obstacleFrag } from "./shaders/obstacle.js";

// Define tipos de obstáculos
class MyObstacleType {
    constructor(name, size, materialCreator, orientationEffect) {
        this.name = name;
        this.size = size;
        this.materialCreator = materialCreator;
        this.orientationEffect = orientationEffect;
    }

    // Tipos de obstáculos predefinidos
    static Fog = new MyObstacleType("fog", [3.5, 0.8, 2.5], () => new THREE.MeshPhongMaterial({ color: 0x888888 }), (player) => {
        player.sideDirection = -1;
        setTimeout(() => { player.sideDirection = 1; }, 5000);
    });

    static Barrier = new MyObstacleType("barrier", [2.6, 1.2, 0.5], (size) => new THREE.ShaderMaterial({
        uniforms: {
            myCenter: { value: new THREE.Vector3(0, 0, 0) },
            mySize: { value: new THREE.Vector3(...size) },
            u_time: { value: 0.0 },
            phase: { value: 0.0 },
            amplitude: { value: 0.3 },
            y_offset: { value: 1 },
            frequency: { value: 0.5 },
            diffuse: { value: new THREE.Vector3(1.0, 0.0, 0.0) }
        },
        vertexShader: obstacleVert,
        fragmentShader: THREE.ShaderLib.basic.fragmentShader
    }), (player) => {
        player.speed *= 0.3;
    });

    static Oil = new MyObstacleType("oil", [3.5, 0.05, 2], () => new THREE.MeshPhongMaterial({ color: 0xffff00 }), (player) => {
        player.canControl = false;
        const spinPlayer = setInterval(() => { player.mesh.rotation.y += Math.PI / 10; }, 20);
        setTimeout(() => {
            clearInterval(spinPlayer);
            player.canControl = true;
            player.mesh.rotation.y = 0;
        }, 2000);
    });
}

// Classe principal para representar obstáculos
class MyObstacle {
    constructor(pos, type, trackMesh, trackCurve) {
        this.position = pos;
        this.type = type;
        this.mesh = null;
        this.collided = false;

        this.createObstacle();
        this.getObstacleOrientation(trackMesh, trackCurve);
    }

    // Criação do obstáculo
    createObstacle() {
        const size = MyObstacleType[this.type].size;
        const material = MyObstacleType[this.type].materialCreator(size);

        const geometry = new THREE.BoxGeometry(...size);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        this.setupOBB(size);
    }

    // Orientação do obstáculo em relação à pista
    getObstacleOrientation(trackMesh, trackCurve) {
        const raycaster = new THREE.Raycaster();
        raycaster.set(new THREE.Vector3(this.position.x, 1, this.position.z), new THREE.Vector3(0, -1, 0));
        const intersections = raycaster.intersectObject(trackMesh);
        const segment = Math.floor(intersections[0].faceIndex / (3 * 2));
        const length = segment / 200;
        const tangent = trackCurve.getTangentAt(length).reflect(new THREE.Vector3(1, 0, 0));
        this.mesh.lookAt(tangent.add(this.position));
    }

    // Configuração do objeto de colisão (OBB)
    setupOBB(size) {
        this.mesh.geometry.userData.obb = new OBB();
        this.mesh.geometry.userData.obb.halfSize.copy(new THREE.Vector3(...size).multiplyScalar(0.5));
        this.mesh.userData.obb = new OBB();
        this.mesh.updateMatrixWorld();
        this.mesh.userData.obb.copy(this.mesh.geometry.userData.obb).applyMatrix4(this.mesh.matrixWorld);
    }

    // Lida com colisão com jogador
    onPlayerCollision(player) {
        if (this.collided || player.isImmune || (player.hasBubble && this.type === "Barrier")) return;
        this.collided = true;
        MyObstacleType[this.type].orientationEffect(player);
    }

    // Atualizações específicas do tipo de obstáculo
    update(elapsedTime) {
        if (this.type === "Barrier") {
            this.mesh.material.uniforms.u_time.value = elapsedTime;
            this.mesh.material.uniforms.u_time.needsUpdate = true;
        }
    }
}

export { MyObstacle, MyObstacleType };
