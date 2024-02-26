import * as THREE from "three";
import { MyAxis } from "./MyAxis.js";
import { MyVehicle } from './MyVehicle.js';
import { MyReader } from './parsers/track/MyReader.js';
import MyRoute from "./MyRoute.js";
import { MyDisplay } from "./MyDisplay.js";
import { MyFirework } from "./MyFirework.js";

/**
 * Esta classe contém o conteúdo da nossa aplicação.
 */
class MyContents {
  /**
   * Constrói o objeto.
   * @param {MyApp} app O objeto da aplicação
   */
  constructor(app) {
    this.app = app;
    this.axis = null;
    this.isPaused = false;
    this.raceEnded = false;
    this.playerFinished = false;
    this.botFinished = false;
    this.isOnEndDisplay = false;
    this.lapLimit = 2;
    this.botLaps = 0;
    this.botTime = 0;
    this.playerTime = 0;
    this.fireworks = [];
  }

  /**
   * Inicializa o conteúdo.
   */
  init() {
    // Criar apenas uma vez
    if (this.axis === null) {
      // Criar e anexar o eixo à cena
      this.axis = new MyAxis(this);
      this.app.scene.add(this.axis);
    }

    this.reader = new MyReader(this.app);
    this.reader.open("./tracks/track1.json");
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./images/sky.jpg');

    // Linha de chegada
    const texture2 = new THREE.TextureLoader().load("./images/finishline.jpg");
    const geometry2 = new THREE.PlaneGeometry(10.4, 2);
    const material2 = new THREE.MeshBasicMaterial({ map: texture2 });
    const plane2 = new THREE.Mesh(geometry2, material2);
    this.plane2 = plane2;
    plane2.rotateX(-Math.PI / 2);
    plane2.position.set(0, 0.61, 0);
    this.app.scene.add(plane2);

    // Ponto de verificação
    const texture4 = new THREE.TextureLoader().load("./images/verifica.jpeg");
    const geometry4 = new THREE.BoxGeometry(10, 5, 1);
    const material4 = new THREE.MeshBasicMaterial({ map: texture4 });
    const box = new THREE.Mesh(geometry4, material4);
    box.rotation.x = -Math.PI;
    box.rotation.y = -Math.PI / 2 +0.8;
    box.position.set(17, 1, 35);
    this.app.scene.add(box);
    
    const checkpointtexture = new THREE.TextureLoader().load("./images/asphalt-1.jpeg");
    const checkpointmaterial = new THREE.MeshBasicMaterial({ map: checkpointtexture });

    const geometry3 = new THREE.PlaneGeometry(0.5,0.4, 0.2);
    const plane3 = new THREE.Mesh(geometry3, checkpointmaterial);
    plane3.rotateX(-Math.PI / 2);
    plane3.position.set(0, 0.61, -50);
    this.app.scene.add(plane3);
    this.plane3 = plane3; 
    
    this.statsDisplay = new MyDisplay(
      new THREE.Vector3(10, 5, 0),
      new THREE.Vector3(17, 6, 35), // Ajuste da posição para ficar sobre a caixa
      new THREE.Vector3(-Math.PI, -Math.PI/4, Math.PI)
    );
    


   /* const checkpointtexture = new THREE.TextureLoader().load("./images/asphalt.jpg");
    const checkpointmaterial = new THREE.MeshBasicMaterial({ map: checkpointtexture });

    const plane3 = new THREE.Mesh(geometry2, checkpointmaterial);
    plane3.rotateX(-Math.PI / 2);
    plane3.position.set(0, 0.61, -50);
    this.app.scene.add(plane3);
    this.plane3 = plane3;

    this.statsDisplay = new MyDisplay(
      new THREE.Vector3(10, 5, 0),
      new THREE.Vector3(17, 1, 35),
      new THREE.Vector3(-Math.PI, Math.PI , Math.PI)
    )*/
    this.app.scene.add(this.statsDisplay.mesh);

    /* const texture4 = new THREE.TextureLoader().load("./images/asphalt.jpg");
     const geometry4 = new THREE.CylinderGeometry(0.5, 0.5, 5);
     const material4 = new THREE.MeshBasicMaterial({ map: texture4 });
     const plane5 = new THREE.Mesh(geometry4, material4);
     plane5.rotateX(-Math.PI);
     plane5.rotateY(Math.PI / 2)
     plane5.position.set(-27, 0.61, 25);
     this.app.scene.add(plane5);*/
/*
    const texture4 = new THREE.TextureLoader().load("./images/asphalt.jpg");
    const geometry4 = new THREE.BoxGeometry(10, 5, 1);
    const material4 = new THREE.MeshBasicMaterial({ map: texture4 });
    const box = new THREE.Mesh(geometry4, material4);
    box.rotation.x = -Math.PI;
    box.rotation.y = -Math.PI / 2+1;
    box.position.set(17, 1, 35);*/
    this.app.scene.add(box);


    // Plano todo do cenário, ou seja, o chão
    this.app.scene.background = texture;
    const baseTexture = new THREE.TextureLoader().load("./images/grass.jpeg");
    baseTexture.wrapS = THREE.RepeatWrapping;
    baseTexture.wrapT = THREE.RepeatWrapping;
    baseTexture.repeat.set(100, 100);
    const geometry = new THREE.PlaneGeometry(1000, 1000);
    const material = new THREE.MeshBasicMaterial({ map: baseTexture });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotateX(-Math.PI / 2);
    this.app.scene.add(plane);

    // Adicionar uma luz pontual sobre o modelo
    const pointLight = new THREE.PointLight(0xffffff, 1, 0, 0);
    pointLight.position.set(0, 20, 0);
    this.app.scene.add(pointLight);

    // Adicionar um auxiliar de luz pontual para a luz anterior
    const sphereSize = 0.5;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    this.app.scene.add(pointLightHelper);

    // Adicionar uma luz ambiente
    const ambientLight = new THREE.AmbientLight(0x555555);
    this.app.scene.add(ambientLight);

    var carColor = window.globalSelectedCar // Criar um veículo
    if (carColor == null) {
      carColor = 0xffd700;
    }
    this.vehicle = new MyVehicle(true, this.reader.trackObjects, carColor);
    this.vehicle.buildModel();
    this.vehicle.mesh.position.y += 1.4;

    var opponentColor = window.globalSelectedOpponent;
    if (opponentColor == null) {
      opponentColor = 0x2acaea;
    }

    this.bot = new MyVehicle(false, null, opponentColor);
    this.bot.buildModel();
    this.bot.mesh.position.y += 1.4;
    this.bot.mesh.position.x += 3;

    // ANIMAÇÃO DO CARRO DO BOT
    this.mixer = new THREE.AnimationMixer(this.bot.mesh);
    this.prevTime = 0;
    this.route = new MyRoute;
    if (window.difficulty == 1) { this.times = this.route.times3; }
    else if (window.difficulty == 2) this.times = this.route.times;
    else this.times = this.route.times2;
    this.values = this.route.values;



    // Criar uma VectorKeyframeTrack para animar a posição
    this.positionTrack = new THREE.VectorKeyframeTrack('.position', this.times, this.values);
    this.clip = new THREE.AnimationClip('Move', -1, [this.positionTrack]);

    // Criar uma AnimationAction e iniciá-la
    this.action = this.mixer.clipAction(this.clip);
    // Adicionar o veículo à cena
    this.app.scene.add(this.vehicle.mesh);
    this.app.scene.add(this.bot.mesh);
    if (this.vehicle.human) {
      window.addEventListener('keydown', (event) => {
        this.vehicle.handleKeyDown(event.key.toUpperCase());
      });
      window.addEventListener('keyup', (event) => {
        this.vehicle.handleKeyUp(event.key.toUpperCase());
      });
    }
  }

