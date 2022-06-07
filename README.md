# typed-worker

## description

typed-worker is for using Web Worker easily and type-safely with Typescript.
It is simple to use because it has a built-in messaging system.

## usage

### initialize

Create a TypedWorker object by specifying the function you want to call in the Web Worker as a parameter.

```ts
const worker = new TypedWorker( func );
```

### execute

Execute the function passed at initialization in WebWorker.
The argument of `execute()` is specified by setting the argument of the function executed by WebWorker to Tuple.
`execute()` returns `Mediator<>`.
You can use `Mediator<>.promse` to detect worker thread terminations and errors.
You can also suspend her worker thread by calling `Mediator<>.abort()`.

```ts
const mediator = worker.execute( [ param1, param2, param3, ...] );

mediator.promise
.then((result) => {
  /* hogehoge */
})
.catch((err) => {
  /* fugafuga */
});

mediator.abort();
```

### debug mode

You can use debug mode.
Debug mode simply replaces `execute()` with `debugExecute()`.
In debug mode, you can execute the function you want to execute asynchronously in the main thread and debug the function itself.

Debug mode is simple.
So use your browser's developer tools to observe timing-dependent programs.

## sample

### basic

```ts
import { TypedWorker } from "@codianz/typed-worker";

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
    console.log(re);
  })
  .catch((err) => {
    console.error(err.message);
  });

worker
  .execute([1, 2, "error"])
  .promise.then((re) => {
    console.log(re);
  })
  .catch((err: Error) => {
    console.error(err.message);
  });
```


The results are as follows.


```
[LOG]: "abc : 1 + 2 = 3"
[ERR]: "Uncaught Error: error : 1 + 2 = 3" 
```

### abort

```ts
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
    console.log(re);
  })
  .catch((err: Error) => {
    console.error(err.message);
  });

const med2 = worker.execute(["#2"]);
med2.promise
  .then((re) => {
    console.log(re);
  })
  .catch((err: Error) => {
    console.error(err.message);
  });

setTimeout(() => {
  med2.abort(new Error("abort!"));
}, 1000);
```

The results are as follows.


```
[ERR]: "abort!" 
[LOG]: "finish: #1"
```

### debug mode

```ts
import { TypedWorker } from "@codianz/typed-worker";

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
    console.log(re);
  })
  .catch((err) => {
    console.error(err.message);
  });

worker
  .debugExecute([1, 2, "error"])
  .promise.then((re) => {
    console.log(re);
  })
  .catch((err: Error) => {
    console.error(err.message);
  });
```


The results are as follows.


```
[LOG]: "abc : 1 + 2 = 3"
[ERR]: "Uncaught Error: error : 1 + 2 = 3" 
```