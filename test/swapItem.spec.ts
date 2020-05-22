import ProgressItem from "./progressItem";
import Queue from "../src/queue";
import { status } from "../src/queueItem";

test("swap Items in queue", () => {
    let queue = new Queue(false);
    let itemsCount = 10;
  
    jest.useFakeTimers();
    for (let i = 1; i <= itemsCount; i++) queue.addItem(new ProgressItem());
    let err = queue.start();
    expect(err).toBeNull();

    

    let item1 = queue.items[2]  //currently running
    let item2 = queue.items[5]

    jest.advanceTimersByTime(2* 10000)
    
    //test swap
    err = queue.swapItems(2, 5)
    expect(err).toBeNull()
    expect(queue.items[2]).toBe(item2)
    expect(queue.items[5]).toBe(item1)


    //test flow on completion
    expect(queue.currentIndex).toBe(5)
    expect(queue.items[5].status).toBe(status.playing)
    expect(queue.items[2].status).toBe(status.stopped)
    
    jest.advanceTimersByTime(15000)

    //should flow from 5 to 6
    expect(queue.items[5].status).toBe(status.complete)
    expect(queue.items[6].status).toBe(status.playing)
    
    queue.swapItems(6, 9)
    jest.advanceTimersByTime(5000)
    expect(queue.items[9].status).toBe(status.complete)
    expect(queue.status).toBe(status.complete)

})