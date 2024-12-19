import Loaders from "./Loaders.js";
import {
  EventEmitter
} from "events";

export default class Resources extends EventEmitter {
  constructor(assets) {
    super();

    this.items = {};
    this.assets = assets;
    this.location = null;

    this.loaders = new Loaders().loaders;
  }

  // 한번 로드된 리소스는 다시 로드하지 않도록 함
  // 사용자가 매번 새로고침을 하지 않는 이상 리소스를 다시 로드할 필요가 없음
  determineLoad(location) {
    this.location = location;

    if (!this.items.hasOwnProperty(this.location)) {
      this.items[this.location] = {};
      this.startLoading();
    } else {
      this.emitReady();
    }
  }

  emitReady() {
    this.emit("ready");
  }

  startLoading() {
    this.loaded = 0;
    this.queue = this.assets[0][this.location].assets.length;

    console.log("location: ", this.location)

    for (const asset of this.assets[0][this.location].assets) {
      if (asset.type === "glbModel") {
        this.loaders.gltfLoader.load(asset.path, (file) => {
          this.singleAssetLoaded(asset, file);
        });
      } else if (asset.type === "imageTexture") {
        this.loaders.textureLoader.load(asset.path, (file) => {
          this.singleAssetLoaded(asset, file);
        });
      } else if (asset.type === "cubeTexture") {
        this.loaders.cubeTextureLoader.load(asset.path, (file) => {
          this.singleAssetLoaded(asset, file);
        });
      }
    }
  }

  singleAssetLoaded(asset, file) {
    this.items[this.location][asset.name] = file;
    this.loaded++;

    if (this.loaded === this.queue) {
      console.log("???")
      this.emitReady();
    }
  }
}