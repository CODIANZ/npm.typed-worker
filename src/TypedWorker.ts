export class TypedWorker<FUNC extends (...args: any[]) => any> {
  private m_func: FUNC;

  public constructor(func: FUNC) {
    this.m_func = func;
  }

  public execute(params: Parameters<FUNC>): Promise<ReturnType<FUNC>> {
    const url = window.URL.createObjectURL(
      new Blob(
        [
          `self.onmessage = function (e) { self.postMessage(${this.m_func.toString()}(...e.data)); };`
        ],
        {
          type: "text/javascript"
        }
      )
    );

    const worker = new Worker(url);
    const destruct = () => {
      worker.terminate();
      URL.revokeObjectURL(url);
    };
    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        resolve(e.data);
        destruct();
      };
      worker.onerror = (e) => {
        reject(e);
        destruct();
      };
      worker.postMessage(params);
    });
  }
}