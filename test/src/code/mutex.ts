import { TypedWorker, Mutex } from "../../../dist";

const TRY_COUNT = 500;

export function mutex() {
  console.log(
    "mutex()",
    `TRY_COUNT = ${TRY_COUNT}, Assumed result = ${TRY_COUNT * 2}`
  );
  return new Promise((resolve) => {
    blocking()
      .then((blocking_result) => {
        console.log("mutex()", `blocking_result: ${blocking_result}`);
        return non_blocking();
      })
      .then((non_blocking_result) => {
        console.log("mutex()", `non_blocking_result: ${non_blocking_result}`);
        resolve(void 0);
      });
  });
}

function blocking() {
  return new Promise<number>((resolve) => {
    function race(
      n: number,
      mutex: Mutex,
      counter: Int16Array,
      try_count: number
    ) {
      function sleep(milisecond: number) {
        Atomics.wait(
          new Int32Array(new SharedArrayBuffer(4)),
          0,
          0,
          milisecond
        );
      }
      for (let i = 0; i < try_count; i++) {
        mutex.scoped_lock(() => {
          const x = counter[0];
          sleep(1 + Math.random() * 5);
          //console.log("mutex()", `blocking: ${n} -> ${counter[0]}`);
          counter[0] = x + 1;
        });
      }
    }
    const mutex = new Mutex();
    const counter = new Int16Array(new SharedArrayBuffer(2));
    const worker = new TypedWorker(race);
    const p1 = worker.execute([1, mutex, counter, TRY_COUNT]).promise;
    const p2 = worker.execute([2, mutex, counter, TRY_COUNT]).promise;
    Promise.all([p1, p2]).then(() => {
      resolve(counter[0]);
    });
  });
}

function non_blocking() {
  return new Promise<number>((resolve) => {
    function race(n: number, counter: Int16Array, try_count: number) {
      function sleep(milisecond: number) {
        Atomics.wait(
          new Int32Array(new SharedArrayBuffer(4)),
          0,
          0,
          milisecond
        );
      }
      for (let i = 0; i < try_count; i++) {
        const x = counter[0];
        //console.log("mutex()", `non_blocking: ${n} -> ${counter[0]}`);
        sleep(1 + Math.random() * 5);
        counter[0] = x + 1;
      }
    }
    const counter = new Int16Array(new SharedArrayBuffer(2));
    const worker = new TypedWorker(race);
    const p1 = worker.execute([1, counter, TRY_COUNT]).promise;
    const p2 = worker.execute([2, counter, TRY_COUNT]).promise;
    Promise.all([p1, p2]).then(() => {
      resolve(counter[0]);
    });
  });
}
