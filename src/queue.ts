import QueueItem, { status } from "./queueItem";

interface QueueItemWithError {
  item: QueueItem;
  error: Error;
}

let withError = (message: string): QueueItemWithError => {
  return { item: null, error: new Error(message) };
};

export default class Queue {
  items: QueueItem[] = [];
  currentIndex: number = 0;
  status = status.stopped;
  circular = true;

  constructor(circular?: boolean) {
    this.circular = circular ?? false;
  }

  addItem(item: QueueItem): void {
    this.items.push(item);
    item.onComplete(() => {
      if (this.status === status.playing) this.start();
    });
  }

  removeItem(index: number): Error {
    if (index >= this.items.length || index < 0)
      return new Error("index out of range");
    let item = this.items[index];
    this.items.splice(index, 1);
    if (index < this.currentIndex) this.currentIndex -= 1;

    item.onComplete();
    if (this.status === status.playing) this.start();
    
    return null;
  }

  start(): Error {
    let { item, error } = this.seekNextItem();
    if (error || item === null) return error;

    error = item.start();
    if (error) return error;
    this.status = status.playing;
    return null;
  }

  stop(): Error {
    let { item, error } = this.seekNextItem();
    if (error || item === null) return error;

    error = item.stop();
    if (error) return error;
    this.status = status.stopped;
    return null;
  }

  pause(): Error {
    if (this.status !== status.playing)
      return new Error("currently not playing");

    let { item, error } = this.seekNextItem();
    if (error || item === null) return error;

    if (item.status !== this.status) return new Error("statuses donot match");

    if (item.pausable) {
      let err = item.pause();
      if (err) return err;
    }

    this.status = status.paused;
    return null;
  }

  resume(): Error {
    if (this.status != status.paused) return new Error("not paused");

    let { item, error } = this.seekNextItem();
    if (error || item === null) return error;

    let err = item.pausable ? item.resume() : item.start();
    if (err) return err;

    this.status = status.playing;
    return null;
  }

  seekNextItem(): QueueItemWithError {
    if (this.status === status.complete) return withError("already complete");

    let totalLength = this.items.length;
    if (totalLength === 0) return withError("items are empty");
    if (this.currentIndex >= totalLength)
      return withError("index out of range");

    for (let i = 0; i <= totalLength; i++) {
      let item = this.items[this.currentIndex];
      if (item.isComplete()) {
        this.currentIndex += 1;
        if (this.currentIndex === totalLength) {
          if (this.circular) this.currentIndex = 0;
          else break;
        }
      } else {
        this.status = item.status;
        return { item, error: null };
      }
    }

    this.status = status.complete;
    return { item: null, error: null };
  }
}
