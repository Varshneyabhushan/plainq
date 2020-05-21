import ProgressItem from "./progressItem";
import Queue from "../src/queue";
import { status } from "../src/queueItem"

test("adding items", () => {
  let queue = new Queue(true);
  let itemsCount = 20;

  for (let i = 1; i <= itemsCount; i++) queue.addItem(new ProgressItem());

  expect(queue.items.length).toBe(itemsCount);
});

test("shifting through items on complete", () => {
  let queue = new Queue(true);
  let itemsCount = 20;

  jest.useFakeTimers();

  for (let i = 1; i <= itemsCount; i++) queue.addItem(new ProgressItem());
  let err = queue.start();
  expect(err).toBe(null);
  if (err) return;

  let advanceOne = () => jest.advanceTimersByTime(10000);

  jest.advanceTimersByTime(100);

  for (let i = 0; i < itemsCount - 1; i++) {
    expect(queue.currentIndex).toBe(i);
    advanceOne();
    expect(queue.items[queue.currentIndex - 1].status).toBe(status.complete)
  }

  expect(queue.currentIndex).toBe(itemsCount - 1)
  jest.advanceTimersByTime(9900)
  expect(queue.status).toBe(status.complete)
});

test("pause and resume the queue", () => {
  let queue = new Queue(true);
  let itemsCount = 20;

  jest.useFakeTimers();

  for (let i = 1; i <= itemsCount; i++) queue.addItem(new ProgressItem());
  let err = queue.start();
  expect(err).toBe(null);
  if (err) return;

  let advanceOne = () => jest.advanceTimersByTime(10000);

  jest.advanceTimersByTime(100);
  queue.pause()
  expect(queue.status).toBe(status.paused)
  queue.resume()

  for (let i = 0; i < itemsCount - 1; i++) {
    let index = queue.currentIndex
    expect(index).toBe(i);
    queue.pause()
    advanceOne();
    expect(queue.items[index].status).toBe(status.paused)
    expect(queue.currentIndex).toBe(i);
    queue.resume()
    advanceOne()
    expect(queue.items[index].status).toBe(status.complete)
  }

  expect(queue.currentIndex).toBe(itemsCount - 1)
  jest.advanceTimersByTime(9900)
  expect(queue.status).toBe(status.complete)
})
