import ProgressItem from "./progressItem";
import Queue from "../src/queue";
import { status } from "../src/queueItem";

test("removing the item", () => {
  let queue = new Queue(true);
  let itemsCount = 5;

  jest.useFakeTimers();
  for (let i = 1; i <= itemsCount; i++) queue.addItem(new ProgressItem());
  let err = queue.start();
  expect(err).toBeNull();

  let advanceOne = () => jest.advanceTimersByTime(10000);

  //initial setup
  expect(queue.status).toBe(status.playing);
  expect(queue.currentIndex).toBe(0);
  expect(queue.items.length).toBe(5);

  //3rd item is 50% progressed
  jest.advanceTimersByTime(25000);

  expect(queue.currentIndex).toBe(2);

  //remove 4th item
  queue.removeItem(3);
  expect(queue.status).toBe(status.playing);
  expect(queue.currentIndex).toBe(2);
  expect(queue.items[queue.currentIndex].status).toBe(status.playing);
  expect(queue.items.length).toBe(4);

  //remove 2nd item
  queue.removeItem(1);
  expect(queue.status).toBe(status.playing);
  expect(queue.currentIndex).toBe(1);
  expect(queue.items[queue.currentIndex].status).toBe(status.playing);
  expect(queue.items.length).toBe(3);

  //remove currentItem
  queue.removeItem(1);
  expect(queue.status).toBe(status.playing);
  expect(queue.currentIndex).toBe(1);
  expect(queue.items[queue.currentIndex].status).toBe(status.playing);
  expect(queue.items.length).toBe(2);

  jest.advanceTimersByTime(5000);
  expect(queue.currentIndex).toBe(1);
  expect(queue.items[queue.currentIndex].isComplete()).toBeFalsy();
  expect(queue.status).toBe(status.playing);

  //item should be complete only after 10s
  jest.advanceTimersByTime(5000);
  expect(queue.items[queue.currentIndex].isComplete()).toBeTruthy();
  expect(queue.status).toBe(status.complete);
});

test("remove item when paused/ stopped", () => {
    let queue = new Queue(true);
    let itemsCount = 5;
  
    jest.useFakeTimers();
    for (let i = 1; i <= itemsCount; i++) queue.addItem(new ProgressItem());
    let err = queue.start();
    expect(err).toBeNull();
  
    let advanceOne = () => jest.advanceTimersByTime(10000);
  
    //initial setup
    expect(queue.status).toBe(status.playing);
    expect(queue.currentIndex).toBe(0);
    expect(queue.items.length).toBe(5);
  
    //3rd item is 50% progressed
    jest.advanceTimersByTime(25000);
  
    expect(queue.currentIndex).toBe(2);

    //pause the queue
    err = queue.pause()
    expect(err).toBeNull()
  
    //remove 4th item
    queue.removeItem(3);
    expect(queue.status).toBe(status.paused);
    expect(queue.currentIndex).toBe(2);
    expect(queue.items[queue.currentIndex].status).toBe(status.paused);
    expect(queue.items.length).toBe(4);

    advanceOne()
    expect(queue.status).toBe(status.paused);
    expect(queue.currentIndex).toBe(2);
    expect(queue.items[queue.currentIndex].status).toBe(status.paused);
    expect(queue.items.length).toBe(4);


    //resume the queue
    err = queue.resume()
    expect(err).toBeNull()

    expect(queue.status).toBe(status.playing);
    expect(queue.currentIndex).toBe(2);
    expect(queue.items[queue.currentIndex].status).toBe(status.playing);

    //pause the queue
    err = queue.stop()
    expect(err).toBeNull()
  
    //remove 2nd item
    queue.removeItem(1);
    expect(queue.status).toBe(status.stopped);
    expect(queue.currentIndex).toBe(1);
    expect(queue.items[queue.currentIndex].status).toBe(status.stopped);
    expect(queue.items.length).toBe(3);

    advanceOne()
    expect(queue.status).toBe(status.stopped);
    expect(queue.currentIndex).toBe(1);
    expect(queue.items[queue.currentIndex].status).toBe(status.stopped);
    expect(queue.items.length).toBe(3);

    //start the queue
    err = queue.start()
    expect(err).toBeNull()

    //pause the queue
    err = queue.pause()
    expect(err).toBeNull()

  
    //remove currentItem
    queue.removeItem(1);
    expect(queue.status).toBe(status.paused);
    expect(queue.currentIndex).toBe(1);
    expect(queue.items[queue.currentIndex].status).toBe(status.stopped);
    expect(queue.items.length).toBe(2);

    advanceOne()
    expect(queue.status).toBe(status.paused);
    expect(queue.currentIndex).toBe(1);
    expect(queue.items[queue.currentIndex].status).toBe(status.stopped);

    //start the queue
    err = queue.start()
    expect(err).toBeNull()

  
    jest.advanceTimersByTime(5000);
    expect(queue.currentIndex).toBe(1);
    expect(queue.items[queue.currentIndex].isComplete()).toBeFalsy();
    expect(queue.status).toBe(status.playing);
  
    //item should be complete only after 10s
    jest.advanceTimersByTime(5000);
    expect(queue.items[queue.currentIndex].isComplete()).toBeTruthy();
    expect(queue.status).toBe(status.complete);
})