import * as THREE from 'three';
import { OBB } from 'three/addons/math/OBB.js';

// Definindo os tipos de power-ups disponíveis
class MyPowerUpType {
    constructor(name) {
        this.name = name;
    }

    static Star = new MyPowerUpType("star");
    static SpeedUp = new MyPowerUpType("speedUp");
    static Bubble = new MyPowerUpType("bubble");
}

class MyPowerUp {
    constructor(pos, type) {
        this.position = pos;
        this.type = type;
        this.mesh = null;
        this.collided = false;
        this.rotationSpeed = Math.PI / 64;

        // Criar o objeto do power-up
        this.createPowerUp();
    }

    // Criar o modelo 3D do power-up
    createPowerUp() {
        const size = {
            star: new THREE.Vector3(1.5, 1.2, 1.5),
            speedUp: new THREE.Vector3(1.5, 1.2, 1.5),
            bubble: new THREE.Vector3(1.5, 1.2, 1.5),
        }[this.type];

        const matColor = {
            star: 0xdce314,
            speedUp: 0xff5555,
            bubble: 0x00ffff,
        }[this.type];

        const geometry = new THREE.BoxGeometry(...Object.values(size));
        const material = new THREE.MeshPhongMaterial({ color: matColor, opacity: 0.6, transparent: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.position.x, 1.4, this.position.z);
        this.setupOBB(size);
    }

    // Configurar a Oriented Bounding Box (OBB) para colisões
    setupOBB(size) {
        this.mesh.geometry.userData.obb = new OBB();
        this.mesh.geometry.userData.obb.halfSize.copy(size).multiplyScalar(0.5);

        this.mesh.userData.obb = new OBB();
        this.mesh.updateMatrix();
        this.mesh.updateMatrixWorld();
        this.mesh.userData.obb.copy(this.mesh.geometry.userData.obb);
        this.mesh.userData.obb.applyMatrix4(this.mesh.matrixWorld);
    }

    // Tratamento de colisão com o jogador
    onPlayerCollision(player) {
        if (this.collided) return;
        this.collided = true;

        // Efeito do power-up dependendo do tipo
        switch (this.type) {
            case MyPowerUpType.SpeedUp:
                player.speedModifier *= 3;
                setTimeout(() => (player.speedModifier /= 3), 10000);
                break;
            case MyPowerUpType.Bubble:
                player.hasBubble = true;
                break;
            case MyPowerUpType.Star:
                player.isImmune = true;
                player.speedModifier += 1;
                setTimeout(() => (player.isImmune = false, player.speedModifier -= 1), 7000);
                break;
        }
    }

    // Atualizar posição e rotação do power-up ao longo do tempo
    update(elapsedTime) {
        this.mesh.rotation.y = (this.mesh.rotation.y + this.rotationSpeed) % (2 * Math.PI);
        this.mesh.position.y = 1.4 + 0.18 * Math.sin(this.mesh.rotation.y);
    }
}

export { MyPowerUp, MyPowerUpType };
