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

  addItem(item: QueueItem, index?: number): void {
    if (!this.isValidIndex(index) || index === undefined) this.items.push(item);
    else {
      let head = this.items.slice(0, index);
      let tail = this.items.slice(index, this.items.length);
      this.items = head.concat(item, tail);
      if (index <= this.currentIndex) {
        this.currentIndex += 1;
      }
    }

    item.on(status.complete, () => { if(this.status === status.playing) this.start() })
  }

  removeItem(index: number): Error {
    if (!this.isValidIndex(index)) return new Error("index out of range");
    let item = this.items[index];
    this.items.splice(index, 1);
    if (index < this.currentIndex) this.currentIndex -= 1;

    item.removeAllListeners()
    if (this.status === status.playing) this.start();

    return null;
  }

  swapItems(i: number, j: number): Error {
    let length = this.items.length;
    if (length == 0) return new Error("items are empty");

    if (!this.isValidIndex(i)) return new Error("first index is not valid");
    if (!this.isValidIndex(j)) return new Error("second index is not valid");

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

  /**
   * stops the current Item and starts the queue again ( seeksNextItem and )
   *
   */
  goNext(): Error {
    if (this.status === status.stopped) return this.start();
    let item = this.items[this.currentIndex];
    item.stop(true);
    item.status = status.complete;
    let isEnd = this.advanceIndex();
    if (isEnd) {
      this.status = status.complete;
      return null;
    }

    return this.start();
  }

  goPrev(): Error {
    if(this.items.length == 0) return new Error("items are empty") 
    let item = this.items[this.currentIndex];
    item.stop(true);
    let isEnd = this.reverseIndex();
    if (isEnd) {
      this.status = status.complete;
      return null;
    }

    return this.start();
  }

  /**
   * gets the next unComplete item (including the currentIndex), starting from the currentIndex
   * sets the state of the queue to new unComplete item
   */
  seekNextItem(): QueueItemWithError {
    if (this.status === status.complete) return withError("already complete");

    let totalLength = this.items.length;
    if (totalLength === 0) return withError("items are empty");

    for (let i = 0; i <= totalLength; i++) {
      let item = this.items[this.currentIndex];
      if (item.isComplete()) {
        let isEnd = this.advanceIndex();
        if (isEnd) break;
      } else {
        this.status = item.status;
        return { item, error: null };
      }
    }

    this.status = status.complete;
    return { item: null, error: null };
  }

  private advanceIndex(): boolean {
    let totalLength = this.items.length;
    if (this.currentIndex == totalLength - 1) {
      if (this.circular) {
        this.currentIndex = 0;
        return false;
      } else {
        return true;
      }
    } else this.currentIndex += 1;
    return false;
  }

  private reverseIndex(): boolean {
    let totalLength = this.items.length;
    if (this.currentIndex == 0) {
      if (this.circular) {
        this.currentIndex = totalLength - 1;
        return false;
      } else {
        return true;
      }
    } else this.currentIndex -= 1;
    return false;
  }

  private isValidIndex(index?: number): boolean {
    index = index ?? this.currentIndex;
    let length = this.items.length;
    return 0 <= index && index <= length - 1;
  }
}
