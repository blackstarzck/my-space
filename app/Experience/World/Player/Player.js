import * as THREE from "three";
import { EventEmitter } from "events";
import Experience from "../../Experience.js";

import { Capsule } from "three/examples/jsm/Addons.js";


export default class Player extends EventEmitter {
  constructor(){
    super();
    this.experience = new Experience();
    this.time = this.experience.time;
    this.camera = this.experience.camera;
    this.octree = this.experience.world.octree;

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
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      velocity: new THREE.Vector3(),
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

  playerCollisions(){
     // check for collisions (player.collider: Capsule)
    const result = this.octree.capsuleIntersect(this.player.collider);

    this.player.onFloor = false;

    if(result){
      this.player.onFloor = result.normal.y > 0;
      this.player.collider.translate(
        result.normal.multiplyScalar(result.depth)
      );
    }
  }

  getForwardVector(){
    // get forward vector of the player
    this.camera.perspectiveCamera.getWorldDirection(this.player.direction);
    this.player.direction.y = 0;
    this.player.direction.normalize(); // normalize the vector

    return this.player.direction;
  }

  getSideVector() {
    this.camera.perspectiveCamera.getWorldDirection(this.player.direction);
    this.player.direction.y = 0;
    this.player.direction.normalize();
    this.player.direction.cross(this.camera.perspectiveCamera.up); // get side vector

    return this.player.direction;
  }

  spawnPlayerOutOfBounds(){
    const spawnPos = new THREE.Vector3(12.64, 1.7 + 0.5, 64.0198);

    this.player.velocity = this.player.spawn.velocity;
    this.player.body.position.copy(spawnPos);

    this.player.collider.start.copy(spawnPos);
    this.player.collider.end.copy(spawnPos);

    this.player.collider.end.y += this.player.height;
  }

  update(){
    const speed =
      (this.player.onFloor ? 1.75 : 0.2) *
      this.player.gravity *
      this.player.speedMultiplier;

    // amount of distance we  travel between each frame
    let speedDelta = this.time.delta * speed;

    if(this.actions.run) speedDelta *= 1.6;

    if (this.actions.forward) {
      this.player.velocity.add(
        this.getForwardVector().multiplyScalar(speedDelta)
      );
    };
    if (this.actions.backward) {
      this.player.velocity.add(
        this.getForwardVector().multiplyScalar(-speedDelta * 0.5)
      );
    };
    if (this.actions.left) {
      this.player.velocity.add(
        this.getSideVector().multiplyScalar(-speedDelta * 0.75)
      );
    };
    if (this.actions.right) {
      this.player.velocity.add(
        this.getSideVector().multiplyScalar(speedDelta * 0.75)
      );
    };
    if(this.player.onFloor){
      if(this.actions.jump){
        this.player.velocity.y = 30;
      }
    };

    // easing in, easing out when jumping. this is for a more natural jump
    let damping = Math.exp(-5 * this.time.delta) - 1;

    if (!this.player.onFloor) {
      this.player.velocity.y -= this.player.gravity * this.time.delta;
      // when moving and jum at the same time, the speed slow down.
      // for a more natural jump, we need to add damping to the velocity
      damping *= 0.1;
    }

    this.player.velocity.addScaledVector(this.player.velocity, damping);

    const deltaPosition = this.player.velocity
      .clone()
      .multiplyScalar(this.time.delta);

    this.player.collider.translate(deltaPosition);
    this.playerCollisions();

    this.player.body.position.copy(this.player.collider.end);
    this.player.body.updateMatrixWorld();

    if (this.player.body.position.y < -20) {
      this.spawnPlayerOutOfBounds();
    }
  }
}