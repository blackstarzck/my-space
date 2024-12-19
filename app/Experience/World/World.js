import * as THREE from "three";
import {
  EventEmitter
} from "events";
import Experience from "../Experience.js";

// import {
//   Octree
// } from "three/examples/jsm/math/Octree";

// import Player from "./Player/Player.js";

// import Whiterun from "./Whiterun/Whiterun.js";
// import Interior from "./Interior/Interior.js";

export default class World extends EventEmitter {
  constructor() {
    super();
    this.experience = new Experience();
    this.resources = this.experience.resources;
    this.scene = this.experience.scene;

    // this.octree = new Octree();

    this.localStorage = this.experience.localStorage;
    this.state = this.localStorage.state;


    this.resources.determineLoad(this.state.location);

    this.player = null;

    this.resources.on("ready", () => {
      const geometry = new THREE.BoxGeometry( 1, 1, 1 );
      const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
      const cube = new THREE.Mesh( geometry, material );
      this.scene.add( cube );
    });
  }

  setWorld() {
    this.whiterun = new Whiterun();
    this.player.setInteractionObjects(
      this.whiterun.interactions.interactions
    );

    // this.interior = new Interior();
  }

  setPlayerEvents() {
    this.player.on("updateMessage", (objectName) => {
      this.emit("updateMessage", objectName);
    });

    this.player.on("interact", (objectName) => {
      this.emit("interact", objectName);
    });
  }

  update() {
    // if (this.player) this.player.update();
  }
}