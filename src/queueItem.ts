export enum status {
  playing = "playing",
  stopped = "stopped",
  paused = "paused",
  complete = "complete",
}

export default class QueueItem {
  status: status;

  private _markCompleteCallback: Function;
  private _onStopCallback: Function;
  private pausable: boolean;

  constructor(pausable?: boolean) {
    this.pausable = pausable ?? true;
  }

  start(): Error {
    let result = this.toStart();
    if (result == null) {
      this.status = status.playing;
    }
    return result;
  }

  pause(): Error {
    if (!this.pausable) return new Error("cannot be paused");

    if (this.status === status.stopped)
      return new Error("stopped item cannot be paused");

    if (this.status === status.paused) return new Error("already paused");

    if (this.status === status.complete) return new Error("already complete");

    let result = this.toPause();
    if (result == null) this.status = status.paused;
    return result;
  }

  resume(): Error {
    if (!this.pausable) return new Error("cannot be resumed");

    if (this.status === status.playing) return new Error("already playing");

    if (this.status === status.stopped)
      return new Error("stopped item cannot be resumed");

    if (this.status === status.complete) return new Error("already complete");

    let result = this.toResume();
    if (result == null) this.status = status.playing;
    return result;
  }

  stop(interrupted?: boolean): Error {
    if (this.status === status.stopped) return new Error("already stopped");

    if (this.status === status.complete) return new Error("already complete");

    let result = this.toStop();
    if (result == null) {
      this.status = status.stopped;
      if (this._onStopCallback) this._onStopCallback(interrupted ?? false);
    }
    return result;
  }

  onComplete(callback: Function): void {
    this._markCompleteCallback = callback;
  }

  onStopped(callback: Function): void {
    this._onStopCallback = callback;
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
  protected toStop(): Error {
    return null;
  }

  protected markComplete(): void {
    this.status = status.complete;
    if (this._markCompleteCallback) return this._markCompleteCallback();
  }

  isComplete(): boolean {
    return this.status === status.complete;
  }
}
