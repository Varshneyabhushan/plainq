import QueueItem from "../src/queueItem"

export default class ProgressItem extends QueueItem {
    progress: number;
    interval: NodeJS.Timeout;
    constructor() {
      super(false);
      this.progress = 0;
    }
  
    onStart(): Error {
      this.interval = setInterval(() => {
        this.progress += 1;
        if (this.progress == 100) this.markComplete();
      }, 100);
  
      return null;
    }
  
    onStop(): Error {
      clearInterval(this.interval);
      return null;
    }
  }