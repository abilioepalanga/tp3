// Matrizes de transformação
uniform mat4 modelMatrix;          // Transformação do modelo para o mundo
uniform mat4 modelViewMatrix;      // Transformação do modelo para a câmera
uniform mat4 projectionMatrix;     // Projeção da câmera
uniform mat4 viewMatrix;            // Transformação inversa da câmera
uniform mat3 normalMatrix;          // Inversa transposta da transformação do modelo para a câmera

// Posição da câmera no mundo
uniform vec3 cameraPosition;

// Atributos de vértice padrão
attribute vec3 position; // Posição do vértice
attribute vec3 normal;   // Vetor normal do vértice
attribute vec2 uv;       // Coordenadas de textura do vértice

void main() {
    // Calcula a posição do vértice transformando-o através das matrizes
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
