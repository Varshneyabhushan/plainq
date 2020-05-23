import QueueItem, { status } from "./queueItem";

interface QueueItemWithError {
  item: QueueItem;
  error: Error;
}

let withError = (message: string): QueueItemWithError => {
  return { item: null, error: new Error(message) };
};

let isValidIndex = (index: number, length: number): boolean => {
  return 0 <= index && index <= length - 1;
};

export default class Queue {
  items: QueueItem[] = [];
  currentIndex: number = 0;
  status = status.stopped;
  circular = true;

  constructor(circular?: boolean) {
    this.circular = circular ?? false;
  }

  addItem(item: QueueItem, index?: number): void {
    if (index >= this.items.length - 1 || index === undefined)
      this.items.push(item);
    else {
      let head = this.items.slice(0, index);
      let tail = this.items.slice(index, this.items.length);
      this.items = head.concat(item, tail);
      if (index <= this.currentIndex) {
        this.currentIndex += 1;
      }
    }

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

  swapItems(i: number, j: number): Error {
    let length = this.items.length;
    if (length == 0) return new Error("items are empty");

    if (!isValidIndex(i, length)) return new Error("first index is not valid");
    if (!isValidIndex(j, length)) return new Error("second index is not valid");

    if (i > j) [i, j] = [j, i];

    let item1 = this.items[i];
    let item2 = this.items[j];

    let head = this.items.slice(0, i);
    let middle = this.items.slice(i + 1, j);
    let tail = this.items.slice(j + 1, this.items.length);

    this.items = head.concat(item2, middle, item1, tail);

    if (this.currentIndex == i) this.currentIndex = j;
    else if (this.currentIndex == j) this.currentIndex = i;

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

  goNext(): Error {
    if (this.status === status.stopped) return this.start();
    let item = this.items[this.currentIndex]
    item.stop(true)
    item.status = status.complete
    this.currentIndex += 1
    if(this.currentIndex == this.items.length) {
      if(this.circular) this.currentIndex = 0
      else {
        this.status = status.complete
        return null
      }
    }

    return this.start()
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
