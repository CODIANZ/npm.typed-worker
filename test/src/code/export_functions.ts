import { TypedWorker } from "../../../dist";

export function export_functions() {
  return new Promise((resolve) => {
    function inner_func_1(a: number, b: number) {
      return `innner_func_1 -> ${a + b}`;
    }
    const inner_func_2 = (c: string) => {
      return `inner_func_2 -> ${c}`;
    };

    function add_in_worker(a: number, b: number, c: string) {
      return `${inner_func_2(c)} : ${a} + ${b} = ${inner_func_1(a, b)}`;
    }

    const worker = new TypedWorker(add_in_worker, [inner_func_1, inner_func_2]);

    worker
      .execute([1, 2, "abc"])
      .promise.then((re) => {
        console.log("export_functions()", re);
      })
      .catch((err) => {
        console.error("export_functions()", err.message);
      });
  });
}
