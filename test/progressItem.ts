import QueueItem from "../src/queueItem";

//progress for 10s and stops
export default class ProgressItem extends QueueItem {
  progress: number;
  interval: NodeJS.Timeout;
  constructor() {
    super(false);
    this.progress = 0;
  }

  protected toStart(): Error {
    this.interval = setInterval(() => {
      this.progress += 1;
      if (this.progress == 100) this.markComplete();
    }, 100);

    return null;
  }

  protected toStop(): Error {
    clearInterval(this.interval);
    return null;
  }
}
