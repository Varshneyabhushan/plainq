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

  onStart: queueEventCallback;
  onPause: queueEventCallback;
  onResume: queueEventCallback;
  onStop: queueEventCallback;
  isComplete: boolean;
  __markCompleteCallback: Function;

  start(): Error {
    if (!this.onStart) return new Error("cannot be started");

    let result = this.onStart();
    if (result == null) this.status = status.playing;
    return result;
  }

  pause(): Error {
    if (!this.onPause) return new Error("cannot be paused");

    if (this.status === status.stopped)
      return new Error("stopped item cannot be paused");

    if (this.status === status.paused) return new Error("already stopped");

    let result = this.onPause();
    if (result == null) this.status = status.paused;
    return result;
  }

  resume(): Error {
    if (!this.onResume) return new Error("cannot be resumed");

    if (this.status === status.playing) return new Error("already playing");

    if (this.status === status.stopped)
      return new Error("stopped item cannot be resumed");

    let result = this.onResume();
    if (result == null) this.status = status.playing;
    return result;
  }

  stop(): Error {
    if (!this.onStop) return new Error("cannot be stopped");

    if (this.status === status.stopped) return new Error("already stopped");

    let result = this.onStop();
    if (result == null) this.status = status.stopped;
    return result;
  }

  onComplete(callback: Function): void {
    this.__markCompleteCallback = callback;
  }

  //should be called by implimenter
  markComplete(): void {
    if (this.__markCompleteCallback) return this.__markCompleteCallback();
  }
}