  removeRecEventListeners() {
    window.removeEventListener('keydown', (event) => {
      this.vehicle.handleKeyDown(event.key.toUpperCase());
    });
    window.removeEventListener('keyup', (event) => {
      this.vehicle.handleKeyUp(event.key.toUpperCase());
    });

  }

  /**
   * Chamado quando o usuário muda o número de segmentos na interface do usuário.
   * Recria os objetos da curva conforme necessário.
   */
  updateCurve() {
    if (this.reader.track.curve !== undefined && this.reader.track.curve !== null) {
      this.app.scene.remove(this.reader.track.curve);
    }
    this.reader.track.buildCurve();
    this.app.scene.add(this.reader.track.curve);
  }

  /**
   * Chamado quando o usuário muda o número de repetições de textura na interface do usuário.
   * Atualiza o vetor de repetição para a textura da curva.
   * @param {number} value - valor de repetição em S (ou U) fornecido pelo usuário
   */
  updateTextureRepeat(value) {
    this.reader.track.material.map.repeat.set(value, 3);
  }

  startVehicles() {
    this.vehicle.mesh.position.set(0, 0, 0);
    this.vehicle.mesh.rotation.set(0, 0, 0);
    this.vehicle.speed = 0;
    this.action.play();
  }

  updateStatsDisplay() {
    this.statsDisplay.mesh.material.map.needsUpdate = true;
    this.statsDisplay.context.clearRect(0, 0, 512, 256);
    this.statsDisplay.context.fillText('Tempo Total: ', 120, 30);
    this.statsDisplay.context.fillText(window.gameTime.toFixed(2), 350, 30);
    this.statsDisplay.context.fillText('Voltas Completadas:', 170, 80);
    this.statsDisplay.context.fillText(window.lapCounter, 375, 80);
    this.statsDisplay.context.fillText('Velocidade Máxima:', 175, 130);
    this.statsDisplay.context.fillText(this.vehicle.maxSpeed.toFixed(2) * 1000 * this.vehicle.speedModifier + " km/h", 425, 130);
    this.statsDisplay.context.fillText('Velocidade Atual:', 150, 180);
    this.statsDisplay.context.fillText(this.vehicle.speed.toFixed(2) * 1000 * this.vehicle.speedModifier + " km/h", 375, 180);
    this.statsDisplay.context.fillText('Status do Jogo:', 145, 230);
  }

