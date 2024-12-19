import * as THREE from "three";

import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Resources from "./Utils/Resources.js";
import assets from "./Utils/assets.js";

import Camera from "./Camera.js";
import Renderer from "./Renderer.js";
import LocalStorage from "./LocalStorage.js";

import World from "./World/World.js";

export default class Experience {
  static instance; // Singleton instance

  constructor(canvas) {
    if(Experience.instance) {
      return Experience.instance;
    };

    Experience.instance = this;

    this.canvas = canvas;
    this.sizes = new Sizes();
    this.time = new Time();

    this.setScene();
    this.setCamera();
    this.setRenderer();
    this.setLocalStorge();
    this.setResources();
    this.setWorld();

    // Event listeners
    this.sizes.on('resize', () => {
      this.onResize();
    });

    this.update();
  }

  onResize(){
    this.camera.onResize();
    this.renderer.onResize();
  }

  update(){
    if(this.time) this.time.update();
    if(this.camera) this.camera.update();
    if(this.world) this.world.update();
    if(this.renderer) this.renderer.update();

    window.requestAnimationFrame(() => {
      this.update()
    });
  }

  setScene(){
    this.scene = new THREE.Scene();
  }

  setCamera(){
    this.camera = new Camera();
  }

  setRenderer(){
    this.renderer = new Renderer();
  }

  setLocalStorge(){
    this.localStorage = new LocalStorage();
  }

  setResources(){
    this.resources = new Resources(assets);
  }

  setWorld(){
    this.world = new World();
  }
}