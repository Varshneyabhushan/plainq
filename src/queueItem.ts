export enum status {
  playing,
  stopped,
  paused,
}

export interface queueEventCallback {
  (): Error;
}

export default class QueueItem {
  status: status;

  private _isComplete: boolean;
  private _markCompleteCallback: Function;
  private pausable: boolean;

  constructor(pausable: boolean) {
    this.pausable = pausable;
  }

  start(): Error {
    let result = this.onStart();
    if (result == null) {
      this.status = status.playing;
      this._isComplete = false;
    }
    return result;
  }

  pause(): Error {
    if (!this.pausable) return new Error("cannot be paused");

    if (this.status === status.stopped)
      return new Error("stopped item cannot be paused");

    if (this.status === status.paused) return new Error("already stopped");

    let result = this.onPause();
    if (result == null) this.status = status.paused;
    return result;
  }

  resume(): Error {
    if (!this.pausable) return new Error("cannot be resumed");

    if (this.status === status.playing) return new Error("already playing");

    if (this.status === status.stopped)
      return new Error("stopped item cannot be resumed");

    let result = this.onResume();
    if (result == null) this.status = status.playing;
    return result;
  }

  stop(): Error {
    if (this.status === status.stopped) return new Error("already stopped");

    let result = this.onStop();
    if (result == null) this.status = status.stopped;
    return result;
  }

  onComplete(callback: Function): void {
    this._markCompleteCallback = callback;
  }

  //should be called by implimenter
  protected onStart(): Error {
    return null;
  }
  protected onPause(): Error {
    return null;
  }
  protected onResume(): Error {
    return null;
  }
  protected onStop(): Error {
    return null;
  }

  protected markComplete(): void {
    this._isComplete = true;
    this.status = status.stopped;
    if (this._markCompleteCallback) return this._markCompleteCallback();
  }

  isComplete(): boolean {
    return this._isComplete;
  }
}
