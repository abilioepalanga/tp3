// Importando os módulos necessários da biblioteca Three.js e as classes personalizadas
import * as THREE from "three";
import { MyObstacle, MyObstacleType } from "../../MyObstacle.js";
import MyTrack from "../../MyTrack.js";
import { MyPowerUp, MyPowerUpType } from "../../MyPowerUp.js";

// Definindo uma classe chamada MyReader
class MyReader {
    constructor(app) {
        // Construtor que recebe um parâmetro 'app' e inicializa as propriedades da classe
        this.app = app;
        this.track = null;
        this.trackObjects = [];
        this.route = null;
    }

    // Método para abrir e ler um arquivo
    open(file) {
        let req;

        // Verificando se o XMLHttpRequest é suportado pelo navegador
        if (window.XMLHttpRequest) {
            req = new XMLHttpRequest(); // Para todos os navegadores modernos
        } else if (window.ActiveXObject) {
            req = new ActiveXObject("Microsoft.XMLHTTP"); // Para o (antigo) IE
        }
        
        req.overrideMimeType("application/json"); // Definindo o tipo MIME para a requisição
        req.open('GET', file, false); // Abrindo o arquivo usando uma requisição GET síncrona
        req.onload  = () => {
            // Analisando a resposta JSON quando a requisição é carregada
            let jsonResponse = JSON.parse(req.responseText);
            this.instantiateTrackObjects(jsonResponse);
        };
        req.send(null); // Enviando a requisição
    }

    // Método para criar e instanciar uma pista com base nos dados fornecidos
    instantiateTrack(data) {
        const trackPoints = [];
        // Criando objetos Vector3 do Three.js a partir dos pontos da pista
        data.forEach((point) => trackPoints.push(new THREE.Vector3(...point)));

        // Criando uma instância MyTrack com uma CatmullRomCurve3 baseada nos pontos da pista
        this.track = new MyTrack(new THREE.CatmullRomCurve3(trackPoints));

        // Forçando uma renderização antecipada da pista para que o raycast dos obstáculos funcione
        this.app.scene.add(this.track.curve);
        this.app.renderer.render(this.app.scene, this.app.activeCamera);
    }

    // Método para instanciar obstáculos com base nos dados fornecidos
    instantiateObstacles(data) {
        for (const obstacleType in data) {
            for (const obstaclePos of data[obstacleType]) {
                // Criando instâncias MyObstacle e adicionando-as à cena
                const obstacle = new MyObstacle(
                    new THREE.Vector3(obstaclePos[0], 0, obstaclePos[1]),
                    MyObstacleType[obstacleType],
                    this.track.mesh,
                    this.track.path
                );
                this.trackObjects.push(obstacle);
                this.app.scene.add(obstacle.mesh);
            }
        }
    }

    // Método para instanciar power-ups com base nos dados fornecidos
    instantiatePowerups(data) {
        for (const powerupType in data) {
            for (const powerupPos of data[powerupType]) {
                // Criando instâncias MyPowerUp e adicionando-as à cena
                const powerup = new MyPowerUp(
                    new THREE.Vector3(powerupPos[0], 0, powerupPos[1]),
                    MyPowerUpType[powerupType]
                );
                this.trackObjects.push(powerup);
                this.app.scene.add(powerup.mesh);
            }
        }
    }

    // Método para instanciar todos os objetos da pista (pista, obstáculos, power-ups) com base nos dados fornecidos
    instantiateTrackObjects(data) {
        this.instantiateTrack(data.Track);
        this.instantiateObstacles(data.Obstacles);
        this.instantiatePowerups(data.Powerups);
    }
}

// Exportando a classe MyReader para uso em outros módulos
export { MyReader };
