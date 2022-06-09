import { TypedWorker } from "../../../dist";

export function basic() {
  return new Promise((resolve) => {
    function add_in_worker(a: number, b: number, c: string) {
      if (c === "error") {
        throw new Error(`${c} : ${a} + ${b} = ${a + b}`);
      }
      return `${c} : ${a} + ${b} = ${a + b}`;
    }

    const worker = new TypedWorker(add_in_worker);

    worker
      .execute([1, 2, "abc"])
      .promise.then((re) => {
        console.log("basic()", re);
      })
      .catch((err) => {
        console.error("basic()", err.message);
      })
      .finally(() => {
        return worker.execute([3, 4, "error"]).promise;
      })
      .then((re) => {
        console.log("basic()", re);
      })
      .catch((err: Error) => {
        console.error("basic()", err.message);
      })
      .finally(() => {
        resolve(void 0);
      });
  });
}
