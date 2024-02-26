import * as THREE from 'three'

class MyFirework {

    constructor(app, scene, launchPos) {
        this.app = app;
        this.scene = scene;

        this.done = false;
        this.dest = [];

        this.launchPos = launchPos;
        this.vertices = null;
        this.colors = null;
        this.geometry = null;
        this.points = null;

        this.material = new THREE.PointsMaterial({
            size: 0.1,
            color: 0xffffff,
            opacity: 1,
            vertexColors: true,
            transparent: true,
            depthTest: false,
        });

        this.height = 12;
        this.speed = 60;

        this.launch();
    }

    /**
     * Calcula o lançamento da partícula
     */
    launch() {
        // Gera uma cor aleatória para a partícula
        let color = new THREE.Color();
        color.setHSL(THREE.MathUtils.randFloat(0.1, 0.9), 1, 0.5);
        let colors = [color.r, color.g, color.b];

        // Posição inicial aleatória próxima ao ponto de lançamento
        let x = THREE.MathUtils.randFloat(this.launchPos.x - 5, this.launchPos.x + 5);
        let y = THREE.MathUtils.randFloat(this.height * 0.9, this.height * 1.1);
        let z = THREE.MathUtils.randFloat(this.launchPos.z - 5, this.launchPos.z + 5);
        
        // Armazena a posição final da partícula
        this.dest.push(x, y, z);
        let vertices = [...this.launchPos];

        // Criação da geometria e adição da partícula à cena
        this.geometry = new THREE.BufferGeometry();
        this.geometry.scale(5, 5, 5);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.castShadow = true;
        this.points.receiveShadow = true;
        this.app.scene.add(this.points);
        console.log("firework launched");
    }

    /**
     * Calcula a explosão
     * @param {*} origin 
     * @param {*} n 
     * @param {*} rangeBegin 
     * @param {*} rangeEnd 
     */
    explode(origin, n, rangeBegin, rangeEnd) {
        // Remove a partícula lançada da cena e libera recursos
        this.app.scene.remove(this.points);
        this.points.geometry.dispose();
        // Aqui você pode adicionar lógica para criar uma explosão mais realista
    }

    /**
     * Limpeza
     */
    reset() {
        console.log("firework reseted");
        this.app.scene.remove(this.points);
        this.dest = [];
        this.vertices = null;
        this.colors = null;
        this.geometry = null;
        this.points = null;
    }

    /**
     * Atualiza o fogo de artifício
     * @returns 
     */
    update() {
        // Realiza a lógica apenas se os objetos existirem
        if (this.points && this.geometry) {
            let verticesAttribute = this.geometry.getAttribute('position');
            let vertices = verticesAttribute.array;
            let count = verticesAttribute.count;

            // Interpola as posições das partículas
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i] += (this.dest[i] - vertices[i]) / this.speed;
                vertices[i + 1] += (this.dest[i + 1] - vertices[i + 1]) / this.speed;
                vertices[i + 2] += (this.dest[i + 2] - vertices[i + 2]) / this.speed;
            }
            verticesAttribute.needsUpdate = true;

            // Se há apenas uma partícula, verifica se a coordenada Y está próxima da coordenada Y de destino
            if (count === 1) {
                if (Math.ceil(vertices[1]) > (this.dest[1] * 0.95)) {
                    // Adiciona n partículas partindo da posição (vertices[0], vertices[1], vertices[2])
                    this.explode(vertices, 80, this.height * 0.05, this.height * 0.8);
                    return;
                }
            }

            // Se há mais de uma partícula, diminui a opacidade das partículas explodidas
            if (count > 1) {
                this.material.opacity -= 0.015;
                this.material.needsUpdate = true;
            }

            // Remove, reseta e para a animação quando a opacidade chega a zero
            if (this.material.opacity <= 0) {
                this.reset();
                this.done = true;
                return;
            }
        }
    }
}

export { MyFirework };
