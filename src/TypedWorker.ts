import { Mediator } from "./Mediator";
import { Mutex } from "./Mutex";

export class TypedWorker<FUNC extends (...args: any[]) => any> {
  private m_func: FUNC;
  private m_func_source?: string;
  private m_export_functions?:  ((...args: any[])=>any)[];
  private m_export_functions_source?: string;

  public constructor(func: FUNC, exportFunctions?: ((...args: any[])=>any)[]) {
    this.m_func = func;
    this.m_export_functions = exportFunctions;
  }

  public execute(params: Parameters<FUNC>): Mediator<ReturnType<FUNC>> {
    if(!this.m_func_source){
      this.m_func_source = this.m_func.toString();
    }

    if(!this.m_export_functions_source){
      this.m_export_functions_source = "";
      this.m_export_functions?.forEach(f => {
        this.m_export_functions_source += `function ${f.name}(...args){return (${f.toString()})(...args);};`
      });
    }

    const mutexSourceCode = params.find(x => x instanceof Mutex) ? Mutex.generateSourceCodeForWorker() : "";
    const url = window.URL.createObjectURL(
      new Blob(
        [
`
${this.m_export_functions_source}
${mutexSourceCode}
self.onmessage = function (e) {
  e.data.forEach((x, i) => {
    if(typeof x === "object" && "___magic___" in x && x.___magic___ === "${Mutex.MAGIC}"){
      e.data[i] = new Mutex(x);
    }
  });
  self.postMessage((${this.m_func_source})(...e.data));
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
