import * as THREE from 'three';
import { MyApp } from './MyApp.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import { MyContents } from './MyContents.js';


var app, nameText, contents, startButton, exitButton, playerNameInput, selectedDifficultyElement, blankScreen, easyButton, mediumButton, hardButton, blankScreen, difficultyRow, mainRow, feupLogo;

function main() {
    app = new MyApp()
    // initializes the application
    app.init()
    contents = new MyContents(app)
    app.setContents(contents);

    // initializes the contents
    contents.init()
    // Create a variable to store the selected car
    window.globalSelectedCar = null;
    window.globalSelectedOpponent = null;
    window.hasPickedCar = true;
    window.hasPickedOpponent = true;
    window.started = false;
    window.difficulty = 1;
    window.lapCounter = 0;
    window.passedCheckpoint = false;
    window.gameTime = 0;
    startButton = document.createElement("button");
    exitButton = document.createElement("button");
    playerNameInput = document.createElement("input");
    selectedDifficultyElement = document.createElement("div");
    // Create difficulty buttons
    easyButton = document.createElement('button');
    mediumButton = document.createElement('button');
    hardButton = document.createElement('button');
    nameText = document.createElement("div");
    mainRow = document.createElement("div");
    feupLogo = document.createElement("img");
    feupLogo.src = "images/feup.jpeg";

    // Create a new div
    blankScreen = document.createElement("div");
    // Style the div to cover the entire screen
    blankScreen.style.position = 'fixed';
    blankScreen.style.top = '0';
    blankScreen.style.left = '0';
    blankScreen.style.width = '100%';
    blankScreen.style.height = '100%';
    //make background light yellow
    blankScreen.style.backgroundImage = "url('images/fundo-jogo.jpeg')";
    blankScreen.style.backgroundSize = "cover";

    app.render();
    // Append the div to the body
    document.body.appendChild(blankScreen);
    document.body.appendChild(nameText);

    createMenu();
    setEventStartButton();

}

export { main };
// Function to make the screen blank
function makeScreenBlank() {
    blankScreen.style.display = 'block';
}

// Function to unblank the screen
function unblankScreen() {
    blankScreen.style.display = 'none';
}


function getDificultyName(level) {
    if (level == 1) {
        return "Fácil";
    } else if (level == 2) {
        return "Médio";
    } else {
        return "Difícil";
    }
}

function createMenu() {
    makeScreenBlank();

    mainRow.style.position = 'absolute';
    mainRow.style.top = '0';
    mainRow.style.left = '0';
    mainRow.style.width = '100%';
    mainRow.style.height = '100%';
    mainRow.id = 'mainRow';


    nameText.innerHTML = "Corrida do Matrindinde";
    nameText.style.fontSize = '50px';
    nameText.style.color = 'white';
    nameText.style.fontFamily = 'Arial';
    nameText.style.textAlign = 'center';
    nameText.style.textShadow = '2px 2px 4px #000000';
    nameText.style.fontWeight = 'bold';
    nameText.id = 'gameName';
    mainRow.appendChild(nameText);


    playerNameInput.type = "text";
    playerNameInput.placeholder = "Digite o seu nome";
    playerNameInput.classList.add('input');
    playerNameInput.id = 'playerNameInput';
    mainRow.appendChild(playerNameInput);


    startButton.innerHTML = "Iniciar Jogo";
    startButton.style.padding = '10px 20px';
    startButton.style.fontSize = '20px';
    startButton.id = 'startButton';
    mainRow.appendChild(startButton);


    difficultyRow = document.createElement("div");
    difficultyRow.classList.add('dificulty-row');


    [easyButton, mediumButton, hardButton].forEach((button, index) => {
        button.innerHTML = ['Fácil', 'Médio', 'Difícil'][index];
        button.style.padding = '10px 20px';
        button.style.fontSize = '20px';
        document.body.appendChild(button);
        difficultyRow.appendChild(button);
    });

    mainRow.appendChild(difficultyRow);

    // Add event listeners
    easyButton.onclick = function () {
        window.difficulty = 1;
        selectedDifficultyElement.textContent = "Nível de Dificuldade: " + getDificultyName(window.difficulty);
    }

    mediumButton.onclick = function () {
        window.difficulty = 2;
        selectedDifficultyElement.textContent = "Nível de Dificuldade: " + getDificultyName(window.difficulty);
    }

    hardButton.onclick = function () {
        window.difficulty = 3;
        selectedDifficultyElement.textContent = "Nível de Dificuldade: " + getDificultyName(window.difficulty);
    }

    selectedDifficultyElement.textContent = "Nível de Dificuldade: " + getDificultyName(window.difficulty);
    selectedDifficultyElement.id = 'selectedDifficulty';
    mainRow.appendChild(selectedDifficultyElement);

    exitButton.innerHTML = "Sair";
    exitButton.style.padding = '10px 20px';
    exitButton.style.fontSize = '20px';
    exitButton.id = 'exitButton';
    mainRow.appendChild(exitButton);

    feupLogo.id = 'feupLogo';
    mainRow.appendChild(feupLogo);

    document.body.appendChild(mainRow);
}

export { createMenu };

function deleteButtons() {
    startButton.remove();
    exitButton.remove();
    playerNameInput.remove();
    selectedDifficultyElement.remove();
    easyButton.remove();
    mediumButton.remove();
    hardButton.remove();
    mainRow.remove();
    unblankScreen();
    nameText.style.display = 'none';
}



function setEventStartButton() {
    // Handle the start button click
    startButton.onclick = function () { //TODO: reset bot / player position; possibly remove them from track during selection
        // Remove the start and exit buttons
        deleteButtons()

        window.started = true;
        // hooks the contents object in the application object

        let gui = new MyGuiInterface(app)
        // set the contents object in the gui interface object
        gui.setContents(contents)
        gui.init();
    };
}

function removeMain() {
    // Remove all elements but script elements from body
    var i = document.body.childNodes.length;
    while (i--) {
        if (document.body.childNodes[i].nodeName !== 'script') {
            document.body.removeChild(document.body.childNodes[i]);
        }
    }
    // Readd stuff to body

    // Add div with id canvas
    let body = `
    <div id="canvas"></div>
    <div id="camera"></div>
    <script type="module" src="main.js"></script>
    <div id="pauseOverlay" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 2em; color: white; background-color: rgba(0, 0, 0, 0.5); padding: 20px; border-radius: 10px;">
      Game Paused
    </div>
    `
    document.body.innerHTML += body;
}
export { removeMain };
removeMain();
main();