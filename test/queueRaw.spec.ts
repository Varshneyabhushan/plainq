import ProgressItem from "./progressItem";
import Queue from "../src/queue";
import { status } from "../src/queueItem";

class ProgressItemRaw extends ProgressItem {
  protected toStop() {
    return null;
  }
}

test("testing pause when item is not pausable", () => {
  let queue = new Queue(true);
  let itemsCount = 20;

  jest.useFakeTimers();

  for (let i = 1; i <= itemsCount; i++) queue.addItem(new ProgressItemRaw(false));
  let err = queue.start();
  expect(err).toBeNull();
  if (err) return;

  let advanceOne = () => jest.advanceTimersByTime(10000);

  jest.advanceTimersByTime(100);
  err = queue.pause();
  expect(queue.status).toBe(status.paused);
  err = queue.resume();
  expect(err).toBeNull();

  for (let i = 0; i < itemsCount - 1; i++) {
    let index = queue.currentIndex;
    expect(index).toBe(i);
    queue.pause();
    expect(queue.items[index].status).toBe(status.playing);
    advanceOne();
    expect(queue.items[index].status).toBe(status.complete);
    expect(queue.status).toBe(status.paused)
    err = queue.resume();
    expect(err).toBeNull();
    expect(queue.currentIndex).toBe(i + 1);
  }

  expect(queue.currentIndex).toBe(itemsCount - 1);
  jest.advanceTimersByTime(9900);
  jest.advanceTimersByTime(100);
  expect(queue.status).toBe(status.complete);
});
