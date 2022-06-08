import { TypedWorker, Mutex } from "../../../dist";

export function case_2() {
  blocking()
    .then((blocking_result) => {
      console.log("blocking_result: ", blocking_result);
      return non_blocking();
    })
    .then((non_blocking_result) => {
      console.log("non_blocking_result: ", non_blocking_result);
    });
}

function blocking() {
  return new Promise<number>((resolve) => {
    function race(n: number, mutex: Mutex, counter: Int16Array) {
      for (let i = 0; i < 1000; i++) {
        mutex.scoped_lock(() => {
          const x = counter[0];
          console.log(`blocking: ${n} -> ${counter[0]}`);
          counter[0] = x + 1;
        });
      }
    }
    const mutex = new Mutex();
    const counter = new Int16Array(new SharedArrayBuffer(2));
    const worker = new TypedWorker(race);
    const p1 = worker.execute([1, mutex, counter]).promise;
    const p2 = worker.execute([2, mutex, counter]).promise;
    Promise.all([p1, p2]).then(() => {
      resolve(counter[0]);
    });
  });
}

function non_blocking() {
  return new Promise<number>((resolve) => {
    function race(n: number, counter: Int16Array) {
      for (let i = 0; i < 1000; i++) {
        const x = counter[0];
        console.log(`non_blocking: ${n} -> ${counter[0]}`);
        counter[0] = x + 1;
      }
    }
    const counter = new Int16Array(new SharedArrayBuffer(2));
    const worker = new TypedWorker(race);
    const p1 = worker.execute([1, counter]).promise;
    const p2 = worker.execute([2, counter]).promise;
    Promise.all([p1, p2]).then(() => {
      resolve(counter[0]);
    });
  });
}
