import { TypedWorker } from "../../../dist";

export function atomics() {
  return new Promise((resolve) => {
    function generateRandom(arr: Float64Array, counter: Int32Array) {
      console.log("atomics()", "generateRandom begin");
      arr.forEach((x, i) => {
        arr[i] = Math.random();
      });
      console.log("atomics()", "generateRandom end");
      counter[0] = 1;
      const n = Atomics.notify(counter, 0);
      console.log("atomics()", `Atomics.notify() -> ${n}`);
    }

    function calculateArray(arr: Float64Array, counter: Int32Array) {
      console.log("atomics()", "calculateArray begin");
      const re = Atomics.wait(counter, 0, 0);
      console.log("atomics()", `calculateArray Atomics.wait() -> ${re}`);
      return arr.reduce((p, c) => p + c);
    }

    const counter = new Int32Array(new SharedArrayBuffer(1 * 4));
    const arr = new Float64Array(new SharedArrayBuffer(8 * 50 * 1000 * 1000));
    counter[0] = 0;

    const worker_generateRandom = new TypedWorker(generateRandom);
    const worker_calculateArray = new TypedWorker(calculateArray);

    worker_calculateArray.execute([arr, counter]).promise.then((x) => {
      console.log("atomics()", x);
      resolve(void 0);
    });

    worker_generateRandom.execute([arr, counter]);
  });
}
