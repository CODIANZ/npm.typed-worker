import { TypedWorker } from "../../../dist";

export function abort() {
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
    });

  const med2 = worker.execute(["#2"]);
  med2.promise
    .then((re) => {
      console.log("abort()", re);
    })
    .catch((err: Error) => {
      console.error("abort()", err.message);
    });

  setTimeout(() => {
    med2.abort(new Error("abort!"));
  }, 1000);
}
