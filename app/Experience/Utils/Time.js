export default class Time {
  constructor(){
    this.start = Date.now();
    this.current = this.start;
    this.elapsed = 0;
    this.deltat = 16;
  }

  update(){
    const currentTime = Date.now();
    this.delta = (currentTime - this.current) / 1000;
    this.current = currentTime;
    this.elapsed = this.current - this.start;
  }
}