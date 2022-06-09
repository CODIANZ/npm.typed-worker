import { TypedWorker } from "../../../dist";

export function abort() {
  return new Promise((resolve) => {
    function resolve_with_delay(s: string) {
      function deep_loop(x: number) {
        for (let i = 0; i < x; i++) {
          deep_loop(x - 1);
        }
      }
      deep_loop(12);
      return `finish: ${s}`;
    }

    const worker = new TypedWorker(resolve_with_delay);

    const med = worker.execute(["#1"]);
    med.promise
      .then((re) => {
        console.log("abort()", re);
      })
      .catch((err: Error) => {
        console.error("abort()", err.message);
      })
      .finally(() => {
        const med2 = worker.execute(["#2"]);
        setTimeout(() => {
          med2.abort(new Error("abort!"));
        }, 1000);
        return med2.promise;
      })
      .then((re) => {
        console.log("abort()", re);
      })
      .catch((err: Error) => {
        console.error("abort()", err.message);
      })
      .finally(() => {
        resolve(void 0);
      });
  });
}
