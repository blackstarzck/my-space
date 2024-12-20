import * as THREE from "three";
import { EventEmitter } from "events";
import Experience from "../../Experience.js";

import { Capsule } from "three/examples/jsm/Addons.js";
import { velocity } from "three/tsl";

export default class Player extends EventEmitter {
  constructor(){
    super();
    this.experience = new Experience();
    this.camera = this.experience.camera;

    this.initPlayer();
    this.initControls();

    this.addEventListeners();
  }

  initPlayer(){
    this.player = {};
    this.player.body = this.camera.perspectiveCamera;

    this.player.onFloor = false;
    this.player.gravity = 60;

    this.player.spawn = {
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
    };

    this.player.raycaster = new THREE.Raycaster();

    this.player.height = 1.7;
    this.player.position = new THREE.Vector3();
    this.player.rotation = new THREE.Euler();
    this.player.rotation.order = "YXZ";

    this.player.velocity = new THREE.Vector3();
    this.player.direction = new THREE.Vector3();

    this.player.speedMultiplier = 0.8;
    
    this.player.collider = new Capsule(
      new THREE.Vector3(),
      new THREE.Vector3(),
      0.35
    );
  }

  initControls(){
    this.actions = {};
  }

  addEventListeners() {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    document.addEventListener("pointermove", this.onDesktopPointerMove);
    document.addEventListener("pointerdown", this.onPointerDown);
  }

  onKeyDown = (e) => {
    if (document.pointerLockElement !== document.body) return;

    if (e.code === "KeyW") this.actions.forward = true;
    if (e.code === "KeyS") this.actions.backward = true;
    if (e.code === "KeyA") this.actions.left = true;
    if (e.code === "KeyD") this.actions.right = true;

    if (e.code === "ShiftLeft") this.actions.run = true;

    if (e.code === "Space") this.actions.jump = true;
  };

  onKeyUp = (e) => {
    if (document.pointerLockElement !== document.body) return;

    if (e.code === "KeyW") this.actions.forward = false;
    if (e.code === "KeyS") this.actions.backward = false;
    if (e.code === "KeyA") this.actions.left = false;
    if (e.code === "KeyD") this.actions.right = false;

    if (e.code === "ShiftLeft") this.actions.run = false;

    if (e.code === "Space") this.actions.jump = false;
  };

  onPointerDown = (e) => {
    if (e.pointerType === "mouse") {
      document.body.requestPointerLock();
      return;
    }
  };

  onDesktopPointerMove = (e) => {
    if (document.pointerLockElement !== document.body) return; // pointer is not locked
    const sensitivity = 500;
    this.player.body.rotation.order = this.player.rotation.order;

    // controll camera rotation (player.body: perspectiveCamera)
    this.player.body.rotation.x -= e.movementY / sensitivity;
    this.player.body.rotation.y -= e.movementX / sensitivity;

    // x 축으로 무한 회전 제한
    this.player.body.rotation.x = THREE.MathUtils.clamp(
      this.player.body.rotation.x,
      -Math.PI / 2,
      Math.PI / 2
    );
  };
}