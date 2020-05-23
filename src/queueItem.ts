import { EventEmitter } from "events";

export enum status {
  playing = "playing",
  stopped = "stopped",
  paused = "paused",
  complete = "complete",
}

export default class QueueItem extends EventEmitter {
  status = status.stopped;

  pausable: boolean;

  constructor(pausable?: boolean) {
    super()
    this.pausable = pausable ?? true;
  }

  setStatus(status: status, info?) {
    this.status = status
    this.emit(status, info)
  }

  start(): Error {
    let result = this.toStart();
    if (result == null) this.setStatus(status.playing)
    return result;
  }

  pause(): Error {
    if (!this.pausable) return new Error("cannot be paused");

    if (this.status === status.stopped)
      return new Error("stopped item cannot be paused");

    if (this.status === status.paused) return new Error("already paused");

    if (this.status === status.complete) return new Error("already complete");

    let result = this.toPause();
    if (result == null) this.setStatus(status.paused)
    return result;
  }

  resume(): Error {
    if (!this.pausable) return new Error("cannot be resumed");

    if (this.status === status.playing) return new Error("already playing");

    if (this.status === status.stopped)
      return new Error("stopped item cannot be resumed");

    if (this.status === status.complete) return new Error("already complete");

    let result = this.toResume();
    if (result == null) this.setStatus(status.playing)
    return result;
  }

  stop(interrupted?: boolean): Error {
    if (this.status === status.stopped) return new Error("already stopped");

    if (this.status === status.complete) return new Error("already complete");

    let result = this.toStop(interrupted);
    if (result == null) this.setStatus(status.stopped, interrupted ?? false)
    return result;
  }

  //should be called by implimenter
  protected toStart(): Error {
    return null;
  }
  protected toPause(): Error {
    return null;
  }
  protected toResume(): Error {
    return null;
  }
  protected toStop(interrupted?: boolean): Error {
    return null;
  }

  protected markComplete(): void {
    this.setStatus(status.complete)
  }

  isComplete(): boolean {
    return this.status === status.complete;
  }
}