  onRaceEnded() {
    if (this.isOnEndDisplay)
      return;
    this.raceEnded = true;
    this.isOnEndDisplay = true;

    const endDisplay = new MyDisplay(
      new THREE.Vector3(25, 15, 0),
      new THREE.Vector3(-80, 5, 15),
      new THREE.Vector3(-Math.PI, Math.PI / 2, Math.PI),
      [512, 364]
    );

    this.app.scene.add(endDisplay.mesh);
    this.app.controls.reset();
    this.app.controls.target.copy(new THREE.Vector3(-80, 5, 15)); // Direcionar a câmera para a tela final
    this.app.controls.update();

    endDisplay.mesh.material.map.needsUpdate = true;
    endDisplay.context.fillText("Resultados da Corrida", 260, 30);

    // Resultados do jogador
    endDisplay.context.fillText("Jogador", 80, 70);
    endDisplay.context.fillText("Carro:", 50, 120);
    endDisplay.context.fillText(window.globalSelectedCar, 130, 120);
    endDisplay.context.fillText("Tempo:", 60, 170);
    endDisplay.context.fillText(this.playerTime.toFixed(2), 160, 170);

    // Resultados do Bot
    endDisplay.context.fillText("Bot", 410, 70);
    endDisplay.context.fillText("Carro:", 330, 120);
    endDisplay.context.fillText(window.globalSelectedOpponent, 410, 120);
    endDisplay.context.fillText("Tempo:", 340, 170);
    endDisplay.context.fillText(this.botTime.toFixed(2), 440, 170);

    if (this.playerTime > this.botTime) {
      // Bot vence
      endDisplay.context.fillText("PERDEDOR", 90, 260);
      endDisplay.context.fillText("VENCEDOR", 400, 260);
      setInterval(() =>
        this.fireworks.push(new MyFirework(this.app, this, new THREE.Vector3(-79, 0, 8))),
        350);
    } else {
      // Jogador vence
      endDisplay.context.fillText("PERDEDOR", 410, 260);
      endDisplay.context.fillText("VENCEDOR", 100, 260);
      setInterval(() =>
        this.fireworks.push(new MyFirework(this.app, this, new THREE.Vector3(-79, 0, 22))),
        350);

    }
    setTimeout(() => {
      this.raceEnded = false;
      this.isOnEndDisplay = false;
      console.log("Fora da tela final.")
    }, 2000000);
  }

