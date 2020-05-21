import QueueItem, { status } from "./queueItem";

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
    item.onComplete(() => this.findAndPlay());
  }

  start(): Error {
    if (this.items.length == 0) return Error("items are empty");
    if (this.currentIndex >= this.items.length) return Error("index out of range");
    return this.findAndPlay();
  }

  pause(): Error {
    if(this.status !== status.playing) return new Error("currently not playing")
    if(this.items.length == 0) return new Error("items are empty")
    if(this.currentIndex >= this.items.length ) return new Error("index out of range")
    let currentItem = this.items[this.currentIndex]
    if(currentItem.status !== status.playing) return new Error('internal error : statuses donot match')
    
    let err = currentItem.pause()
    if(err) return err
    
    this.status = status.paused
    return null
  }

  resume(): Error {
    if(this.status != status.paused) return new Error("not paused")
    if(this.items.length == 0) return new Error("items are empty")
    if(this.currentIndex >= this.items.length ) return new Error("index out of range")
    let currentItem = this.items[this.currentIndex]
    if(currentItem.status !== status.paused) return new Error('internal error : statuses donot match')

    let err = currentItem.resume()
    if(err) return err

    this.status = status.playing
    return null
  }

  private findAndPlay(): Error {
    if (this.status === status.complete) return new Error("already complete");

    let totalLength = this.items.length;
    if (totalLength == 0) this.status = status.complete;

    let nextItem: QueueItem;
    for (let i = 0; i <= totalLength; i++) {
      if (this.items[this.currentIndex].isComplete()) {
        this.currentIndex += 1;
        if (this.currentIndex === this.items.length) {
          if (this.circular) this.currentIndex = 0;
          else break;
        }
        continue;
      }

      //item is not complete
      nextItem = this.items[this.currentIndex];
    }

    if (nextItem) {
      let err = nextItem.start();
      if (err) return err;
      this.status = status.playing;
      return null;
    }

    this.status = status.complete;
    return null;
  }
}
