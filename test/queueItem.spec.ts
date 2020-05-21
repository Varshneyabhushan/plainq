import { status } from "../src/queueItem";
import ProgressItem from "./progressItem"


test("completion of item", () => {
  let time = 0
  jest.useFakeTimers();

  let item = new ProgressItem();
  item.start();

  item.onComplete(() => expect(time).toBe(10000));

  //complete should be false when started
  expect(item.isComplete()).toBeFalsy();

  jest.advanceTimersByTime(time += 5000);
  expect(item.isComplete()).toBeFalsy();

  jest.advanceTimersByTime(time += 5000);

  //should be finished after 10000ms
  expect(item.isComplete()).toBeTruthy();

  jest.advanceTimersByTime(time += 5000);
  expect(item.status).toBe(status.stopped)
});

test("stopping the item", () => {
  // let time = 0
  jest.useFakeTimers();

  let item = new ProgressItem();
  item.start();

  jest.advanceTimersByTime(5000)
  item.stop()
  
  expect(item.progress).toBe(50)
  expect(item.status).toBe(status.stopped)
})
