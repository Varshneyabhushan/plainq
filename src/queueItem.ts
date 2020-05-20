export enum queueItemState {
  playing,
  stopped,
  paused,
}

export interface queueEventCallback {
  (): Error;
}

export default class QueueItem {
  state: queueItemState;

  onStart: queueEventCallback;
  onPause: queueEventCallback;
  onResume: queueEventCallback;
  onStop: queueEventCallback;
  isComplete: boolean;
  markCompleteCallback: Function;

  start(): Error {
    if (!this.onStart) return new Error("cannot be started");

    let result = this.onStart();
    if (result == null) this.state = queueItemState.playing;
    return result;
  }

  pause(): Error {
    if (!this.onPause) return new Error("cannot be paused");

    if (this.state === queueItemState.stopped)
      return new Error("stopped item cannot be paused");

    if (this.state === queueItemState.paused)
      return new Error("already stopped");

    let result = this.onPause();
    if (result == null) this.state = queueItemState.paused;
    return result;
  }

  resume(): Error {
    if (!this.onResume) return new Error("cannot be resumed");

    if (this.state === queueItemState.playing)
      return new Error("already playing");

    if (this.state === queueItemState.stopped)
      return new Error("stopped item cannot be resumed");

    let result = this.onResume();
    if (result == null) this.state = queueItemState.playing;
    return result;
  }

  stop(): Error {
    if (!this.onStop) return new Error("cannot be stopped");

    if (this.state === queueItemState.stopped)
      return new Error("already stopped");

    let result = this.onStop();
    if (result == null) this.state = queueItemState.stopped;
    return result;
  }

  onComplete(callback: Function): void {
    this.markCompleteCallback = callback;
  }

  //should be called by implimenter
  markComplete() : void {
    if(this.markCompleteCallback)
      return this.markCompleteCallback()
  }
}
