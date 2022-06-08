import { Mediator } from "./Mediator";
import { Mutex } from "./Mutex";

export class TypedWorker<FUNC extends (...args: any[]) => any> {
  private m_func: FUNC;

  public constructor(func: FUNC) {
    this.m_func = func;
  }

  public execute(params: Parameters<FUNC>): Mediator<ReturnType<FUNC>> {
    const url = window.URL.createObjectURL(
      new Blob(
        [
`
${Mutex.generateSourceCodeForWorker()}
self.onmessage = function (e) {
  e.data.forEach((x, i) => {
    if(typeof x === "object" && "___magic___" in x && x.___magic___ === "${Mutex.MAGIC}"){
      e.data[i] = new Mutex(x);
    }
  });
  self.postMessage(${this.m_func.toString()}(...e.data));
};`
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

    /** It works but unpleasant code for C++er! */
    let reject_in_promise: (reason?: any) => void;

    const promise = new Promise<ReturnType<FUNC>>((resolve, reject) => {
      reject_in_promise = reject;
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

    return {
      abort(reason?: Error) {
        reject_in_promise(reason ?? new Error("aborted"));
        destruct();
      },
      promise: promise
    }
  }

  public debugExecute(params: Parameters<FUNC>): Mediator<ReturnType<FUNC>> {
    let reject_in_promise: (reason?: any) => void;
    const promise = new Promise<ReturnType<FUNC>>((resolve, reject) => {
      reject_in_promise = reject;
      setTimeout(() => {
        try {
          resolve(this.m_func(...params));
        }
        catch(err) {
          reject(err);
        }
      });
    });
    return {
      abort(reason?: Error) {
        reject_in_promise(reason ?? new Error("aborted"));
      },
      promise: promise
    }
  }
}
