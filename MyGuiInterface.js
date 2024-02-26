import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        
        const folderGeometry = this.datgui.addFolder("Curve");
        folderGeometry
            .add(this.contents.reader.track, "segments", 10, 200)
            .step(50)
            .onChange((value)=>this.contents.updateCurve(value));
        folderGeometry
            .add(this.contents.reader.track, "textureRepeat", 1, 100)
            .step(1)
            .onChange((value)=>{this.contents.updateTextureRepeat(value)});
    }
}

export { MyGuiInterface };