import { TypedWorker } from "../../../dist";

export function debug_mode() {
  function add_in_worker(a: number, b: number, c: string) {
    if (c === "error") {
      throw new Error(`${c} : ${a} + ${b} = ${a + b}`);
    }
    return `${c} : ${a} + ${b} = ${a + b}`;
  }

  const worker = new TypedWorker(add_in_worker);

  worker
    .debugExecute([1, 2, "abc"])
    .promise.then((re) => {
      console.log("debugMode()", re);
    })
    .catch((err) => {
      console.error("debugMode()", err.message);
    });

  worker
    .debugExecute([1, 2, "error"])
    .promise.then((re) => {
      console.log("debugMode()", re);
    })
    .catch((err: Error) => {
      console.error("debugMode()", err.message);
    });
}
