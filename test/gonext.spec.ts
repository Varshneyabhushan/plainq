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
  expect(queue.status).toBe(status.playing)
  expect(queue.items[0].status).toBe(status.playing)

  jest.advanceTimersByTime(500)

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
