import * as THREE from 'three';

class MyDisplay {
    constructor(size, position = new THREE.Vector3(), rotation = new THREE.Vector3(), aspect = [512, 256]) {
        this.size = size;
        this.position = position;
        this.rotation = rotation;
        this.aspect = aspect;
        this.mesh = null;
        this.context = null;

        this.createCanvas();
    }

    createCanvas() {
        // Create a canvas and get its 2D context
        const canvas = document.createElement('canvas');
        this.context = canvas.getContext('2d');

        // Set canvas dimensions
        canvas.width = this.aspect[0];
        canvas.height = this.aspect[1];

        // Customize the background
        this.context.fillStyle = '#333'; // Dark background color
        this.context.fillRect(0, 0, canvas.width, canvas.height);

        // Set text properties
        this.context.font = 'bold 36px Arial';
        this.context.fillStyle = '#FFF'; // White text color
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';

        // Example: Draw a border around the text
        this.context.strokeStyle = '#FFD700'; // Gold border color
        this.context.lineWidth = 2;
        this.context.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      

        // Create a texture from the canvas
        const texture = new THREE.CanvasTexture(canvas);
        this.createDisplay(texture);
    }

    drawText(text, x, y) {
        this.context.fillText(text, x, y);
    }

    createDisplay(texture) {
        const geometry = new THREE.BoxGeometry(...this.size);
        const material = new THREE.MeshBasicMaterial({ map: texture });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(...this.position);
        this.mesh.rotation.set(...this.rotation);
    }
}

export { MyDisplay };
