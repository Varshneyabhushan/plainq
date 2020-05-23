import ProgressItem from "./progressItem";
import Queue from "../src/queue";
import { status } from "../src/queueItem";

test("testing skip", () => {
  let queue = new Queue(true);
  let itemsCount = 5;

  jest.useFakeTimers();
  for (let i = 1; i <= itemsCount; i++) queue.addItem(new ProgressItem());

  //start by skipping
  let err = queue.goNext();
  expect(err).toBeNull();
  expect(queue.currentIndex).toBe(0);
  expect(queue.status).toBe(status.playing);
  expect(queue.items[0].status).toBe(status.playing);

  jest.advanceTimersByTime(500);

  for (let i = 1; i <= 4; i++) {
    let err = queue.goNext();
    expect(err).toBeNull();
    expect(queue.currentIndex).toBe(i);
    expect(queue.items[i - 1].status).toBe(status.complete);
    expect(queue.items[i].status).toBe(status.playing);
  }

  err = queue.goNext();
  expect(err).toBeNull();

  expect(queue.status).toBe(status.complete);
});

test("testing prev", () => {
  let queue = new Queue(true);
  let itemsCount = 5;

  jest.useFakeTimers();
  for (let i = 1; i <= itemsCount; i++) queue.addItem(new ProgressItem());

  let err = queue.goPrev();
  expect(err).toBe(null);

  for (let i = 4; i >= 1; i--) {
    expect(queue.currentIndex).toBe(i);
    expect(queue.status).toBe(status.playing);

    err = queue.goPrev();
    expect(err).toBe(null);

    expect(queue.currentIndex).toBe(i - 1)
    expect(queue.items[i].status).toBe(status.stopped)
  }

  jest.advanceTimersByTime(30000)
  expect(queue.status).toBe(status.playing)
  expect(queue.items[4].status).toBe(status.stopped)
  expect(queue.items[3].status).toBe(status.playing)

  jest.advanceTimersByTime(10000)
  expect(queue.items[4].status).toBe(status.playing)

  jest.advanceTimersByTime(10000)
  expect(queue.status).toBe(status.complete)
});
