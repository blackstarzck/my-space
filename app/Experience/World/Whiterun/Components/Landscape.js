import * as THREE from "three";
import Experience from "../../../Experience.js";

import { OctreeHelper } from "three/examples/jsm/helpers/OctreeHelper.js";

export default class Landscape {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.octree = this.experience.world.octree;

    this.init();
    this.setMaterials();
    this.setLandscapeCollider();
  }

  init() {
    this.landscape = this.resources.items.whiterun.land.scene; // GLTFLoader 로드된 객체: Object3D
    this.land_texture = this.resources.items.whiterun.land_texture; // // TextureLoader 로드된 THREE.Texture 객체    
  }

  setMaterials() {
    this.land_texture.flipY = false; // If set to true, the texture is flipped along the vertical axis when uploaded to the GPU
    this.land_texture.encoding = THREE.sRGBEncoding;

    this.landscape.children.forEach((child) => {
      child.material = new THREE.MeshBasicMaterial({
        map: this.land_texture,
      });
    });

    this.scene.add(this.landscape);
  }

  setLandscapeCollider() {
    const collider = this.landscape.getObjectByName("collider"); // 여기서 "colllider"는 bleder에서 object 에 이름을 지정한 것
    this.octree.fromGraphNode(collider);

    // collider 는 플레이어가 충돌할 수 있는 물체들의 그룹이다.
    // blender에서 collider 라는 이름으로 object를 만들어서 불러온다.
    // collider 또한 GLTFLoader 에 의해 로드된 Object3D 로써, parent/geometry/material 등을 가지고 있다.
    // 그렇기 때문에 아래와 같이 초기화를해줄 필요가 있다.
    collider.removeFromParent();
    collider.geometry.dispose();
    collider.material.dispose();

    // const helper = new OctreeHelper(this.octree);
    // helper.visible = true;
    // this.scene.add(helper);
  }
}