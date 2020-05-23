import { status } from "../src/queueItem";
import ProgressItem from "./progressItem";

test("start, complete of item", () => {
  let time = 0;
  jest.useFakeTimers();

  let item = new ProgressItem();
  item.start();

  item.on(status.complete, () => expect(time).toBe(10000));

  //complete should be false when started
  expect(item.isComplete()).toBeFalsy();

  jest.advanceTimersByTime((time += 5000));
  expect(item.isComplete()).toBeFalsy();

  jest.advanceTimersByTime((time += 5000));

  //should be finished after 10000ms
  expect(item.isComplete()).toBeTruthy();

  jest.advanceTimersByTime((time += 5000));
  expect(item.status).toBe(status.complete);
});

test("stopping the item", () => {
  let time = 0;
  jest.useFakeTimers();

  let item = new ProgressItem();
  item.start();

  let isStopped = false;

  item.on(status.stopped, () => {
    isStopped = true;
    expect(time).toBe(5000);
    expect(item.status).toBe(status.stopped);
  });

  jest.advanceTimersByTime((time += 5000));
  item.stop();

  jest.advanceTimersByTime((time += 100));

  expect(isStopped).toBeTruthy();
  expect(item.progress).toBe(50);
});

test("pause the item", () => {
  jest.useFakeTimers();

  let item = new ProgressItem();
  item.start();

  let checkProgress = (val) => expect(item.progress).toBe(val);

  jest.advanceTimersByTime(2000);
  item.pause();

  jest.advanceTimersByTime(1000);
  checkProgress(20);

  jest.advanceTimersByTime(10000);
  expect(item.isComplete()).toBeFalsy();

  item.resume();
  checkProgress(20);

  jest.advanceTimersByTime(3000);
  checkProgress(50);

  jest.advanceTimersByTime(5000);
  checkProgress(100);
  expect(item.isComplete()).toBeTruthy();
});
