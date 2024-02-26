import * as THREE from "three";
import { OBB } from 'three/addons/math/OBB.js';
import { obstacleVert } from "./shaders/obstacle.js";

/**
 * Esta classe define os tipos de obstáculos. É uma definição de Enum por meio de uma Classe.
 */
class MyObstacleType {
    static Barrier = new MyObstacleType("barrier"); // Reduz a velocidade do jogador no impacto

    constructor(name) {
        this.name = name;
    }
}

/**
 * Esta classe define os obstáculos que aparecem ao longo da pista.
 */
class MyObstacle {
    constructor(pos, type, trackMesh, trackCurve) {
        this.position = pos;
        this.orientation = null;
        this.type = type;
        this.mesh = null;
        this.collided = false;

        // Cria o mesh do obstáculo e define sua orientação
        this.createObstacle();
        this.getObstacleOrientation(trackMesh, trackCurve);
    }

    /**
     * Constrói o mesh do obstáculo.
     */
   createObstacle() {
        switch (this.type) {
            case MyObstacleType.Barrier: {
                // Define o tamanho e os uniforms personalizados para o shader
                const radius = 1.5;
                const customUniforms = THREE.UniformsUtils.merge([
                    THREE.ShaderLib.phong.uniforms,
                    { myCenter: { value: new THREE.Vector3(0, 0, 0) } },
                    { mySize: { value: new THREE.Vector3(radius * 2, 1.2, radius * 2) } },
                    { u_time: { value: 0.0 } },
                    { phase: { value: 0.0 } },
                    { amplitude: { value: 0.3 } },
                    { y_offset: { value: 1 } },
                    { frequency: { value: 0.5 } },
                    { diffuse: { value: new THREE.Vector3(0.0, 1.0, 0.0) } } // Alterado para verde
                ]);

                // Cria a geometria do cilindro e o material do shader
                const geometry = new THREE.CylinderGeometry(radius, radius, 1.2, 32);
                const material = new THREE.ShaderMaterial({
                    uniforms: customUniforms,
                    vertexShader: obstacleVert,
                    fragmentShader: THREE.ShaderLib.basic.fragmentShader
                });

                // Cria o mesh, define sua posição e configura seu OBB
                this.mesh = new THREE.Mesh(geometry, material);
                this.position.y = 0.6; // Metade da altura do cilindro
                this.mesh.position.set(this.position.x, 0.6, this.position.z);
                this.setupOBB(new THREE.Vector3(radius * 2, 1.2, radius * 2));
                break;
            }
        }
    }

    /**
     * Calcula a orientação para que o obstáculo fique alinhado com a curva da pista.
     * @param {*} trackMesh
     * @param {*} trackCurve
     */
    getObstacleOrientation(trackMesh, trackCurve) {
        const raycaster = new THREE.Raycaster();
        const direction = new THREE.Vector3(0, -1, 0);
        raycaster.set(new THREE.Vector3(this.position.x, 1, this.position.z), direction);

        // Realiza o raycasting para encontrar o ponto de interseção com a pista
        const intersections = raycaster.intersectObject(trackMesh);
        const segment = Math.floor(intersections[0].faceIndex / (3 * 2));
        const length = segment / 200;

        // Obtém a tangente no ponto especificado na curva da pista e ajusta a orientação
        const tangent = trackCurve.getTangentAt(length);
        tangent.reflect(new THREE.Vector3(1, 0, 0));
        this.mesh.lookAt(tangent.add(this.position));
    }

    /**
     * Cria o OBB (Oriented Bounding Box) para o objeto, usado para detectar colisões com o jogador.
     * @param {THREE.Vector3} size Tamanho do objeto
     */
    setupOBB(size) {
        // Configura o OBB no nível de geometria
        this.mesh.geometry.userData.obb = new OBB();
        this.mesh.geometry.userData.obb.halfSize.copy(size).multiplyScalar(0.5);

        // Volume de delimitação no nível do objeto (reflete a transformação mundial atual)
        this.mesh.userData.obb = new OBB();

        // Atualiza o OBB
        this.mesh.updateMatrix();
        this.mesh.updateMatrixWorld();
        this.mesh.userData.obb.copy(this.mesh.geometry.userData.obb);
        this.mesh.userData.obb.applyMatrix4(this.mesh.matrixWorld);
    }

    /**
     * Chamado quando uma colisão com o jogador é detectada.
     * @param {*} player
     */
    onPlayerCollision(player) {
        // Ignora colisões se o jogador já colidiu com este objeto
        if (this.collided)
            return;

        this.collided = true;

        // Registra colisão, mas ignora efeitos, e remove o efeito de bolha do jogador
        if (player.hasBubble) {
            player.hasBubble = false;
            return;
        }

        // Registra colisão, mas ignora efeitos se o jogador estiver imune
        if (player.isImmune)
            return;

        // Aplica efeitos específicos do obstáculo na colisão
        switch (this.type) {
            case MyObstacleType.Barrier:
                player.speed *= 0.3;
                break;
        }
    }

    /**
     * Método de atualização para o obstáculo.
     * @param {number} elapsedTime
     */
    update(elapsedTime) {
        // Atualiza o uniforme do shader para o obstáculo do tipo "barrier"
        if (this.type == MyObstacleType.Barrier) {
            this.mesh.material.uniforms.u_time.value = elapsedTime;
            this.mesh.material.uniforms.u_time.needsUpdate = true;
        }
    }
}

export { MyObstacle, MyObstacleType };