  /**
   * Atualiza o conteúdo.
   * Este método é chamado a partir do método de renderização da aplicação.
   */
  update(elapsedTime) {
    if (this.raceEnded) {
      this.app.activeCamera.position.lerp(new THREE.Vector3(-70, 5, 15), 0.02); // Interpolar a posição da câmera para encarar a tela final
      // Para cada fogos de artifício
      for (let i = 0; i < this.fireworks.length; i++) {
        // O fogo de artifício terminou?
        if (this.fireworks[i].done) {
          // Remover fogo de artifício
          this.fireworks.splice(i, 1)
          continue;
        }
        // Caso contrário, atualize o fogo de artifício
        this.fireworks[i].update()
      }
      this.onRaceEnded();
      return;
    }

    this.updateStatsDisplay();
    if (this.isPaused) {
      this.statsDisplay.context.fillText('Pausado', 420, 230);
    }
    else this.statsDisplay.context.fillText('Jogando', 420, 230);
    let lastTime = this.prevTime;
    this.prevTime = performance.now();
    if (this.isPaused) {
      return; // Pular atualização quando pausado
    }
    if (window.started) window.gameTime += 1 / 120;
    if (this.vehicle.isCollidingWithFinishLine(this.plane2) && window.passedCheckpoint) {
      window.lapCounter += 1;
      if (window.lapCounter === this.lapLimit) {
        this.playerFinished = true;
        this.playerTime = window.gameTime;
      }
      window.passedCheckpoint = false;
    }
    if (this.vehicle.isCollidingWithFinishLine(this.plane3)) {
      window.passedCheckpoint = true;
    }

    if (this.bot.isCollidingWithFinishLine(this.plane2) && window.botPassedCheckpoint) {
      this.botLaps += 1;
      if (this.botLaps === this.lapLimit) {
        this.botTime = window.gameTime;
        this.botFinished = true;
      }
      window.botPassedCheckpoint = false;
    }
    if (this.bot.isCollidingWithFinishLine(this.plane3)) {
      window.botPassedCheckpoint = true;
    }

    if (this.playerFinished && this.botFinished) {
      this.raceEnded = true;
    }

    if (window.started) {
      this.action.play();
    }

    this.vehicle.update();
    this.bot.update();

    for (const object of this.reader.trackObjects)
      object.update(elapsedTime);

    this.bot.update();
    if (this.reader.track.isVehicleOnTrack(this.vehicle.mesh.position)) {
      this.vehicle.maxSpeed = 0.1;

    }
    else {
      this.vehicle.maxSpeed = 0.05;
      console.log("fora da pista");
    }
    // Animação do carro do bot
    this.mixer.update(performance.now() - lastTime);
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    var pauseOverlay = document.getElementById("pauseOverlay");

    if (this.isPaused) {
      pauseOverlay.style.display = "block";
    } else {
      pauseOverlay.style.display = "none";
    }
  }

}

export { MyContents };
