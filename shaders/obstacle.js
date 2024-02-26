// Vertex Shader para o obstáculo
const obstacleVert = `
void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader para o obstáculo
const obstacleFrag = `
uniform vec3 myColor;
void main() {
    gl_FragColor = vec4(myColor, 1.0);
}
`;

// Exportando os shaders
export { obstacleVert, obstacleFrag };






