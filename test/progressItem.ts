import QueueItem from "../src/queueItem";

//progress for 10s and stops
export default class ProgressItem extends QueueItem {
  progress: number = 0;
  interval: NodeJS.Timeout;

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

  protected toPause(): Error {
    return this.toStop()
  }

  protected toResume(): Error {
    return this.toStart()
  }
}
