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
    item.onComplete(() => this.start());
  }

  start(): Error {
    let { item, error } = this.seekNextItem();
    if (error || item === null) return error;

    error = item.start();
    if (error) return error;
    this.status = status.playing;
    return null;
  }

  pause(): Error {
    if (this.status !== status.playing)
      return new Error("currently not playing");

    let { item, error } = this.seekNextItem();
    if (error || item === null) return error;

    if (item.status !== this.status) return new Error("statuses donot match");
    let err = item.pause();
    if (err) return err;

    this.status = status.paused;
    return null;
  }

  resume(): Error {
    if (this.status != status.paused) return new Error("not paused");

    let { item, error } = this.seekNextItem();
    if (error || item === null) return error;

    let err = item.resume();
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
