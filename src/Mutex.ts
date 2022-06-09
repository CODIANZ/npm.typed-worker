export class Mutex {
  private static INDEX = 0 as const;
  private static UNLOCKED = 0 as const;
  private static LOCKED = 1 as const;
  public static MAGIC = "bu6ecYdPgFgSdIabqHcABWV9d0dyNIo6BbkRNJrH4Ny0wvCpNfNbtoB4FukC9wKK6TyyjOla542WDbpxabjkPlMiyYGvPsTAbiF3WdV8EIQRT9UCJwQ0GuFDTTToWSs3";
  private m_arr: Int32Array;
  private ___magic___ = Mutex.MAGIC;
  private static s_source: string | undefined = undefined;

  constructor() {
    if(!SharedArrayBuffer){
      throw new Error("cannot use Mutex because SharedArrayBuffer is undefined");
    }
    this.m_arr = new Int32Array(new SharedArrayBuffer(4));
  }

  lock() {
    // eslint-disable-next-line
    while (true) {
      const oldValue = Atomics.compareExchange(
        this.m_arr,
        Mutex.INDEX,
        Mutex.UNLOCKED /** old value */,
        Mutex.LOCKED /** new value */
      );
      if (oldValue == Mutex.UNLOCKED) {
        return;
      }
      Atomics.wait(this.m_arr, Mutex.INDEX, Mutex.LOCKED);
      /** retry locking */
    }
  }

  unlock() {
    const oldValue = Atomics.compareExchange(
      this.m_arr,
      Mutex.INDEX,
      Mutex.LOCKED /** old value */,
      Mutex.UNLOCKED /** new value */
    );
    if (oldValue != Mutex.LOCKED) {
      throw new Error("Cannot be unlocked before locking!");
    }
    Atomics.notify(this.m_arr, Mutex.INDEX, 1);
  }

  scoped_lock<FUNC extends () => any>(f: FUNC): ReturnType<FUNC> {
    this.lock();
    try {
      const re = f();
      this.unlock();
      return re;
    } catch (err) {
      this.unlock();
      throw err;
    }
  }
  
  static generateSourceCodeForWorker() {
    if(!Mutex.s_source){
      const mtx = new Mutex();
      Mutex.s_source = `
class Mutex {
  static INDEX = 0;
  static UNLOCKED = 0;
  static LOCKED = 1;
  m_arr;
  constructor(src) {
    this.m_arr = src.m_arr;
  }
  ${mtx.lock.toString()}
  ${mtx.unlock.toString()}
  ${mtx.scoped_lock.toString()}
}`;
    }
    return Mutex.s_source;
  }
}
