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
`execute()` returns `Promise`, so let's wait for the Web Worker to finish processing.

```ts
worker.execute( [ param1, param2, param3, ...] )
.then((result) => {
  /* hogehoge */
})
.catch((err) => {
  /* fugafuga */
})
```

## sample

```ts
import { TypedWorker } from "@codianz/typed-worker";

function add_in_worker(a: number, b: number, c: string) {
  if (c === "error") {
    throw new Error(`${c} : ${a} + ${b} = ${a + b}`);
  }
  return `${c} : ${a} + ${b} = ${a + b}`;
}

const worker = new TypedWorker(add_in_worker);

worker.execute([1, 2, "abc"])
  .promise
  .then((re) => {
    console.log(re);
  })
  .catch((err) => {
    console.error(err.message);
  });

worker.execute([1, 2, "error"])
  .promise
  .then((re) => {
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