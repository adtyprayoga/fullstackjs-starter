# Instructor Guide: Node.js → Express → Postgres + Drizzle → React

One-day workshop (about 8 hours of room time, 09:00 to about 18:35) for developers who know basic JavaScript. It opens with a 90-minute ES6+ primer (Block 0), then follows the four lessons in the repo. Participants build a Car Store: a REST API backed by Postgres, and a React page that lists the cars.

Source material: the JS Mastery PERN crash course, https://youtu.be/ek7hmv5PVV8, **16:43 to 1:43:43**. `[mm:ss]` markers in this guide point to the moment in the video where each idea is taught, so you can replay a segment or check your own wording against it. **Block 0 (the ES6+ primer) is not from the video** and has no markers. Appendix E has a card for every participant exercise, with hints for you. Video times use the hour as the first number for anything past 59:59 (`1:07:30`).

The repo in `starter/` is the finished version of that video with two differences you need to know about:

| Video                                                           | This repo                                                                                                 |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Postgres on Neon (serverless), `drizzle-orm/neon-http` driver | Postgres in Docker (`postgres:17-alpine`, host port **5433**), `drizzle-orm/postgres-js` driver |
| SQL practiced in DB Fiddle                                      | Same SQL, run in the Docker container with `psql` (or DB Fiddle if you prefer)                          |
| Sponsor segments (Arcjet, Site24x7), course waitlist            | Skip them. They are not part of this guide                                                                |
| PUT, DELETE, GET-by-id left as a challenge                      | Still unfinished in `03_postgresql/server.js`. It is the Block 3 exercise (see below)                   |

---

## 1. Goal and final picture

By the end, every participant has run all four layers and can say what each one does:

```
Browser (React, :5173)
   │  fetch("/api/v1/cars")
   ▼
Vite dev server ── proxy /api ──► Express (:3000) ──► Postgres (Docker, :5433)
                                  routes + middleware    table "cars"
```

Learning outcomes:

1. Read and write the modern JavaScript (ES6+) used everywhere else in the day: `const`/`let`, arrow functions, destructuring, spread, modules, promises and `async`/`await`.
2. Explain what Node is (and is not) and write a bare HTTP server.
3. Build a REST API in Express: routes, params, JSON bodies, status codes, routers, middleware.
4. Explain why in-memory data is not enough, and write basic SQL (create, insert, select, update, delete).
5. Define a table with Drizzle, generate and apply a migration, and query it from Express.
6. Fetch API data in React with `useState` and `useEffect`, render a list of components, and explain why a dev-server proxy is needed.

---

## 2. Schedule

| Time | Block | Video ref | Folder |
|---|---|---|---|
| 09:00 – 09:20 | Welcome, setup check | | all |
| 09:20 – 10:50 | **Block 0: Modern JavaScript (ES6+) primer** (90 min, 13 topics, mini-challenge) | not in the video | scratch folder |
| 10:50 – 11:00 | Break | | |
| 11:00 – 12:10 | **Block 1: Node.js** (concepts 25 min, live code 25 min, exercise 20 min) | 16:43 – 23:30 | `01_nodejs` |
| 12:10 – 13:10 | Lunch | | |
| 13:10 – 14:55 | **Block 2: Express** (concepts 20, live code 50, exercise 30) | 24:00 – 47:30 | `02_expressjs` |
| 14:55 – 15:05 | Break | | |
| 15:05 – 15:50 | **Block 3a: Databases and SQL** (concepts 20, lab 15, practice 10) | 48:00 – 1:09:00 | psql in Docker |
| 15:50 – 16:00 | Break | | |
| 16:00 – 17:15 | **Block 3b: Drizzle + Express + Postgres** (concepts 15, live code 30, exercise 30) | 1:09:00 – 1:27:00 | `03_postgresql` |
| 17:15 – 17:25 | Break | | |
| 17:25 – 18:20 | **Block 4: React** (live code 35, exercise 20) | 1:27:00 – 1:43:43 | `04_reactjs` |
| 18:20 – 18:35 | Final demo, wrap-up | | all |

The video covers Blocks 1 to 4 in 87 minutes. The extra time is for participants typing along, setup problems and exercises. Block 0 adds 90 minutes, so the day ends at about 18:35. If you run behind, shorten in this order: the SQL lab (Block 3a), then Block 0 topics 6, 8 and 10 (the ones the rest of the day uses least). Do not cut the Block 3b exercise or the Block 4 proxy explanation: those are the two places where this stack actually breaks for beginners.

---

## 3. Before the day

### Facilitator checklist (the day before)

- [ ] Node 26 is available. The repo's `package.json` files have no `engines` field, but the dependencies are recent (Express 5, Vite 8, React 19).
- [ ] Docker is running. `docker compose up -d --wait db` in `03_postgresql` ends with the container `healthy`.
- [ ] Ports **3000**, **5173** and **5433** are free on every machine. Port 3000 is the usual conflict: another Node app or a Docker container may already hold it. Check with `ss -ltnp | grep :3000`.
- [ ] You have walked the whole path once on a clean checkout (see "Dry-run script" at the end).
- [ ] An HTTP client is installed: Postman, Insomnia, HTTPie, or just `curl`. The video uses HTTPie. This guide uses `curl` because every machine has it.
- [ ] A JSON viewer browser extension (optional, nicer output for GET requests in the browser).
- [ ] Official-docs tabs open, one group per block, from the table at the start of each block (full list in Appendix C). Open them before class so you are not typing URLs in front of the room.
- [ ] Slides or a handout made from the quoted participant text in the cards of Appendix E.

### Participant setup (send ahead of time)

```bash
node -v && npm -v
docker --version
git clone <starter repo> && cd starter
```

### Per-folder setup (do it live in each block)

```bash
cd 02_expressjs  && npm install
cd 03_postgresql && npm install
cd 04_reactjs    && npm install
```

`03_postgresql/.env` must contain one line:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5433/cars
```

It matches `docker-compose.yml` (user `postgres`, password `postgres`, database `cars`, host port 5433). `.env` is not in git, so participants create it themselves.

---

## 3a. Block 0: Modern JavaScript (ES6+) primer

**About 90 minutes. Not from the video.** Almost every file in the rest of the day uses a handful of modern JavaScript features. This block teaches them first, and each topic opens with a real line from the repo, so participants learn the feature on code they will meet again within the hour. Every snippet was run with Node 26 and the output shown is the real output.

**How each topic runs (about 6 minutes):** read the repo line aloud, then say what the feature does. The *Say it* text is a script you can read or put in your own words. Run the snippet, ask the one question, name the trap.

### Learning objectives

By the end, participants can read the modern JavaScript in `server.js`, `schema.js`, `App.jsx` and `Car.jsx` without stopping to ask what a line means.

| Min | Part |
|---|---|
| 2 | Welcome, how this block runs |
| 6 | 1. Data types, `var`, `let` and `const` |
| 6 | 2. Arrow functions |
| 4 | 3. Default parameters |
| 7 | 4. Destructuring assignment |
| 6 | 5. The spread (`...`) operator and rest |
| 5 | 6. The `for...of` loop |
| 6 | 7. `Map` and `Set` |
| 5 | 8. ES2016: `includes()`, `**` and removing duplicates |
| 6 | 9. Optional chaining and nullish coalescing |
| 6 | 10. Classes and private fields (ES2022) |
| 6 | 11. ES modules |
| 8 | 12. Promises |
| 7 | 13. `async`/`await` (ES2017) and error handling |
| 8 | Mini-challenge |
| 2 | Recap |

The order differs a little from the usual syllabus: default parameters follow arrow functions, and `for...of` comes before `Map` and `Set`, so each topic only uses things already taught. Full list of docs links: Appendix C.

### How to run this block (2 min)

Everyone works in a scratch folder with one small file per topic. No framework, no browser.


```bash
mkdir es6-primer && cd es6-primer
echo '{"type":"module"}' > package.json   # lets every file use import and top-level await
node 01-types.js
```

That `package.json` line makes `.js` files ES modules, which topics 11 and 13 need. You can type one-liners into the REPL (`node`) too, but use files for anything longer so people can save and rerun them.

### 1. Data types, `var`, `let` and `const` (6 min)

**You will see this today**

```js
// 02_expressjs/server.js
let cars = [
const app = express();
```

and, in the API's reply, `"price":"50000.00"`: a string, not a number.

**Say it.** A variable is a name for a value. `const` names a value that cannot be pointed somewhere else. `let` names one that can. `var` is the old form. It ignores `{ }` blocks and can be read before its line, as `undefined`, which causes bugs, so we do not use it. Every value has a type and `typeof` tells you which. The price is a string because Postgres `numeric` keeps exact decimals and the driver sends them as text. `Number(price)` converts it.

Save as `01-types.js` and run it.

```js
// What the API sends for price (see the GET /cars reply)
const row = JSON.parse('{"id":2,"make":"Ford","price":"50000.00"}');
console.log(typeof row.price, typeof Number(row.price));
console.log(typeof null, typeof [], 0.1 + 0.2);

// const stops re-assignment, not change
const car = { make: "Toyota" };
car.make = "Tesla";
try {
  car = {};
} catch (e) {
  console.log(e.message);
}

// let is block-scoped. var leaks out of the block.
if (true) {
  var leaked = "visible";
  let hidden = "scoped";
}
console.log(leaked, typeof hidden);

// let cannot be used before its line
try {
  console.log(early);
} catch (e) {
  console.log(e.name);
}
let early = 1;
```

Prints:

```text
string number
object object 0.30000000000000004
Assignment to constant variable.
visible undefined
ReferenceError
```

**Ask the room.** `cars` in `02_expressjs/server.js` is only changed with `push` and `splice`. Would `const` work there? *Yes. `const` blocks re-assignment, not changes inside the array.*

**Trap.** `typeof null` is `"object"` (a 1995 bug that cannot be fixed) and so is `typeof []`. Check for an array with `Array.isArray`.

**Docs:** [Grammar and types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types), [`let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let), [`const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const), [`var`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)

### 2. Arrow functions (6 min)

**You will see this today**

```js
// 02_expressjs/server.js
router.get("/cars", (req, res) => {
const car = cars.find((c) => c.id === carId);
```

**Say it.** An arrow function is a short way to write a function. `(c) => c.id === carId` takes `c` and returns the comparison. With one expression and no braces, the result is returned for you. Arrows also change `this`. A normal function gets its own `this` when it is called. An arrow uses the `this` of the code around it.

Save as `02-arrow.js` and run it.

```js
const cars = [{ id: 1, make: "Toyota" }, { id: 2, make: "Tesla" }];
const carId = 2;
console.log(cars.find((c) => c.id === carId)); // from 02_expressjs/server.js

const makeCar = (make) => ({ make }); // an object literal needs ( )
console.log(makeCar("Ford"));

// The other difference: `this`
const counter = {
  count: 0,
  start() {
    setTimeout(function () { console.log("function:", this.count); }, 0);
    setTimeout(() => { console.log("arrow:", this.count); }, 0);
  },
};
counter.start();
```

Prints:

```text
{ id: 2, make: 'Tesla' }
{ make: 'Ford' }
function: undefined
arrow: 0
```

**Ask the room.** What does each timer print? *`function: undefined` and `arrow: 0`. The normal function got a timer object as `this`, so `this.count` is missing.*

**Trap.** Returning an object literal needs parentheses: `(make) => ({ make })`. Without them the braces are read as the function body.

**Docs:** [Arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)

### 3. Default parameters (4 min)

**You will see this today**

```js
// 03_postgresql/schema.js
createdAt: timestamp("created_at").defaultNow(),
```

**Say it.** In the schema, `defaultNow()` means: if the insert does not give a `created_at`, the database fills it in. A default parameter does the same job in a function. If the caller leaves the argument out, JavaScript uses the default.

Save as `03-defaults.js` and run it.

```js
const price = (amount, currency = "USD") => `${amount} ${currency}`;

console.log(price(100));
console.log(price(100, "IDR"));
console.log(price(100, undefined)); // undefined uses the default
console.log(price(100, null)); // null does not
```

Prints:

```text
100 USD
100 IDR
100 USD
100 null
```

**Ask the room.** What does `price(100, null)` print? *`100 null`. Only `undefined` triggers the default.*

**Trap.** `null` and `""` do not trigger a default. Only a missing argument or an explicit `undefined` does.

**Docs:** [Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)

### 4. Destructuring assignment (7 min)

**You will see this today**

```js
// 02_expressjs/server.js
const { make, model, year, price } = req.body;
```
```js
// 03_postgresql/server.js
const [newCar] = await db
```

and the React props in `Car.jsx`: `({ make, model, year, price })`.

**Say it.** Destructuring takes values out of an object or array into variables in one line. For an object it matches by name. For an array it matches by position. `const { make, model, year, price } = req.body` replaces four lines of `const make = req.body.make`. In `const [newCar] = await db...returning()`, Drizzle always returns an array of rows, and the brackets take the first one.

Save as `04-destructuring.js` and run it.

```js
const body = { make: "Tesla", model: "Model 3", year: 2023, price: 42000 };

const { make, model, year, price } = body; // objects match by name
console.log(make, model, year, price);

const { price: cost, color = "white" } = body; // rename, and a default
console.log(cost, color);

const rows = [{ id: 1, make: "Tesla" }];
const [newCar] = rows; // arrays match by position
console.log(newCar);

const show = ({ make, year }) => `${make} ${year}`; // in a parameter list, like React props
console.log(show(body));
```

Prints:

```text
Tesla Model 3 2023 42000
42000 white
{ id: 1, make: 'Tesla' }
Tesla 2023
```

**Ask the room.** In `{ price: cost }`, what is the new variable called? *`cost`. The pattern reads the key `price` from the object and names the new variable `cost`.*

**Trap.** A missing key gives `undefined`, not an error. Give it a default (`color = "white"`) when you need a value.

**Docs:** [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring)

### 5. The spread (`...`) operator and rest (6 min)

**You will see this today**

```jsx
// 04_reactjs/src/App.jsx
<Car key={car.id} {...car}/>
```

**Say it.** Three dots mean two opposite things. In a call, an array or an object, they spread the contents out. In a parameter list or a destructuring pattern, they gather the rest into one array or object. `{...car}` turns every field of `car` into a prop. `{ ...car, price: 26000 }` builds a new object with one field changed, so the original stays as it was. React state needs exactly that.

Save as `05-spread-rest.js` and run it.

```js
const car = { id: 1, make: "Tesla", price: 25000 };
const cars = [car];

console.log({ ...car, price: 26000 }); // new object, one field changed
console.log([...cars, { id: 2, make: "Ford" }]); // new array, one item added
console.log(cars.length, car.price); // the originals did not change

const total = (...prices) => prices.reduce((sum, p) => sum + p, 0); // rest: gather
console.log(total(1, 2, 3));
```

Prints:

```text
{ id: 1, make: 'Tesla', price: 26000 }
[ { id: 1, make: 'Tesla', price: 25000 }, { id: 2, make: 'Ford' } ]
1 25000
6
```

**Ask the room.** After the spread, what is `car.price`? *`25000`. The spread made a copy.*

**Trap.** The copy is shallow. A nested array or object inside it is still shared with the original.

**Docs:** [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax), [Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)

### 6. The `for...of` loop (5 min)

**You will see this today**

```jsx
// 04_reactjs/src/App.jsx
cars.map((car) => (
```

**Say it.** `map` and `forEach` call a function for each item. `for...of` is a loop that walks the values of anything iterable: arrays, strings, `Map`, `Set`. Two things only work in a loop: `break`, and `await`. Topic 13 depends on the second one. `for...in` is a different loop that gives keys as strings, so avoid it on arrays.

Save as `06-for-of.js` and run it.

```js
const makes = ["Toyota", "Tesla", "Ford"];

makes.forEach((make) => console.log("forEach", make)); // cannot break, cannot await

for (const make of makes) {
  if (make === "Tesla") break;
  console.log("for...of", make);
}

for (const [i, make] of makes.entries()) console.log(i, make);

const obj = { a: 1 };
try {
  for (const item of obj) console.log(item);
} catch (e) {
  console.log(`${e.name}: ${e.message}`);
}
```

Prints:

```text
forEach Toyota
forEach Tesla
forEach Ford
for...of Toyota
0 Toyota
1 Tesla
2 Ford
TypeError: obj is not iterable
```

**Ask the room.** The second loop has a `break`. How many lines does it print? *One. It prints Toyota, then stops at Tesla.*

**Trap.** A plain object is not iterable. `for (const x of obj)` throws `TypeError: obj is not iterable`. Loop over `Object.entries(obj)` instead.

**Docs:** [`for...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of), [`for...in`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in)

### 7. `Map` and `Set` (6 min)

**You will see this today**

```js
// 02_expressjs/server.js
const car = cars.find((c) => c.id === carId);
```

**Say it.** `find` scans the array from the start until it meets the id. A `Map` stores key and value pairs and looks a key up directly. Build it once from the array, then `byId.get(2)` finds the car with no scan. A `Set` is a collection where each value appears once. Both remember insertion order and work with `for...of`. Grouping models by make with a `Map` is the same job as SQL `GROUP BY`, which comes in Block 3a.

Save as `07-map-set.js` and run it.

```js
const cars = [
  { id: 1, make: "Toyota" },
  { id: 2, make: "Tesla" },
  { id: 3, make: "Tesla" },
];

const byId = new Map(cars.map((c) => [c.id, c])); // build once
console.log(byId.get(2)); // look up without scanning
console.log(byId.get("2")); // keys keep their type

const makes = new Set(cars.map((c) => c.make)); // each value once
console.log(makes, makes.size, makes.has("Ford"));
```

Prints:

```text
{ id: 2, make: 'Tesla' }
undefined
Set(2) { 'Toyota', 'Tesla' } 2 false
```

**Ask the room.** `byId.get("2")` printed `undefined`, but the id is 2. Why? *A `Map` key keeps its type, so the number `2` and the string `"2"` are different keys. A plain object would turn both into the string `"2"`.*

**Trap.** `console.log` prints a `Set` as `Set(2) { ... }`, not as an array. Use `[...set]` when you need an array.

**Docs:** [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

### 8. ES2016: `includes()`, `**` and removing duplicates (5 min)

**You will see this today**

```js
// 02_expressjs/server.js
if (!make || !model || !year || !price) {
```

**Say it.** That check says "something is missing". The next check you would add is "is this make one we allow?", and ES2016 made that read like English: `allowed.includes(make)` answers true or false. ES2016 also added `**` for powers, so `2 ** 10` is 1024. With a `Set`, `[...new Set(list)]` is the standard way to remove duplicates.

Save as `08-es2016.js` and run it.

```js
const allowed = ["Toyota", "Tesla", "Ford"];
console.log(allowed.includes("Tesla"), allowed.includes("BMW"));
console.log([{ id: 1 }].includes({ id: 1 })); // objects compare by identity, not content

console.log(2 ** 10, 2 ** 3 ** 2); // ** works right to left

console.log([...new Set([1, 2, 2, 3, 3])]); // remove duplicates
```

Prints:

```text
true false
false
1024 512
[ 1, 2, 3 ]
```

**Ask the room.** What does `2 ** 3 ** 2` print? *`512`. It works right to left, so it is `2 ** 9`.*

**Trap.** `includes` compares with strict equality. `[{ id: 1 }].includes({ id: 1 })` is `false`, because the two objects are different objects.

**Docs:** [`Array.prototype.includes()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes), [Exponentiation `**`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation)

### 9. Optional chaining and nullish coalescing (6 min)

**You will see this today**

```js
// Appendix D.4 of this guide
throw new Error(body.error ?? `Request failed: ${res.status}`);
```

**Say it.** `?.` reads a property but stops and gives `undefined` if the value before it is `null` or `undefined`, instead of throwing. `??` gives a fallback only when the left side is `null` or `undefined`. The older `||` also replaces `0`, `""` and `false`, and those are often real values.

Save as `09-optional-nullish.js` and run it.

```js
const car = { make: "Tesla", owner: { name: "Ada" } };
const noOwner = { make: "Ford" };
console.log(car.owner?.name, noOwner.owner?.name); // no crash when owner is missing

const count = 0;
console.log(count || 10, count ?? 10); // || replaces 0, ?? keeps it

const body = {};
console.log(body.error ?? "Request failed: 500"); // a fallback only for null/undefined
```

Prints:

```text
Ada undefined
10 0
Request failed: 500
```

**Ask the room.** With `count = 0`, what do `count || 10` and `count ?? 10` give? *`10` and `0`.*

**Trap.** `?.` hides a missing value, it does not fix it. Use it where missing data is normal. Do not use it to silence a bug.

**Docs:** [Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining), [Nullish coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)

### 10. Classes and private fields (ES2022) (6 min)

**You will see this today**

```js
// 02_expressjs/server.js
const timestamp = new Date().toISOString();
```

**Say it.** `Date` is a class. `new Date()` makes an object from it and `.toISOString()` is a method on that object. A class lets you write your own: fields hold the data and methods work on it. A field that starts with `#` is private, so only code inside the class body can read it. The language enforces that, unlike the old `_name` habit. `extends` builds one class on another, and `super.add(...)` calls the parent's version. This repo only uses classes like `Date` and `Error`, since React here uses function components, but many libraries you will meet are class based.

Save as `10-classes.js` and run it.

```js
console.log(new Date(0).toISOString()); // Date is a class. The logger in server.js uses it.

class CarStore {
  #cars = []; // private: only code inside the class can touch it
  add(car) {
    this.#cars.push(car);
    return this;
  }
  get count() {
    return this.#cars.length;
  }
}

class ElectricStore extends CarStore {
  add(car) {
    return super.add({ ...car, electric: true });
  }
}

const store = new CarStore().add({ make: "Toyota" }).add({ make: "Ford" });
console.log(store.count, store.cars);
console.log(new ElectricStore().add({ make: "Tesla" }).count);
```

Prints:

```text
1970-01-01T00:00:00.000Z
2 undefined
1
```

**Ask the room.** `store.cars` printed `undefined`. Could we read the cars some other way from outside? *No. Writing `store.#cars` outside the class is a `SyntaxError`. Add a `get` method like `count` if outside code needs to see them.*

**Trap.** A class is a function underneath (`typeof CarStore` is `"function"`). Forgetting `new` when you create an instance is the usual mistake.

**Docs:** [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)

### 11. ES modules (6 min)

**You will see this today**

```js
// 03_postgresql/server.js
import express from "express";
import { db } from "./db.js";
```
```js
// 03_postgresql/db.js
export const db = drizzle(client);
```

**Say it.** An ES module is a file with its own scope. `export` makes something visible to other files and `import` brings it in. A file can have many named exports (imported with braces, like `{ db }`) and one default export (imported without braces, like `express`). Node needs the extension in relative imports, so `./db.js`, not `./db`. Node also needs to know a `.js` file is a module, and it reads that from `"type": "module"` in `package.json`.

Here is how the files of `03_postgresql` fit together. Start with one import:

```mermaid
flowchart LR
  server["server.js"] -->|"import express from 'express'"| express["express (npm package)"]
```

Add `db.js`. It exports `db`, and `server.js` imports it by relative path:

```mermaid
flowchart LR
  server["server.js"] -->|"import express from 'express'"| express["express (npm package)"]
  server -->|"import { db } from './db.js'"| dbjs["db.js"]
```

Add `schema.js` and the Drizzle packages. Every arrow is an `import`, and the label is what it brings in:

```mermaid
flowchart LR
  server["server.js"] -->|"import express from 'express'"| express["express (npm package)"]
  server -->|"import { db } from './db.js'"| dbjs["db.js"]
  server -->|"import { cars } from './schema.js'"| schema["schema.js"]
  dbjs -->|"import { drizzle } from 'drizzle-orm/postgres-js'"| drizzle["drizzle-orm (npm package)"]
  schema -->|"import { pgTable, ... } from 'drizzle-orm/pg-core'"| drizzle
```

Try the same idea in a tiny folder. `util.js`:

```js
export const PI = 3.14159; // named export
export const area = (r) => PI * r ** 2; // named export

const greet = (name) => `Hello, ${name}!`;
export default greet; // default export: one per file
```

`main.js`:

```js
import greet, { PI, area as circleArea } from "./util.js"; // default, then named
import * as util from "./util.js"; // everything, as one object

console.log(greet("Ada"));
console.log(PI, circleArea(2));
console.log(Object.keys(util), typeof util.default);
```

With a `package.json` of `{"type":"module"}` next to them, `node main.js` prints:

```text
Hello, Ada!
3.14159 12.56636
[ 'PI', 'area', 'default' ] function
```

Three mistakes, and what Node says (paths shortened):

| Mistake | What you see |
|---|---|
| `import greet from "./util"` (no `.js`) | `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../util' imported from .../main.js` then `Did you mean to import "./util.js"?` |
| `"type": "commonjs"` in `package.json`, file uses `import` | `SyntaxError: Cannot use import statement outside a module` |
| `require` in an ES module file | `ReferenceError: require is not defined in ES module scope, you can use import instead` |

`npm init -y` writes `"type": "commonjs"`. So the first `import` in a new project fails with the `SyntaxError` above until you change it to `"module"`. That is exactly what happens in Block 2. If a project has no `"type"` at all, recent Node versions detect the `import` and run the file anyway, with a warning. The Node 26 used for this guide does, and older versions fail. Do not rely on it. Always set `"type"`.

**Ask the room.** What does `import greet from "./util"` do in Node? *It fails with `ERR_MODULE_NOT_FOUND` and suggests `./util.js`. Bundlers like Vite accept the missing extension, which is why React code often leaves it out.*

**Trap.** Top-level `await` only works in a module. That is the second reason the primer folder sets `"type": "module"`.

**Docs:** [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export), [Node.js: ES modules](https://nodejs.org/api/esm.html), [Node.js: `"type"` in `package.json`](https://nodejs.org/api/packages.html)

### 12. Promises (8 min)

**You will see this today**

```jsx
// 04_reactjs/src/App.jsx
fetch('api/v1/cars')
  .then(res => res.json())
  .then(data => setCars(data))
  .catch(err => console.error(err));
```

**Say it.** A promise is an object for a value that is not ready yet. It starts pending, then it is fulfilled with a value or rejected with an error. `.then` runs when it is fulfilled, `.catch` when it is rejected and `.finally` either way. Each one returns a new promise, which is why you can chain them. `fetch(...)` returns a promise, so the chain above says: when the response arrives, parse it. When the JSON is parsed, store it. If anything fails, log it.

JavaScript runs your script to the end first. Promise callbacks run next. Timer callbacks run after that. Watch that order build up. First, only the script on the call stack:

```mermaid
flowchart TB
  subgraph stack["Call stack: runs one thing at a time"]
    S1["console.log: script starts"] --> S2["console.log: script ends"]
  end
```

Add a `setTimeout(..., 0)`. Its callback is handed to the timer and waits in the timer queue until the stack is empty:

```mermaid
flowchart TB
  subgraph stack["Call stack"]
    S1["console.log: script starts"] --> S2["setTimeout(..., 0)"] --> S3["console.log: script ends"]
  end
  S2 -.->|"callback waits"| T["Timer queue"]
  S3 -->|"stack is empty"| T
  T --> RT["'timer, 0 ms' runs"]
```

Add a promise callback. It waits in its own queue, and that queue is emptied before the timer queue:

```mermaid
flowchart TB
  subgraph stack["Call stack"]
    S1["console.log: script starts"] --> S2["setTimeout(..., 0)"] --> S3["Promise.resolve().then(...)"] --> S4["console.log: script ends"]
  end
  S2 -.->|"callback waits"| T["Timer queue"]
  S3 -.->|"callback waits"| M["Promise queue"]
  S4 -->|"stack is empty"| M
  M --> RM["'promise callback' runs first"]
  RM --> T
  T --> RT["'timer, 0 ms' runs second"]
```

That diagram is the first four lines of this output:

Save as `12a-event-order.js` and run it.

```js
const wait = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

console.log("script starts");
setTimeout(() => console.log("timer, 0 ms"), 0);
Promise.resolve().then(() => console.log("promise callback"));

wait(20, "car data")
  .then((v) => {
    console.log("got", v);
    return v.toUpperCase(); // what you return goes to the next .then
  })
  .then((v) => console.log("chained", v))
  .finally(() => console.log("finally"));

console.log("script ends");
```

Prints:

```text
script starts
script ends
promise callback
timer, 0 ms
got car data
chained CAR DATA
finally
```

A rejection skips every `.then` until the next `.catch`, and `Promise.all` waits for every promise:

Save as `12b-catch-all.js` and run it.

```js
const wait = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));
const fail = () =>
  new Promise((_, reject) => setTimeout(() => reject(new Error("network down")), 5));

await fail()
  .then(() => console.log("never printed")) // skipped
  .catch((e) => console.log("caught:", e.message))
  .finally(() => console.log("finally"));

console.log(await Promise.all([wait(30, "a"), wait(10, "b")])); // waits for both, keeps order
```

Prints:

```text
caught: network down
finally
[ 'a', 'b' ]
```

**Ask the room.** The `setTimeout(..., 0)` was written before the promise callback. Which prints first? *The promise callback. Promise callbacks run before timer callbacks.*

**Trap.** A rejection skips every `.then` below it and lands in the nearest `.catch`. That is why one `.catch` at the end of the `App.jsx` chain covers all three steps.

**Docs:** [Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises), [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)

### 13. `async`/`await` (ES2017) and error handling (7 min)

**You will see this today**

```js
// 03_postgresql/server.js
const allCars = await db.select().from(cars);
```

**Say it.** `async`/`await` is the same promises with flat code. An `async` function always returns a promise. `await` pauses that one function until the promise settles, then gives you the value, or throws the error. Everything else keeps running, which is how one Node process serves many requests. Errors use normal `try`/`catch`/`finally`. Express 5 sends a rejected `async` handler to the error middleware, so the routes in `03_postgresql/server.js` have no `try`/`catch`.

Follow one request through `GET /api/v1/cars`. The handler asks Postgres for the rows:

```mermaid
sequenceDiagram
  participant C as Client
  participant H as GET /cars handler
  participant D as Postgres
  C->>H: GET /api/v1/cars
  H->>D: db.select().from(cars)
```

Add the `await`. The handler stops at that line, and only that handler. Node is free to serve other requests meanwhile:

```mermaid
sequenceDiagram
  participant C as Client
  participant H as GET /cars handler
  participant D as Postgres
  C->>H: GET /api/v1/cars
  H->>D: db.select().from(cars)
  Note over H: await: this handler is paused
  Note over C,D: Node keeps running other requests
```

Add the answer. The database replies and the handler continues from the same line. If the database fails, the `await` throws instead:

```mermaid
sequenceDiagram
  participant C as Client
  participant H as GET /cars handler
  participant D as Postgres
  C->>H: GET /api/v1/cars
  H->>D: db.select().from(cars)
  Note over H: await: this handler is paused
  Note over C,D: Node keeps running other requests
  alt rows come back
    D-->>H: rows
    H-->>C: 200 res.json(allCars)
  else the database fails
    D--xH: error
    H-->>C: 500 via the Express error handler
  end
```

The same ideas in a runnable file:

Save as `13a-async.js` and run it.

```js
const wait = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));
const loadCars = async () => await wait(50, [{ id: 1 }]); // stands in for db.select().from(cars)

console.log(loadCars()); // no await: a pending promise
console.log(await loadCars()); // await: the value

try {
  await Promise.reject(new Error("db is down"));
} catch (err) {
  console.log("caught:", err.message);
} finally {
  console.log("finally");
}

const done = [];
[1, 2].forEach(async (n) => {
  await wait(50);
  done.push(n);
});
console.log("right after forEach:", done); // forEach did not wait
await wait(100);
console.log("100 ms later:", done);
```

Prints:

```text
Promise { <pending> }
[ { id: 1 } ]
caught: db is down
finally
right after forEach: []
100 ms later: [ 1, 2 ]
```

And `fetch`, which has one surprise. It needs a local server, so this file starts its own on port 3199:

Save as `13b-fetch.js` and run it.

```js
import http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});
await new Promise((resolve) => server.listen(3199, resolve));

const raw = await fetch("http://localhost:3199/missing");
console.log("fetch resolved:", raw.status, raw.ok); // a 404 is not a rejection

const getJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};
try {
  await getJson("http://localhost:3199/missing");
} catch (err) {
  console.log("caught:", err.message);
}

await new Promise((resolve) => server.close(resolve));
try {
  await getJson("http://localhost:3199/missing");
} catch (err) {
  console.log("caught:", err.name, err.message); // the network itself failed
}
```

Prints:

```text
fetch resolved: 404 false
caught: Request failed: 404
caught: TypeError fetch failed
```

**Ask the room.** `console.log(loadCars())` has no `await`. What does it print? *`Promise { <pending> }`. The function returned its promise and nothing waited for it.*

**Trap.** `fetch` only rejects when the network fails. A 404 or 500 is a normal response with `ok: false`, so check `res.ok` and throw yourself. The same applies to `forEach`: it does not wait for an `async` callback, so use `for...of` when you need to wait.

**Docs:** [`async function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await), [`try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)

### Mini-challenge (8 min)

Pair up. This one uses most of the block: modules, `async`/`await`, default parameters, destructuring, spread, `Map`, `for...of`, `Set`, `?.` and `??`.

Make a folder with `package.json` (`{"type":"module"}`) and this file, `data.js`, a stand-in for an API call:

```js
const wait = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

export const fetchCars = () =>
  wait(10, [
    { make: "Tesla", model: "Model S", price: 25000, owner: { name: "Ada" } },
    { make: "Ford", model: "F-150", price: 35000 },
    { make: "Tesla", model: "Model 3", price: 42000, owner: { name: "Lin" } },
  ]);
```

Write two more files:

1. **`report.js`** with a default-exported `async` function `report(minPrice = 0)`. It waits for `fetchCars()`, keeps only the cars with `price >= minPrice`, and returns `{ lines, owners, makes }`:
   - `lines`: one string per make, like `"Tesla: Model S, Model 3"` (group with a `Map`).
   - `owners`: the owner's name for each car, or `"no owner"` when there is none.
   - `makes`: how many distinct makes are left (use a `Set`).
2. **`main.js`** that imports `report`, calls `report(30000)`, then `report()`, and prints both results.

Expected output from `node main.js`:

```text
[ 'Ford: F-150', 'Tesla: Model 3' ]
[ 'no owner', 'Lin' ]
2
[ 'Tesla: Model S, Model 3', 'Ford: F-150' ] [ 'Ada', 'no owner', 'Lin' ] 2
```

**Answer:** [Appendix D.0](#d0-block-0-es6-primer). Participant card: E0.8 in [Appendix E.0](#e0-block-0-es6-primer).

### Exercises (1 to 2 minutes each, during the topics)

| After topic | Exercise |
|---|---|
| 1 | Predict `typeof null`, `typeof []` and `0.1 + 0.2 === 0.3`. Then write a safe way to compare decimals. |
| 2 and 3 | Rewrite `function price(amount, currency) { currency = currency \|\| "USD"; ... }` as an arrow function with a default parameter. |
| 4 and 5 | From `{ id, make, price }`, make a new object with a different price without touching the original. Then take `id` out and keep the rest. |
| 7 and 8 | Count cars per make with a `Map`. List the unique years with a `Set`. |
| 9 | Given users where some have no `address`, list each user's city or `"unknown"`. |
| 10 | Write a `Counter` class with a private count, an `increment()` that can be chained, and a `value` getter. |
| 13 | Rewrite a `.then().catch().finally()` chain as `async`/`await` with `try`/`catch`/`finally`. |

**Answers:** [Appendix D.0](#d0-block-0-es6-primer). Participant cards with hints: [Appendix E.0](#e0-block-0-es6-primer).

### Recap and checkpoint (2 min)

Go back to the lines quoted at the start of each topic. Pick three and ask a participant to say what each one does in plain words, for example `const { make, model, year, price } = req.body;`, `setCars((current) => [...current, car])` and `const allCars = await db.select().from(cars);`. If they can, the block worked.

If you run behind, shorten topics 6, 8 and 10. They are the ones the rest of the day uses least.

Common slips in this block: running a file from the wrong folder, a missing `"type": "module"` (topic 11), and curly quotes pasted from a slide, which Node reports as a `SyntaxError` on an innocent-looking line.

---

## 4. Block 1: Node.js (`01_nodejs`) — video 16:43 to 23:30

### Learning objectives

- Node is the environment that lets JavaScript run outside the browser. It is not a language, not a framework, and it does not replace JavaScript. `[16:44]`
- Know the two tools you get on install: `node` (runs files) and `npm` (installs packages). `[17:20]`
- A server is a program that runs forever and answers HTTP requests. `[20:00]`
- Raw `http` works but does not scale to real APIs, which is why Express exists. `[23:30]`

### Official docs to open in this block

| Topic                                          | Official page                                                                                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| What Node is                                   | [Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) |
| REPL                                           | [Node.js REPL](https://nodejs.org/api/repl.html)                                              |
| `os.platform()`                              | [`os` module](https://nodejs.org/api/os.html)                                               |
| `createServer`, `listen`, `req`, `res` | [`http` module](https://nodejs.org/api/http.html)                                           |
| `import` and `"type": "module"`            | [ES modules](https://nodejs.org/api/esm.html)                                                 |
| `npm`                                        | [About npm](https://docs.npmjs.com/about-npm)                                                 |

### Talking points

1. **Misconceptions first.** Ask the room: "Is Node a language? A framework?" Then give the answer from `[16:44]`: it is the environment around JavaScript.
2. **REPL.** Type `node` in a terminal, run `1 + 1` and `const name = "Ada"` then `name`. Exit with Ctrl+C. `[17:50]` The point: it is the same JavaScript, evaluated for you.
3. **Run a file.** `hello.js`: `console.log("Node is running this JavaScript file!")`, then `node hello.js`. No browser, no HTML, no script tag. `[18:20]`
4. **`window` is not defined.** Add `console.log(window)`. It fails because `window` and `document` come from the browser, not the language. `[19:00]` Node has its own set instead: `fs`, `http`, `crypto`, `path`, `os`. Import one: `import os from "os"; console.log(os.platform())`. A browser cannot tell you your OS.
5. **What is a server?** A program that listens for requests and returns responses. Nothing magic. `[20:00]`

### Live coding: `01_nodejs/server.js`

```js
import http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("You just built a server in Node.js!");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

Run `node server.js`, open http://localhost:3000. Narrate it: the callback runs once per request, `req` is what the client sent, `res` is what you send back, and `listen` keeps the process alive. `[21:00]` Open the [`http` docs](https://nodejs.org/api/http.html) and show `createServer` and `listen` in the API list so participants learn where to look things up.

> If someone sees `Cannot use import statement outside a module`: the nearest `package.json` says `"type": "commonjs"`, so it needs `"type": "module"` (or the `.mjs` extension). `01_nodejs` has no `package.json`, and recent Node versions detect the `import` syntax and run it anyway, so older Node versions are where this error shows up. You will see it again in Block 2 on purpose. Full explanation: [Block 0, topic 11](#11-es-modules-6-min).

### Exercise (20 min)

Without installing anything, change the server so that:

1. `GET /` returns text as before.
2. `GET /api/hello` returns JSON `{ "message": "hi" }` with `Content-Type: application/json`.
3. Anything else returns status 404 and the text `Not found`.

Hint: branch on `req.url`. Do not give the answer away; the ugliness of the `if` chain is the lesson.

**Answer:** [Appendix D.1](#d1-block-1-raw-http-server). Participant cards with hints: [Appendix E.1](#e1-block-1-nodejs).

### Checkpoint and discussion

- Everyone can `curl -i localhost:3000/api/hello` and see the `Content-Type` header.
- Ask: "Now add `POST /api/hello` that reads a JSON body. What would you have to write?" Let them feel it. Raw Node makes you inspect `req.url`, parse bodies, repeat error handling, and write your own routing and middleware. `[23:30]` That motivates Express.

### Common mistakes

- Forgetting `Ctrl+C` before restarting, then `EADDRINUSE: address already in use :::3000`.
- Opening the page before the server is listening.

---

## 5. Block 2: Express (`02_expressjs`) — video 24:00 to 47:30

### Learning objectives

- Say what Express is: a minimalist layer over Node's `http` that gives you routing, middleware, and request/response helpers. `[24:30]`
- Know when to use it and when to look at Nest, Next or Fastify. `[26:00]`
- Build CRUD on an array: GET all, GET one, POST, PUT, DELETE, with correct status codes (200, 201, 400, 404).
- Use route params (`:id`), JSON bodies (`express.json()`), routers with a shared prefix, and a logging middleware with `next()`.

### Official docs to open in this block

| Topic                                           | Official page                                                                                                                                        |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install and first app                           | [Installing](https://expressjs.com/en/starter/installing.html), [Hello world](https://expressjs.com/en/starter/hello-world.html)                       |
| Verbs, `:id` params, `express.Router`       | [Routing](https://expressjs.com/en/guide/routing.html)                                                                                                |
| `app.use`, `next()`, `express.json()`     | [Using middleware](https://expressjs.com/en/guide/using-middleware.html), [Writing middleware](https://expressjs.com/en/guide/writing-middleware.html) |
| The four-argument error handler                 | [Error handling](https://expressjs.com/en/guide/error-handling.html)                                                                                  |
| Why async handlers just work in Express 5       | [Migrating to Express 5](https://expressjs.com/en/guide/migrating-5.html)                                                                             |
| `req`, `res`, `app`, `Router` reference | [Express 5.x API](https://expressjs.com/en/5x/api.html)                                                                                               |
| Status codes (200, 201, 400, 404, 500)          | [MDN: HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)                                                          |
| GET, POST, PUT, DELETE                          | [MDN: HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)                                                              |

### Concepts (about 20 min, before touching the keyboard)

- **Why Express** `[24:00 – 26:30]`: minimal, no forced structure, still the default Node backend. Skip the company name-dropping unless the room asks.
- **What an API is** `[26:30 – 28:00]`: one program talking to another. A request has a URL, a method and optional body and headers. A response has a status code, a JSON body and optional headers. Example: `POST /api/v1/comments` returns `201 Created`.

### Live coding, step by step

Start from an empty `02_expressjs` folder. Keep the commit history in mind: it is the same order. `[28:00]`

1. **Init and install.**
   ```bash
   npm init -y
   npm install express
   ```

   In `package.json` add `"type": "module"` and a script `"dev": "node --watch server.js"`. `--watch` restarts on file changes.
2. **First server.**
   ```js
   import express from "express";
   const app = express();
   const PORT = 3000;
   app.get("/", (req, res) => res.send("Hello from Car API!"));
   app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
   ```

   Run `npm run dev`. **Show the error on purpose.** `npm init -y` writes `"type": "commonjs"`, so the first `import` fails with `SyntaxError: Cannot use import statement outside a module`. Change it to `"module"` in `package.json`. (Checked on Node 26. See [Block 0, topic 11](#11-es-modules-6-min).) `[31:00]`
3. **One route per verb.** Add stubs for `GET /api/v1/cars`, `POST`, `PUT /:id`, `DELETE /:id`, `GET /:id` that just `res.send(...)` a message. Explain that `:id` becomes `req.params.id`, and that params are **strings**. `[33:00 – 34:30]` Docs to open: [Routing guide](https://expressjs.com/en/guide/routing.html) (route parameters section).
4. **Notice the repetition, introduce the router.** `/api/v1` is repeated everywhere. Create `const router = express.Router()`, move the routes to `router.get("/cars", ...)`, and mount it once: `app.use("/api/v1", router)`. `[34:30 – 35:50]`
5. **Add the data.** An array at the top with three cars (Toyota Camry, Tesla Model S, Ford F-150). Call it "a sort of database. Not really. What is missing is persistence." `[36:00 – 37:00]`
6. **JSON bodies.** `app.use(express.json())`. Without it `req.body` is `undefined`. `[37:20]`
7. **GET all / GET one.** `res.json(cars)`. For one: `parseInt(req.params.id)`, `cars.find(...)`, return `404` with `{ error: "Car not found" }` if missing. `[38:00 – 39:50]`
8. **POST, PUT, DELETE.** The video leaves these as a challenge, so let the room try for 10 minutes, then show the solution. `[40:00 – 43:30]`
   - POST: read `make, model, year, price` from `req.body` (that is destructuring, [Block 0, topic 4](#4-destructuring-assignment-7-min)), return `400` if one is missing, build a new object, `push`, return `201`.
   - PUT: find the index, `404` if missing, update only the fields that were sent, return the car.
   - DELETE: find the index, `404` if missing, `splice`, return the deleted car.
9. **Middleware.** Add above the routes:
   ```js
   app.use((req, res, next) => {
     console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
     next();
   });
   ```

   **Show what happens without `next()`**: the request hangs. Then add it back. Middleware is code that runs before or after every request: logging, auth, caching, rate limiting, validation. `[44:00 – 46:30]` Docs to open: [Using middleware](https://expressjs.com/en/guide/using-middleware.html) and [Writing middleware](https://expressjs.com/en/guide/writing-middleware.html).
10. **Error handler.** Last in the file, four arguments: `(err, req, res, next)`. It turns any thrown error into `500` with a JSON message. Uncomment `throw new Error(...)` in the `/` route to demo it. Docs to open: [Error handling](https://expressjs.com/en/guide/error-handling.html).

### Test it with an HTTP client `[40:30 – 42:30]`

```bash
curl localhost:3000/api/v1/cars
curl -X POST localhost:3000/api/v1/cars -H 'content-type: application/json' \
     -d '{"make":"BMW","model":"4 Series","year":2020,"price":15000}'
curl -i localhost:3000/api/v1/cars/99      # 404
```

Browsers only make GET requests from the URL bar. This is why you need a client for POST, PUT, DELETE.

### Exercise (30 min)

1. Add `GET /api/v1/cars?make=Tesla` that filters the list by query string (`req.query.make`).
2. Add validation: `year` must be a number between 1900 and the current year; return `400` with a clear message if not.
3. Break something on purpose, delete a car and then add one. What id does the new car get? (See "Common mistakes".)

**Answer:** [Appendix D.2](#d2-block-2-express-api). The same appendix has the full POST, PUT and DELETE reference solution for the step-8 challenge. Participant cards with hints: [Appendix E.2](#e2-block-2-express).

### Checkpoint

- `curl` shows the data change across POST, PUT and DELETE.
- **Restart the server (save the file to trigger `--watch`). Everything the room added is gone.** Hold on this for a moment: it is the setup for Block 3. `[48:00]`

### Common mistakes

- Missing `express.json()`, so the POST body is `undefined`.
- Comparing `car.id === req.params.id` (number versus string). Always `parseInt`.
- Forgetting `next()` in a middleware.
- Putting the error handler before the routes: it must come last.
- **A repo detail worth showing.** `const nextId = cars.length + 1` produces a duplicate id after a delete (delete id 1 of 3, then add: new id is 3, which already exists). It is a real bug in the example. Ask the room to find it. The database's `serial` column fixes this properly in Block 3.

---

## 6. Block 3a: Databases and SQL — video 48:00 to 1:09:00

This block is concepts plus a hands-on SQL lab. Do not spend much time on the database history.

### Talking points

- **Why a database.** Arrays live in memory and die with the process. A database handles concurrent users, stays consistent after errors, searches millions of rows fast, and survives hardware failure. `[48:00 – 49:30]`
- **SQL is a language, not a database.** Postgres, MySQL, SQL Server and Oracle all speak it. `[49:30]`
- **SQL versus NoSQL.** SQL stores tables with a schema and relationships, and guarantees ACID (an operation either completes fully or not at all). NoSQL fits unpredictable or schema-less data: logs, caches, event streams. Real systems often mix them. `[50:00 – 52:00]`
- **Why Postgres.** Open source, rich types (JSON, arrays), strong integrity, fast joins, great community. `[52:00 – 53:30]`
- **How Postgres is organized.** Server → database → schema (`public` by default) → table → columns and rows. Each column has a type, and tables enforce constraints: primary key, foreign key, not null, unique, check. `[55:30 – 57:30]`
- **Where Postgres can live.** Local install, Docker, or serverless (Neon, Supabase and others). `[57:30 – 1:00:00]` This workshop uses **Docker**, because it needs no accounts and works offline. The video uses Neon for the Drizzle part. If you prefer Neon, see "Using Neon instead" at the end.

### Official docs to open in this block

| Topic                                                | Official page                                                                                                                                                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Postgres 17 manual (home)                            | [PostgreSQL 17 documentation](https://www.postgresql.org/docs/17/)                                                                                                                                                                                                  |
| Creating a table                                     | [Tutorial: creating a new table](https://www.postgresql.org/docs/17/tutorial-table.html)                                                                                                                                                                            |
| `serial`, `integer`, `numeric`                 | [Numeric types](https://www.postgresql.org/docs/17/datatype-numeric.html)                                                                                                                                                                                           |
| `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK` | [Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)                                                                                                                                                                                              |
| Read, insert, update, delete                         | [`SELECT`](https://www.postgresql.org/docs/17/sql-select.html), [`INSERT`](https://www.postgresql.org/docs/17/sql-insert.html), [`UPDATE`](https://www.postgresql.org/docs/17/sql-update.html), [`DELETE`](https://www.postgresql.org/docs/17/sql-delete.html) |
| The `psql` shell                                   | [psql reference](https://www.postgresql.org/docs/17/app-psql.html)                                                                                                                                                                                                  |
| Running Postgres in Docker                           | [Docker Hub: `postgres` image](https://hub.docker.com/_/postgres), [Docker Compose](https://docs.docker.com/compose/)                                                                                                                                              |

### Lab: SQL in `psql` (15 min)

Start the database from `03_postgresql`:

```bash
npm run db:up                                  # docker compose up -d --wait db
docker compose exec db psql -U postgres -d cars
```

Use a scratch table called `cars_scratch` so you do not collide with the table Drizzle creates in Block 3b. Run the video's sequence `[1:00:30 – 1:09:00]`:

```sql
CREATE TABLE cars_scratch (
  id SERIAL PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO cars_scratch (make, model, year, price) VALUES
  ('BMW', '4 Series', 2022, 28000),
  ('Ford', 'Mustang', 2021, 25000),
  ('Tesla', 'Model 3', 2021, 30000),
  ('Honda', 'Civic', 2021, 15000);

SELECT * FROM cars_scratch;
SELECT make, model FROM cars_scratch;
SELECT * FROM cars_scratch WHERE year = 2021 AND price < 27000;
SELECT * FROM cars_scratch ORDER BY price DESC LIMIT 3;
UPDATE cars_scratch SET price = 26000 WHERE id = 2;
DELETE FROM cars_scratch WHERE id = 2;
DROP TABLE cars_scratch;
```

Teaching beats:

- `SERIAL PRIMARY KEY` is an auto-incrementing integer that uniquely identifies the row. `[1:01:00]`
- `NUMERIC(10, 2)` stores up to 10 digits with exactly 2 after the decimal point. It is exact, so there are no floating-point rounding errors, which is why money uses it. `[1:02:00]` Docs to open: [Numeric types](https://www.postgresql.org/docs/17/datatype-numeric.html).
- **SQL has no trailing commas.** Someone will hit this error. `[1:03:00]`
- **Warn about `DELETE` without `WHERE`.** It empties the whole table. `[1:08:30]`

### Exercise: SQL practice (10 min)

After the lab, participants practise on a fresh table of five cars: filter and sort, `LIMIT`, `UPDATE` with a `WHERE`, `DELETE` with a preview, and (stretch) `GROUP BY`. Cards with hints: [Appendix E.3a](#e3a-block-3a-sql-practice). Answers: [Appendix D.3a](#d3a-block-3a-sql-practice).

### Checkpoint

Everyone can explain `SELECT ... WHERE ... ORDER BY ... LIMIT` in their own words. Leave `psql` with `\q`.

---

## 7. Block 3b: Drizzle + Express + Postgres (`03_postgresql`) — video 1:09:00 to 1:27:00

### Learning objectives

- Describe the three ways to talk to Postgres from Node: the raw `pg` library (full control, but SQL in strings), Prisma (own schema language, heavy abstraction), Drizzle (schema in code, close to SQL, typed). `[1:09:30 – 1:14:30]`
- Define a table in JavaScript, generate a migration, apply it, and query it with `db.select()` and `db.insert()`.
- Explain what each of the four files does: `schema.js`, `drizzle.config.js`, `db.js`, `server.js`.

### Official docs to open in this block

| Topic                                                              | Official page                                                                                                                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What Drizzle is                                                    | [Drizzle ORM overview](https://orm.drizzle.team/docs/overview)                                                                                                                              |
| Full setup path for this repo (Postgres + `postgres` driver)     | [Get started with PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-new)                                                                                                     |
| `pgTable` and the schema file                                    | [Schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration)                                                                                                                  |
| `serial`, `varchar`, `integer`, `numeric`, `timestamp`   | [PostgreSQL column types](https://orm.drizzle.team/docs/column-types/pg)                                                                                                                    |
| `db.select()`, `db.insert()`, `db.update()`, `db.delete()` | [Select](https://orm.drizzle.team/docs/select), [Insert](https://orm.drizzle.team/docs/insert), [Update](https://orm.drizzle.team/docs/update), [Delete](https://orm.drizzle.team/docs/delete) |
| `eq` and other filters                                           | [Operators](https://orm.drizzle.team/docs/operators)                                                                                                                                        |
| `drizzle.config.js`                                              | [Drizzle config file](https://orm.drizzle.team/docs/drizzle-config-file)                                                                                                                    |
| Migrations                                                         | [`drizzle-kit generate`](https://orm.drizzle.team/docs/drizzle-kit-generate), [`drizzle-kit migrate`](https://orm.drizzle.team/docs/drizzle-kit-migrate)                                 |
| The `postgres` driver used in `db.js`                          | [postgres.js on GitHub](https://github.com/porsager/postgres)                                                                                                                               |
| Neon (what the video uses)                                         | [Drizzle + Neon](https://orm.drizzle.team/docs/get-started/neon-new), [Neon docs](https://neon.com/docs/introduction)                                                                        |

### How the pieces connect

```
schema.js ──(drizzle-kit generate)──► drizzle/0000_*.sql ──(drizzle-kit migrate)──► Postgres table
    │                                                                                    ▲
    └──────────────► server.js ── db.select().from(cars) ── db.js (postgres-js client) ──┘
```

### Live coding, in this order

Start from a copy of `02_expressjs/server.js` in `03_postgresql`. `[1:16:00]`

1. **Install.** `npm install drizzle-orm postgres dotenv` and `npm install -D drizzle-kit`. (The video installs `@neondatabase/serverless` here; this repo uses `postgres` for a local database.)
2. **Scripts.** In `package.json`: `"db:up": "docker compose up -d --wait db"`, `"db:down"`, `"db:migrate": "drizzle-kit migrate"`.
3. **`.env`.** `DATABASE_URL=postgres://postgres:postgres@localhost:5433/cars`. Explain why the port is 5433: Docker maps container port 5432 to host port 5433, so it does not clash with a Postgres already on 5432.
4. **`schema.js`.** `[1:19:00 – 1:21:30]`
   ```js
   import { pgTable, serial, varchar, integer, numeric, timestamp } from "drizzle-orm/pg-core";

   export const cars = pgTable("cars", {
     id: serial("id").primaryKey(),
     make: varchar("make", { length: 100 }).notNull(),
     model: varchar("model", { length: 100 }).notNull(),
     year: integer("year").notNull(),
     price: numeric("price", { precision: 10, scale: 2 }).notNull(),
     createdAt: timestamp("created_at").defaultNow(),
   });
   ```

   Same table as the SQL lab, written as a JavaScript object. Point out that the JS name `createdAt` maps to the column `created_at`.
5. **`drizzle.config.js`.** Where the schema is, where migrations go, which dialect, which URL. `[1:17:00]`
   ```js
   import "dotenv/config";
   import { defineConfig } from "drizzle-kit";
   export default defineConfig({
     schema: "./schema.js",
     out: "./drizzle",
     dialect: "postgresql",
     dbCredentials: { url: process.env.DATABASE_URL },
   });
   ```
6. **`db.js`.** `[1:18:00]`
   ```js
   import "dotenv/config";
   import { drizzle } from "drizzle-orm/postgres-js";
   import postgres from "postgres";
   const client = postgres(process.env.DATABASE_URL);
   export const db = drizzle(client);
   ```
7. **Generate and apply the migration.** `[1:21:30 – 1:23:00]`
   ```bash
   npx drizzle-kit generate     # writes drizzle/0000_*.sql
   npm run db:migrate           # applies it
   ```

   Open the generated SQL file. It is the same `CREATE TABLE "cars" (...)` they typed by hand in Block 3a. Confirm in `psql`: `\dt` then `SELECT * FROM cars;`. **Tell them the migration folder is committed to git**, so teammates and servers can replay it. Docs to open: [`drizzle-kit generate`](https://orm.drizzle.team/docs/drizzle-kit-generate) and [`drizzle-kit migrate`](https://orm.drizzle.team/docs/drizzle-kit-migrate).
   *If `drizzle-kit migrate` complains it cannot find the config, check you are in `03_postgresql`. It is the exact thing that happened in the video. `[1:22:00]`*
8. **Replace the POST route.** `[1:23:00 – 1:25:30]`
   ```js
   router.post("/cars", async (req, res) => {
     const { make, model, year, price } = req.body;
     if (!make || !model || !year || !price) {
       return res.status(400).json({ error: "Missing required fields" });
     }
     const [newCar] = await db.insert(cars).values({ make, model, year, price }).returning();
     res.status(201).json(newCar);
   });
   ```

   Three teaching beats: the handler is now `async` because the database is slow. The `cars` import is now the real table from `schema.js`, not the array. `.returning()` gives back the inserted row including the database-assigned `id` and `createdAt`.
9. **Replace GET all.** `const allCars = await db.select().from(cars); res.json(allCars);` `[1:26:00]`
10. **Test.** POST two cars with `curl`, then GET. **Restart the server: the data is still there.** That is the payoff for the Block 2 restart demo.

> **Express 5 note.** If an `async` handler throws or a promise rejects, Express 5 forwards the error to the error-handling middleware by itself. In Express 4 you needed `try/catch` or a wrapper in every handler. Do not spend more than a minute on this. (`async`/`await` itself is [Block 0, topic 13](#13-asyncawait-es2017-and-error-handling-7-min).)

### The exercise (30 min): finish the other three routes

This is deliberate. `03_postgresql/server.js` in the repo still has the old array code in three routes. On a running server, with a fake id, the result is:

```
GET    /api/v1/cars/99999  → 500 {"error":"Something went wrong!","message":"cars.find is not a function"}
PUT    /api/v1/cars/99999  → 500 {"error":"Something went wrong!","message":"cars.findIndex is not a function"}
DELETE /api/v1/cars/99999  → 500 {"error":"Something went wrong!","message":"cars.findIndex is not a function"}
```

(We verified this on the live server while writing this guide. `GET /api/v1/cars` and `POST /api/v1/cars` work.) `cars` is now a Drizzle table object, not an array, so `.find` and `.findIndex` do not exist. The video ends this segment with the same challenge. `[1:26:30]`

Ask participants to port the three routes using what they know of SQL. The mapping from SQL to Drizzle:

| SQL                                               | Drizzle                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| `SELECT * FROM cars WHERE id = $1`              | `db.select().from(cars).where(eq(cars.id, id))`                   |
| `UPDATE cars SET ... WHERE id = $1 RETURNING *` | `db.update(cars).set({ ... }).where(eq(cars.id, id)).returning()` |
| `DELETE FROM cars WHERE id = $1 RETURNING *`    | `db.delete(cars).where(eq(cars.id, id)).returning()`              |

`eq` comes from `drizzle-orm`: `import { eq } from "drizzle-orm";`. Docs to open: [Operators](https://orm.drizzle.team/docs/operators), then [Update](https://orm.drizzle.team/docs/update) and [Delete](https://orm.drizzle.team/docs/delete) for the `.set()`, `.where()` and `.returning()` forms.

Reference solution for GET one (use this as a model, then let them do PUT and DELETE):

```js
router.get("/cars/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [car] = await db.select().from(cars).where(eq(cars.id, id));
  if (!car) return res.status(404).json({ error: "Car not found" });
  res.json(car);
});
```

For PUT and DELETE the shape is the same: await the query, destructure the first row from `.returning()`, return 404 if the result is empty. Success criteria: GET, PUT and DELETE for an existing id return the right JSON, and for a missing id return 404.

**Answer:** [Appendix D.3](#d3-block-3b-drizzle-routes). Participant cards with hints: [Appendix E.3](#e3-block-3b-drizzle-routes).

### Things worth pointing out

- **`price` comes back as a string**, for example `"50000.00"` (see the real GET output above). Postgres `numeric` is exact decimal and the driver returns it as text so no precision is lost. In React, `Number(price)` before doing arithmetic.
- **`createdAt`**, not `created_at`, in the JSON. Drizzle maps the names for you.
- `db.js` and `drizzle.config.js` both throw a clear error if `DATABASE_URL` is missing. That is a deliberate fail-fast.
- Prisma versus Drizzle in one sentence: Prisma gives you a new language and a generated client; Drizzle keeps you close to SQL and plain JavaScript. `[1:12:00 – 1:14:30]`

### Common mistakes

- Running `drizzle-kit` from the wrong folder.
- Starting the server before `npm run db:up`: `ECONNREFUSED 127.0.0.1:5433`.
- Missing `.env`: `DATABASE_URL is not set in the .env file`.
- Forgetting `await`, so the response is an empty object or a pending promise.
- Re-running `generate` after already applying migration 0 produces nothing new unless the schema changed. That is correct behavior: explain it.

---

## 8. Block 4: React (`04_reactjs`) — video 1:27:00 to 1:43:43

### Learning objectives

- Explain what React is: a library for building UI from reusable components, where you describe the UI as a function of state and React updates the DOM efficiently. `[1:28:00 – 1:29:30]`
- Create a component and render a list with `map` and a `key`.
- Use `useState` and `useEffect(..., [])` to load data once on mount.
- Explain what CORS is, why the browser blocks `localhost:3000` calls from `localhost:5173`, and how the Vite proxy removes the problem. `[1:38:00 – 1:39:45]`

### Official docs to open in this block

| Topic                                   | Official page                                                                                                                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React from the start                    | [Learn React](https://react.dev/learn)                                                                                                                                         |
| Components                              | [Your first component](https://react.dev/learn/your-first-component)                                                                                                           |
| Props                                   | [Passing props to a component](https://react.dev/learn/passing-props-to-a-component)                                                                                           |
| `map` and `key`                     | [Rendering lists](https://react.dev/learn/rendering-lists)                                                                                                                     |
| State                                   | [`useState`](https://react.dev/reference/react/useState)                                                                                                                     |
| Effects and the `[]` dependency array | [`useEffect`](https://react.dev/reference/react/useEffect), [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)                                  |
| Vite                                    | [Vite guide](https://vite.dev/guide/)                                                                                                                                          |
| The dev proxy                           | [Vite `server.proxy`](https://vite.dev/config/server-options#server-proxy)                                                                                                   |
| `fetch`                               | [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)                                                                             |
| Origins and CORS                        | [MDN: Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) |

### Live coding

1. **Scaffold.** The repo already has it. Explain the command used: `npm create vite@latest . -- --template react`. Run `npm install` and `npm run dev`, open http://localhost:5173. `[1:30:00]`
2. **Clean slate.** Delete `App.css`, trim `index.css` to a small reset (`margin: 0; padding: 0; box-sizing: border-box`, body font and background). `[1:31:00 – 1:32:30]` Do not spend time here. Styling is not the topic.
3. **`App.jsx` skeleton.** `const App = () => <div><h1>Welcome so Car Store</h1></div>; export default App`. `[1:32:30]`
4. **First component: `src/components/Car.jsx`.** Render it three times first with static text to show reuse. `[1:33:30 – 1:34:30]`
5. **Run both servers.** Two terminals: frontend (`04_reactjs`, `npm run dev`), backend (`03_postgresql`, `npm run dev`). `[1:35:00]` Check http://localhost:3000/api/v1/cars in the browser first.
6. **State and effect.** `[1:36:00 – 1:37:30]`
   ```jsx
   const [cars, setCars] = useState([]);

   useEffect(() => {
     fetch("/api/v1/cars")
       .then((res) => res.json())
       .then((data) => setCars(data))
       .catch((err) => console.error(err));
   }, []);
   ```

   The empty dependency array means "run once, after the component first appears". The first render has `cars = []`, then `setCars` triggers a second render with the data. Docs to open: [`useState`](https://react.dev/reference/react/useState) and [`useEffect`](https://react.dev/reference/react/useEffect). The `.then` chain is [Block 0, topic 12](#12-promises-8-min), and the same code as `async`/`await` is [topic 13](#13-asyncawait-es2017-and-error-handling-7-min).
7. **The two failures, in this order. Do not skip them, they are the lesson.** `[1:37:30 – 1:39:45]`
   - **Failure 1: `Unexpected token '<', "<!doctype "... is not valid JSON`.** If you `fetch("/api/v1/cars")` before the proxy exists, Vite (port 5173) has no `/api` route, so it serves `index.html`. `res.json()` chokes on the first `<`. This is in the repo history: commit `672f2ec`.
   - **Failure 2: the CORS error.** Pointing the fetch at `http://localhost:3000/api/v1/cars` fixes failure 1 but the browser blocks it: protocol + host + port form an *origin*, and `5173` is not `3000`. The server would have to send `Access-Control-Allow-Origin`. CORS exists so that any site you visit cannot silently read your data from other sites. Docs to open: [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS). This is in the repo history: commit `19ad2b9`.
   - **The fix: a dev proxy.** In `vite.config.js`:
     ```js
     server: {
       proxy: {
         "/api": { target: "http://localhost:3000", changeOrigin: true },
       },
     },
     ```

     Vite forwards anything under `/api` to Express, so the browser only ever talks to `5173`. **Restart Vite after editing this file.** The config is read once at startup. Docs to open: [Vite `server.proxy`](https://vite.dev/config/server-options#server-proxy).
8. **The empty-array `console.log` trap.** `console.log(cars)` placed *inside* `useEffect`, right after `fetch`, prints `[]`, because `fetch` is async and the log runs before the response arrives. Put the log in the component body to see the value after the state updates. `[1:40:00]` (This is commit `ead2c68`.)
9. **Render the list.** `[1:40:30 – 1:42:00]`
   ```jsx
   <ul>
     {cars.map((car) => <Car key={car.id} {...car} />)}
   </ul>
   ```

   `key` lets React tell items apart when the list changes ([Rendering lists](https://react.dev/learn/rendering-lists)). `{...car}` spreads each field of the row into a prop.
   `Car.jsx` destructures props: `({ make, model, year, price })` and renders them inside an `<li>`.
10. **Full-loop demo.** POST a new car with `curl`, reload the page, the new car appears. `[1:42:00 – 1:43:00]` Frontend asked backend, backend asked database, and the answer came back.

### One thing to correct in the repo

`App.jsx` uses `fetch('api/v1/cars')` (no leading slash). It works at `/` but becomes a *relative* URL on any nested route (`/cars/1` would request `/cars/api/v1/cars`). Teach `/api/v1/cars`. Fix it live and explain why.

### Exercise (20 min)

Pick as many as time allows, in this order:

1. Show a **loading** message while the request is in flight, and an **error** message if it fails (two more `useState`s).
2. Format the price as currency: `new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(price))`. Notice `price` arrives as a string.
3. Add an "Add car" **form** that sends a `POST` with `fetch(..., { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(...) })`, then refreshes the list. This is the suggested next step in the video. `[1:43:00]`

**Answer:** [Appendix D.4](#d4-block-4-react). Participant cards with hints: [Appendix E.4](#e4-block-4-react).

### Common mistakes

- Forgetting to restart Vite after changing `vite.config.js`.
- Forgetting `key` in the list: a console warning. Using the array index as a key when ids exist.
- Putting the fetch directly in the component body, causing an infinite fetch/render loop. Always `useEffect` with `[]`.
- Backend not running: the page stays empty and the console shows a proxy error.

---

## 9. Final demo and wrap-up (15 min)

1. Stop the Node server, then start it again. Reload the page. The data is still there.
2. Add a car with `curl`, reload, show it appears.
3. Draw the architecture diagram from section 1 on the board and ask each participant to name what happens at each arrow for one request: *browser → Vite → Express → Postgres → back*.
4. Recap in one slide, with the four building blocks (E, P, R, N): Node runs JavaScript on the server, Express handles HTTP, Postgres stores data, React shows it.

### Homework / stretch goals

- Finish the "Add car" form and add edit and delete buttons wired to PUT and DELETE.
- Return a number for `price` from the API (`Number(...)` in the handler) and discuss the trade-offs of doing it in the API versus the client.
- Add a second table (for example `owners`) with a foreign key to `cars`, generate a new migration, and read about joins.
- Read the Express error-handling guide and replace the manual `404` checks with a small helper.

Short answers for the first, second and last item are in [Appendix D.5](#d5-homework).

---

## 10. Troubleshooting table

| Symptom                                                                         | Likely cause                                                                                       | Fix                                                                                           |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `Cannot use import statement outside a module`                                | Missing `"type": "module"` in `package.json`                                                   | Add it, restart                                                                               |
| `EADDRINUSE :::3000`                                                          | Another process (often a previous server) holds the port                                           | `ss -ltnp \| grep :3000`, stop the old process                                               |
| `DATABASE_URL is not set in the .env file`                                    | `.env` missing or in the wrong folder                                                            | Create `03_postgresql/.env` with the URL from section 3                                     |
| `ECONNREFUSED 127.0.0.1:5433`                                                 | Postgres container not running                                                                     | `npm run db:up`, wait for `healthy`                                                       |
| `drizzle-kit migrate` cannot find config                                      | Wrong working directory                                                                            | `cd 03_postgresql`                                                                          |
| `relation "cars" does not exist`                                              | Migration not applied                                                                              | `npm run db:migrate`                                                                        |
| `cars.find is not a function` / `cars.findIndex is not a function` (500)    | PUT, DELETE, GET-by-id still use the array code                                                    | The Block 3b exercise                                                                         |
| React page shows an empty list                                                  | Backend not running, proxy not configured, or Vite not restarted                                   | Check `localhost:3000/api/v1/cars` first, then `vite.config.js`                           |
| `Unexpected token '<', "<!doctype "...` in the console                        | Fetch hit Vite instead of Express (no proxy, or wrong path)                                        | Add the proxy and use `/api/v1/cars`                                                        |
| CORS error in the console                                                       | Calling `localhost:3000` directly from `localhost:5173`                                        | Use the proxy and a relative URL                                                              |
| `price` shows `"50000.00"` as text                                          | `numeric` returns a string                                                                       | `Number(price)` or `Intl.NumberFormat`                                                    |
| `npm run build` fails with `Cannot find native binding` (Vite 8 / Rolldown) | `node_modules` was installed on another OS (for example Windows) and has no binding for this one | Delete `node_modules` and `package-lock.json`, run `npm install` in the OS you build in |

---

## 11. Dry-run script (for the facilitator)

Run this once before the day. All of it was exercised against the repo except where noted.

```bash
# Database
cd 03_postgresql
npm install
echo 'DATABASE_URL=postgres://postgres:postgres@localhost:5433/cars' > .env
npm run db:up
npm run db:migrate
npm run dev &                                  # needs port 3000 free

# API
curl localhost:3000/api/v1/cars
curl -X POST localhost:3000/api/v1/cars -H 'content-type: application/json' \
     -d '{"make":"Ford","model":"F150","year":2025,"price":50000}'
curl -i localhost:3000/api/v1/cars/99999      # expect 500 until the exercise is done

# Frontend
cd ../04_reactjs && npm install && npm run dev    # http://localhost:5173
```

Verified while writing this guide: the video's transcript window and timestamps, the contents of every file quoted above, and the live responses of `GET /api/v1/cars` (200) and of GET-by-id, PUT and DELETE (500, as described). Every Block 0 snippet and its D.0 answer was run with Node 26. Not verified: a clean-machine install from scratch, and the React page in a browser.

---

## Appendix A: Using Neon instead of local Docker

If you want to follow the video exactly:

1. Create a free project at neon.tech (Postgres 17), copy the connection string from the Connect button.
2. Put it in `03_postgresql/.env` as `DATABASE_URL=...`.
3. Install the Neon driver (`npm install @neondatabase/serverless`) and change `db.js` to use `drizzle-orm/neon-http` with `neon(process.env.DATABASE_URL)`. `[1:18:00]`
4. `drizzle.config.js`, `schema.js` and all routes stay the same.

Trade-off: no local setup and it works the same in production, but it needs internet access and everyone needs an account.

Docs to open: [Drizzle + Neon](https://orm.drizzle.team/docs/get-started/neon-new) and [Neon documentation](https://neon.com/docs/introduction).

## Appendix B: Key vocabulary

| Term         | One-line meaning                                                                       |
| ------------ | -------------------------------------------------------------------------------------- |
| Node.js      | JavaScript runtime outside the browser                                                 |
| npm          | Package manager that comes with Node                                                   |
| REPL         | Interactive Node shell (read, evaluate, print, loop)                                   |
| Express      | Minimal web framework on top of Node's `http`                                        |
| Middleware   | A function that runs before or after a request and calls `next()`                    |
| Router       | A group of routes sharing a prefix                                                     |
| REST / CRUD  | Using HTTP verbs to create, read, update and delete resources                          |
| ORM          | A library that maps tables to objects or code so you write fewer SQL strings           |
| Migration    | A SQL file describing a schema change, applied in order                                |
| Origin       | Protocol + host + port. Two URLs with different ports are different origins            |
| CORS         | Browser rule that blocks cross-origin requests unless the server allows them           |
| Proxy (Vite) | Dev server that forwards `/api` calls to another port so the browser sees one origin |

## Appendix C: Official documentation index

Everything in one place, grouped by technology, in the order you will need it. Every link was checked and returned HTTP 200 when this guide was written. Open them as tabs before class.

### JavaScript language (MDN)

- [Grammar and types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types), [`typeof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [`let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let), [`const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const), [`var`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var)
- [Arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), [Default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters), [Rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)
- [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring), [Spread syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
- [`for...of`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of), [`for...in`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in)
- [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set), [`Array.prototype.includes()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes), [Exponentiation `**`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation)
- [Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining), [Nullish coalescing](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
- [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import), [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export), [Node.js: `"type"` in `package.json`](https://nodejs.org/api/packages.html)
- [Using promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises), [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), [`async function`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function), [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await), [`try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)

### Node.js and npm

- [Introduction to Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- [`http` module](https://nodejs.org/api/http.html)
- [`os` module](https://nodejs.org/api/os.html)
- [REPL](https://nodejs.org/api/repl.html)
- [ES modules](https://nodejs.org/api/esm.html)
- [About npm](https://docs.npmjs.com/about-npm)

### Express

- [Installing](https://expressjs.com/en/starter/installing.html)
- [Hello world](https://expressjs.com/en/starter/hello-world.html)
- [Routing](https://expressjs.com/en/guide/routing.html)
- [Using middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Writing middleware](https://expressjs.com/en/guide/writing-middleware.html)
- [Error handling](https://expressjs.com/en/guide/error-handling.html)
- [Migrating to Express 5](https://expressjs.com/en/guide/migrating-5.html)
- [Express 5.x API reference](https://expressjs.com/en/5x/api.html)

### PostgreSQL, SQL and Docker

- [PostgreSQL 17 documentation](https://www.postgresql.org/docs/17/)
- [Creating a new table](https://www.postgresql.org/docs/17/tutorial-table.html)
- [Numeric types](https://www.postgresql.org/docs/17/datatype-numeric.html)
- [Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
- [`SELECT`](https://www.postgresql.org/docs/17/sql-select.html), [`INSERT`](https://www.postgresql.org/docs/17/sql-insert.html), [`UPDATE`](https://www.postgresql.org/docs/17/sql-update.html), [`DELETE`](https://www.postgresql.org/docs/17/sql-delete.html)
- [`psql`](https://www.postgresql.org/docs/17/app-psql.html)
- [Docker Hub: `postgres` image](https://hub.docker.com/_/postgres)
- [Docker Compose](https://docs.docker.com/compose/)

### Drizzle ORM and the driver

- [Overview](https://orm.drizzle.team/docs/overview)
- [Get started with PostgreSQL](https://orm.drizzle.team/docs/get-started/postgresql-new)
- [Get started with Neon](https://orm.drizzle.team/docs/get-started/neon-new)
- [Schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration)
- [PostgreSQL column types](https://orm.drizzle.team/docs/column-types/pg)
- [Select](https://orm.drizzle.team/docs/select), [Insert](https://orm.drizzle.team/docs/insert), [Update](https://orm.drizzle.team/docs/update), [Delete](https://orm.drizzle.team/docs/delete)
- [Operators](https://orm.drizzle.team/docs/operators)
- [Drizzle config file](https://orm.drizzle.team/docs/drizzle-config-file)
- [`drizzle-kit generate`](https://orm.drizzle.team/docs/drizzle-kit-generate), [`drizzle-kit migrate`](https://orm.drizzle.team/docs/drizzle-kit-migrate)
- [postgres.js (the driver in `db.js`)](https://github.com/porsager/postgres)
- [Neon documentation](https://neon.com/docs/introduction)

### React and Vite

- [Learn React](https://react.dev/learn)
- [Your first component](https://react.dev/learn/your-first-component)
- [Passing props to a component](https://react.dev/learn/passing-props-to-a-component)
- [Rendering lists](https://react.dev/learn/rendering-lists)
- [`useState`](https://react.dev/reference/react/useState)
- [`useEffect`](https://react.dev/reference/react/useEffect)
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [Vite guide](https://vite.dev/guide/)
- [Vite `server.proxy`](https://vite.dev/config/server-options#server-proxy)

### Web platform (MDN)

- [HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods)
- [Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

## Appendix D: Answer key

Instructor only. Each answer was run before it went into this guide:

- **D.0** ran with Node 26; the printed outputs are the real ones.
- **D.1 and D.2** ran on spare ports with `curl`.
- **D.3** ran against a throwaway Postgres database in the Docker container (created, migrated, tested, dropped), so no real data was touched.
- **D.3a** ran in a separate throwaway database (created, used and dropped). The output is the real `psql` output.
- **D.4** passed ESLint (exit 0) and `vite build` in a fresh install. It was **not** clicked through in a browser.

Use these as the "model answer" after participants have tried. Several different solutions are fine as long as the status codes and behavior match.

### D.0 Block 0: ES6+ primer

Every answer below was run with Node 26 and the output shown is the real output. Run them from a folder whose `package.json` has `{"type":"module"}`.

**Exercise 1: types.** `typeof null` is `"object"` (a historical bug), `typeof []` is `"object"` (use `Array.isArray`), and `0.1 + 0.2 === 0.3` is `false` because of binary floating point. Compare decimals with a tolerance:


```js
console.log(typeof null, typeof [], 0.1 + 0.2 === 0.3);

// Compare decimals with a tolerance, not with ===
const nearlyEqual = (a, b) => Math.abs(a - b) < Number.EPSILON;
console.log(nearlyEqual(0.1 + 0.2, 0.3));
```

Prints:

```text
object object false
true
```

**Exercises 2 and 3: arrow function with a default parameter.** Note how `currency || "USD"` becomes `currency = "USD"`. The two versions give the same results here. They differ for falsy values: `||` replaces `""` and `0` too, the default parameter only replaces `undefined`.

```js
// Before
function priceBefore(amount, currency) {
  currency = currency || "USD";
  return amount + " " + currency;
}

// After
const price = (amount, currency = "USD") => `${amount} ${currency}`;

console.log(priceBefore(100), "|", price(100));
console.log(priceBefore(100, "IDR"), "|", price(100, "IDR"));
```

Prints:

```text
100 USD | 100 USD
100 IDR | 100 IDR
```

**Exercises 4 and 5: update without mutating.** `{ ...car, price }` builds a new object, and `{ id, ...rest }` splits one off. The original `car` and `cars` are unchanged, which is what React needs.

```js
const car = { id: 1, make: "Tesla", price: 25000 };

const { id, ...rest } = car; // pull out id, keep everything else
console.log(id, rest);

const updated = { ...car, price: 26000 }; // a new object, car is untouched
console.log(updated, car);

const cars = [car, { id: 2, make: "Ford", price: 35000 }];
const updatedList = cars.map((c) => (c.id === 1 ? { ...c, price: 26000 } : c));
console.log(updatedList);
console.log(cars[0].price); // the original list did not change
```

Prints:

```text
1 { make: 'Tesla', price: 25000 }
{ id: 1, make: 'Tesla', price: 26000 } { id: 1, make: 'Tesla', price: 25000 }
[
  { id: 1, make: 'Tesla', price: 26000 },
  { id: 2, make: 'Ford', price: 35000 }
]
25000
```

**Exercises 7 and 8: count with a `Map`, unique with a `Set`.** `counts.get(make) ?? 0` is the standard "start at zero" idiom.

```js
const cars = [
  { make: "Tesla", year: 2023 },
  { make: "Ford", year: 2021 },
  { make: "Tesla", year: 2021 },
];

const counts = new Map();
for (const { make } of cars) {
  counts.set(make, (counts.get(make) ?? 0) + 1);
}
console.log(counts);

const years = [...new Set(cars.map((c) => c.year))].sort();
console.log(years);
```

Prints:

```text
Map(2) { 'Tesla' => 2, 'Ford' => 1 }
[ 2021, 2023 ]
```

**Exercise 9: safe lookup.** `?.` stops at the missing `address`, `??` supplies the fallback.

```js
const users = [{ name: "Ada", address: { city: "Jakarta" } }, { name: "Lin" }];
const cities = users.map((u) => u.address?.city ?? "unknown");
console.log(cities);
```

Prints:

```text
[ 'Jakarta', 'unknown' ]
```

**Exercise 10: `Counter` with a private field.** Returning `this` from `increment()` is what allows the chaining. `counter.count` is `undefined` because the field is `#count`, not a public `count`.

```js
class Counter {
  #count = 0;

  increment() {
    this.#count++;
    return this; // returning `this` allows chaining
  }

  get value() {
    return this.#count;
  }
}

const counter = new Counter().increment().increment();
console.log(counter.value, counter.count);
```

Prints:

```text
2 undefined
```

**Exercise 13: promise chain to `async`/`await`.** Same behavior, flat code, one `try`/`catch`/`finally` instead of `.catch` and `.finally`.

```js
const fetchCars = (fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error("network down")) : resolve([{ id: 1 }])), 10),
  );

// Before: a promise chain
await fetchCars()
  .then((cars) => console.log("then:", cars.length))
  .catch((err) => console.log("then failed:", err.message))
  .finally(() => console.log("then done"));

// After: async / await
const main = async (fail) => {
  try {
    const cars = await fetchCars(fail);
    console.log("await:", cars.length);
  } catch (err) {
    console.log("await failed:", err.message);
  } finally {
    console.log("await done");
  }
};
await main(false);
await main(true);
```

Prints:

```text
then: 1
then done
await: 1
await done
await failed: network down
await done
```

**Mini-challenge.** Files: `data.js` (given in the exercise), `report.js` and `main.js`.

`report.js`:

```js
import { fetchCars } from "./data.js";

export default async function report(minPrice = 0) {
  const cars = (await fetchCars()).filter(({ price }) => price >= minPrice);

  const byMake = new Map();
  for (const { make, model } of cars) {
    byMake.set(make, [...(byMake.get(make) ?? []), model]);
  }

  const lines = [];
  for (const [make, models] of byMake) {
    lines.push(`${make}: ${models.join(", ")}`);
  }

  return {
    lines,
    owners: cars.map((car) => car.owner?.name ?? "no owner"),
    makes: new Set(cars.map((car) => car.make)).size,
  };
}
```

`main.js`:

```js
import report from "./report.js";

const { lines, owners, makes } = await report(30000);
console.log(lines);
console.log(owners);
console.log(makes);

const all = await report();
console.log(all.lines, all.owners, all.makes);
```

Prints:

```text
[ 'Ford: F-150', 'Tesla: Model 3' ]
[ 'no owner', 'Lin' ]
2
[ 'Tesla: Model S, Model 3', 'Ford: F-150' ] [ 'Ada', 'no owner', 'Lin' ] 2
```

Where each topic shows up in the answer:

| Line | Topic |
|---|---|
| `import { fetchCars } from "./data.js"`, `export default async function` | ES modules, `async`/`await` (topics 11, 13) |
| `report(minPrice = 0)` | Default parameters (3) |
| `.filter(({ price }) => price >= minPrice)` | Arrow function, destructuring in the parameter (2, 4) |
| `new Map()`, `byMake.get(make) ?? []`, `[...old, model]` | `Map`, `??`, spread (7, 9, 5) |
| `for (const { make, model } of cars)`, `for (const [make, models] of byMake)` | `for...of` with destructuring (6, 4) |
| `car.owner?.name ?? "no owner"` | Optional chaining and nullish coalescing (9) |
| `new Set(cars.map(...)).size` | `Set` (7, 8) |

Accept any working solution. What matters is that `report(30000)` drops the cheaper Tesla and the missing owner shows as `"no owner"`.

### D.1 Block 1: raw HTTP server

`01_nodejs/server.js` with `/`, a JSON route and a 404:

```js
import http from "http";

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("You just built a server in Node.js!");
  }

  if (req.method === "GET" && req.url === "/api/hello") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "hi" }));
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

Check: `curl -i localhost:3000/api/hello` shows `200` and `Content-Type: application/json`. `curl -i localhost:3000/nope` shows `404`.

Points to make:

- `res.writeHead` sets the status and headers before `res.end` sends the body. Without the JSON `Content-Type`, the browser treats the text as plain text.
- `return res.end(...)` stops the function so the 404 lines below do not also run.

**The follow-up (POST with a JSON body).** Add this branch before the 404. Raw Node gives you the body in pieces, and you must collect and parse it yourself:

```js
if (req.method === "POST" && req.url === "/api/hello") {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      const { name } = JSON.parse(body);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: `hi ${name}` }));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  });
  return;
}
```

```bash
curl -X POST localhost:3000/api/hello -d '{"name":"Ada"}'   # {"message":"hi Ada"}
curl -X POST localhost:3000/api/hello -d 'nope'             # 400 {"error":"Invalid JSON"}
```

That is roughly 15 lines for one route. In Express the same route is `app.use(express.json())` once, then `req.body.name`. That contrast is the reason for Block 2.

### D.2 Block 2: Express API

**Step-8 challenge: the full POST, PUT and DELETE** (with the extra checks from the exercise already included in POST). Everything goes inside `02_expressjs/server.js`, on the `router`:

```js
router.get("/cars", (req, res) => {
  const { make } = req.query;

  // /cars?make=tesla (case-insensitive). No query string = all cars.
  if (typeof make === "string") {
    const matches = cars.filter(
      (c) => c.make.toLowerCase() === make.toLowerCase(),
    );
    return res.json(matches);
  }

  res.json(cars);
});

router.post("/cars", (req, res) => {
  const { make, model, year, price } = req.body;

  if (!make || !model || !year || !price) {
    return res.status(400).json({
      error: "Please provide make, model, year, and price",
    });
  }

  const yearNum = parseInt(year);
  const priceNum = parseFloat(price);

  if (
    !Number.isInteger(yearNum) ||
    yearNum < 1900 ||
    yearNum > new Date().getFullYear()
  ) {
    return res.status(400).json({
      error: `year must be a whole number between 1900 and ${new Date().getFullYear()}`,
    });
  }

  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    return res.status(400).json({ error: "price must be a number above 0" });
  }

  // Highest existing id + 1. (cars.length + 1 repeats an id after a delete.)
  const nextId = cars.length ? Math.max(...cars.map((c) => c.id)) + 1 : 1;

  const newCar = {
    id: nextId,
    make,
    model,
    year: yearNum,
    price: priceNum,
  };

  cars.push(newCar);

  res.status(201).json(newCar);
});

router.put("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const carIndex = cars.findIndex((c) => c.id === carId);

  if (carIndex === -1) {
    return res.status(404).json({ error: "Car not found" });
  }

  const { make, model, year, price } = req.body;

  // Update only provided fields
  if (make) cars[carIndex].make = make;
  if (model) cars[carIndex].model = model;
  if (year) cars[carIndex].year = parseInt(year);
  if (price) cars[carIndex].price = parseFloat(price);

  res.json(cars[carIndex]);
});

router.delete("/cars/:id", (req, res) => {
  const carId = parseInt(req.params.id);
  const carIndex = cars.findIndex((c) => c.id === carId);

  if (carIndex === -1) {
    return res.status(404).json({ error: "Car not found" });
  }

  const deletedCar = cars.splice(carIndex, 1)[0];

  res.json({
    message: "Car deleted successfully",
    car: deletedCar,
  });
});
```

Tested behavior to expect on the starting three cars:

| Request                                             | Result                                                                |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| `GET /api/v1/cars?make=tesla`                     | `200`, only the Tesla (case does not matter)                        |
| `GET /api/v1/cars?make=nobody`                    | `200`, `[]`                                                       |
| `POST` with `"year": 1800` or `"year": "abc"` | `400`, `year must be a whole number between 1900 and <this year>` |
| `POST` with `"price": -3`                       | `400`, `price must be a number above 0`                           |
| `POST` with only `{"make":"A"}`                 | `400`, `Please provide make, model, year, and price`              |
| `PUT /api/v1/cars/2` with `{"price":26000}`     | `200`, the updated car                                              |
| `PUT` or `DELETE /api/v1/cars/99`               | `404`, `Car not found`                                            |

**Question 3: the duplicate id.**

1. Start with ids `1, 2, 3`. Delete id `1`. The list is now `2, 3`, so `cars.length` is `2`.
2. The old code computes `nextId = cars.length + 1 = 3`. Id `3` already exists, so the new car gets a duplicate id, and `GET /cars/3` finds the wrong one.
3. The fix is to base the id on the largest existing id: `cars.length ? Math.max(...cars.map((c) => c.id)) + 1 : 1`. After the same delete, the next POST gets id `4`.
4. Lesson to draw out: counting rows is not the same as handing out unique ids. A database `serial` column keeps its own counter and never reuses a number, which is what Block 3 uses.

### D.3 Block 3b: Drizzle routes

Add `import { eq } from "drizzle-orm";` next to the other imports in `03_postgresql/server.js`, then replace the three array-based routes (`PUT`, `DELETE`, `GET /cars/:id`) with:

```js
router.get("/cars/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const [car] = await db.select().from(cars).where(eq(cars.id, id));

  if (!car) {
    return res.status(404).json({ error: "Car not found" });
  }

  res.json(car);
});

router.put("/cars/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const { make, model, year, price } = req.body;

  // Update only the fields that were sent
  const changes = {};
  if (make) changes.make = make;
  if (model) changes.model = model;
  if (year) changes.year = parseInt(year);
  if (price) changes.price = String(price);

  // .set({}) with nothing in it makes Drizzle throw, so stop early
  if (Object.keys(changes).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const [updatedCar] = await db
    .update(cars)
    .set(changes)
    .where(eq(cars.id, id))
    .returning();

  if (!updatedCar) {
    return res.status(404).json({ error: "Car not found" });
  }

  res.json(updatedCar);
});

router.delete("/cars/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const [deletedCar] = await db.delete(cars).where(eq(cars.id, id)).returning();

  if (!deletedCar) {
    return res.status(404).json({ error: "Car not found" });
  }

  res.json({
    message: "Car deleted successfully",
    car: deletedCar,
  });
});
```

Tested results (fresh table, one car created by `POST`):

| Request                                                          | Result                                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| `GET /api/v1/cars/1`                                           | `200`, the row. `price` is the string `"42000.00"` |
| `GET /api/v1/cars/99999`                                       | `404`, `Car not found`                               |
| `GET /api/v1/cars/abc`                                         | `400`, `Invalid id`                                  |
| `PUT /api/v1/cars/1` with `{"price":39999.5}`                | `200`, `price` becomes `"39999.50"`                |
| `PUT /api/v1/cars/1` with `{"make":"Tesla Inc","year":2024}` | `200`, only those two fields change                    |
| `PUT /api/v1/cars/1` with `{}`                               | `400`, `Nothing to update`                           |
| `PUT` or `DELETE /api/v1/cars/99999`                         | `404`, `Car not found`                               |
| `DELETE /api/v1/cars/1`, then again                            | `200` with the deleted row, then `404`               |

Points to make:

- **The pattern is the same three times:** parse the id, run the query, destructure the first row from the result, return `404` if there is no row. `.returning()` is what makes the "no row" check possible on `UPDATE` and `DELETE`: with nothing returned, you cannot tell "updated" from "no such car".
- **Why the empty `set({})` guard.** Without it, `PUT` with an empty body fails with Drizzle's `No values to set` error and the client gets a `500`. A `400` is the honest answer: the request was wrong, not the server.
- **`Number.isNaN` check.** `parseInt("abc")` is `NaN`, which is not a valid id. The guard turns that into a clear `400` instead of passing a bad value on to the database.
- **Why the query result is destructured as `[car]`.** Drizzle always returns an array, even for one row, because the SQL can return many rows.

### D.3a Block 3a: SQL practice

Every query below was run in a throwaway Postgres database (created, used and dropped) against the setup table from E.3a. The output is the real output.


**Setup**

```sql
CREATE TABLE cars_scratch (
  id SERIAL PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO cars_scratch (make, model, year, price) VALUES
  ('BMW', '4 Series', 2022, 28000),
  ('Ford', 'Mustang', 2021, 25000),
  ('Tesla', 'Model 3', 2021, 30000),
  ('Tesla', 'Model S', 2023, 45000),
  ('Honda', 'Civic', 2020, 15000);
```

Prints `INSERT 0 5`.

**E3a.1: 2021 or newer, most expensive first**

```sql
SELECT make, model, year, price FROM cars_scratch WHERE year >= 2021 ORDER BY price DESC;
```

```text
 make  |  model   | year |  price   
-------+----------+------+----------
 Tesla | Model S  | 2023 | 45000.00
 Tesla | Model 3  | 2021 | 30000.00
 BMW   | 4 Series | 2022 | 28000.00
 Ford  | Mustang  | 2021 | 25000.00
(4 rows)
```

**E3a.2: the two cheapest**

```sql
SELECT make, model, price FROM cars_scratch ORDER BY price ASC LIMIT 2;
```

```text
 make  |  model  |  price   
-------+---------+----------
 Honda | Civic   | 15000.00
 Ford  | Mustang | 25000.00
(2 rows)
```

**E3a.3: raise every Tesla by 1000.** Preview, change, check:

```sql
SELECT id, model, price FROM cars_scratch WHERE make = 'Tesla' ORDER BY id;
UPDATE cars_scratch SET price = price + 1000 WHERE make = 'Tesla';
SELECT id, model, price FROM cars_scratch WHERE make = 'Tesla' ORDER BY id;
```

Before:

```text
 id |  model  |  price   
----+---------+----------
  3 | Model 3 | 30000.00
  4 | Model S | 45000.00
(2 rows)
```

The update prints `UPDATE 2`. After:

```text
 id |  model  |  price   
----+---------+----------
  3 | Model 3 | 31000.00
  4 | Model S | 46000.00
(2 rows)
```

`price = price + 1000` reads the old value and writes the new one in the same statement. The `WHERE make = 'Tesla'` is the only thing keeping the other cars out of it.

**E3a.4: delete the cars older than 2021.** Preview first, then delete, then count:

```sql
SELECT id, make, model, year FROM cars_scratch WHERE year < 2021;
DELETE FROM cars_scratch WHERE year < 2021;
SELECT COUNT(*) AS remaining FROM cars_scratch;
```

Preview:

```text
 id | make  | model | year 
----+-------+-------+------
  5 | Honda | Civic | 2020
(1 row)
```

The delete prints `DELETE 1` and the count prints:

```text
 remaining 
-----------
         4
(1 row)
```

**E3a.5 (stretch): cars per make**

```sql
SELECT make, COUNT(*) AS cars FROM cars_scratch GROUP BY make ORDER BY cars DESC, make;
```

```text
 make  | cars 
-------+------
 Tesla |    2
 BMW   |    1
 Ford  |    1
(3 rows)
```

The second sort key (`make`) only makes the order of the two makes with one car each repeatable. Compare with the `Map` count in Block 0: the same idea, done by the database.

### D.4 Block 4: React

Three files. Each snippet below passed ESLint and `vite build`.

**`src/components/Car.jsx`: currency formatting.** `price` arrives as a string such as `"28000.00"`, so convert it before formatting:

```jsx
const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const Car = ({ make, model, year, price }) => {
  return (
    <li>
      <p>Make: {make}</p>
      <p>Model: {model}</p>
      <p>Year: {year}</p>
      {/* price arrives as a string such as "28000.00", so convert first */}
      <p>Price: {priceFormat.format(Number(price))}</p>
    </li>
  );
};

export default Car;
```

**`src/components/AddCarForm.jsx`: the "Add car" form.**

```jsx
import { useState } from "react";

const emptyForm = { make: "", model: "", year: "", price: "" };

const AddCarForm = ({ onAdded }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          make: form.make,
          model: form.model,
          year: Number(form.year),
          price: Number(form.price),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed: ${res.status}`);
      }

      onAdded(await res.json()); // the API returns the created car
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="make" placeholder="Make" value={form.make} onChange={handleChange} required />
      <input name="model" placeholder="Model" value={form.model} onChange={handleChange} required />
      <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleChange} required />
      <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Add car"}
      </button>
      {error && <p role="alert">Could not add the car: {error}</p>}
    </form>
  );
};

export default AddCarForm;
```

**`src/App.jsx`: loading state, error state, leading slash, and the form wired in.**

```jsx
import { useEffect, useState } from "react";
import Car from "./components/Car";
import AddCarForm from "./components/AddCarForm";

const App = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/v1/cars") // leading slash: always from the site root
      .then((res) => {
        // fetch only rejects on network failure, so check the status yourself
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setCars(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCarAdded = (car) => setCars((current) => [...current, car]);

  return (
    <div>
      <h1>Welcome so Car Store</h1>

      <AddCarForm onAdded={handleCarAdded} />

      {loading && <p>Loading cars...</p>}
      {error && <p role="alert">Could not load cars: {error}</p>}

      <ul>
        {cars.map((car) => (
          <Car key={car.id} {...car} />
        ))}
      </ul>
    </div>
  );
};

export default App;
```

Points to make:

- **`fetch` does not reject on a 404 or 500.** It only rejects when the network fails. That is why the code checks `res.ok` and throws by hand. Participants who skip it get a worse failure: the error body (`{ "error": "..." }`) is an object, `setCars` stores it, and the page crashes on `cars.map is not a function`.
- **`finally` clears `loading`** whether the request worked or failed, so the loading message cannot get stuck.
- **Appending the returned car** (`setCars((current) => [...current, car])`) avoids a second request. The API's `201` response is the full row, including the database `id` and `createdAt`. The functional form `(current) => ...` is the safe way to update state from its previous value.
- **`e.preventDefault()`** is needed because a form submit reloads the page by default.
- **`Number(form.year)` and `Number(form.price)`** convert the text inputs before sending, because input values are always strings and the API stores `year` as an integer.
- **To show the error states:** stop the backend and reload the page, then look for the "Could not load cars" message. With the backend still stopped, submit the form to see "Could not add the car".
- **How these were checked.** ESLint exits with `0`, and `vite build` completes. No browser run was done here, so do one quick pass yourself before class: add a car in the form, then reload.

### D.5 Homework

Short answers. These are small snippets; they were not run.

- **Return `price` as a number from the API.** In `03_postgresql/server.js`, convert in the handler. For the list route: `res.json(allCars.map((car) => ({ ...car, price: Number(car.price) })));`. Trade-off to discuss: the client no longer has to convert, but anything above about 15 significant digits loses precision as a JavaScript number, and a `numeric` is a string precisely to avoid that. For prices at 2 decimals this is safe. For money that gets summed or multiplied, keep it as a string, or store whole cents in an `integer` column.
- **Edit and delete buttons.** Delete calls the `DELETE` route and then removes the car from state. Edit is the same form as "Add car", pre-filled, sending `PUT` with only the changed fields. Both use the routes finished in D.3.

  ```jsx
  const handleDelete = async (id) => {
    const res = await fetch(`/api/v1/cars/${id}`, { method: "DELETE" });
    if (res.ok) setCars((current) => current.filter((c) => c.id !== id));
  };
  ```
- **A small 404 helper.** One function removes the repeated line in every route: `const notFound = (res) => res.status(404).json({ error: "Car not found" });`, then `if (!car) return notFound(res);`.

## Appendix E: Participant exercises with instructor hints

One **card** per exercise. Each card has two halves:

- The **quoted block** is for participants. Copy it onto a slide or into a handout. It never contains the answer.
- Everything under it is for you: three hints to give in order, the mistakes people really make (with the exact error they will see), what to do if time runs out, and a link to the answer.

How to run a card:

1. Read the quoted task aloud. Give the time shown.
2. Walk the room. Do not answer the first "it doesn't work". Ask them to read the error aloud, then use hint 1.
3. Wait a minute before each next hint. Hint 3 shows the shape of the answer, not the code.
4. At the time limit, show the answer from Appendix D, even if some people are not done. Move on.

Every "Done when" line was checked: the HTTP and SQL results were produced by running the answer code against local servers and a throwaway database, and the Block 0 outputs by running the answers with Node 26. The Block 4 cards describe what to see in the browser. Those answers were linted and built but not clicked through, so run them once yourself before class.

### E.0 Block 0: ES6+ primer

Starting point for every card in this section: the `es6-primer` folder from Block 0, with `package.json` set to `{"type":"module"}`. About 30 minutes of cards in total, spread across the topics. Answers: [Appendix D.0](#d0-block-0-es6-primer).

#### E0.1 Types and decimals (3 min)

> **Task.** Predict what these three lines print, then run them: `typeof null`, `typeof []` and `0.1 + 0.2 === 0.3`. Then write a function `nearlyEqual(a, b)` that gives `true` for `0.1 + 0.2` and `0.3`.
>
> **Starting point.** A new file `e1-types.js`.
>
> **Done when.** The first line prints `object object false`, and `nearlyEqual(0.1 + 0.2, 0.3)` prints `true`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Which of the three did you get wrong? Why might `typeof null` say `object`?
2. **Point to:** Block 0 topic 1. Decimals are stored in binary, so `0.1` and `0.2` are not exact. Ask how big `0.1 + 0.2 - 0.3` is.
3. **Almost there:** Take the absolute value of the difference and compare it with a very small number. JavaScript has one built in, `Number.EPSILON`.

**Watch for.** People try `.toFixed(2)`. It returns a **string**, so `(0.1 + 0.2).toFixed(2) === 0.3` is still `false`.

**If it runs long.** Skip the function and just discuss why `0.1 + 0.2` is not `0.3`. That is the part that matters (it is why Postgres has `numeric`).

**Answer.** [Appendix D.0](#d0-block-0-es6-primer)

#### E0.2 Arrow function with a default (4 min)

> **Task.** This function sets its default by hand. Rewrite it as an arrow function that uses a default parameter. It must give the same results.
>
> ```js
> function price(amount, currency) {
>   currency = currency || "USD";
>   return amount + " " + currency;
> }
> ```
>
>
> **Starting point.** A new file `e2-arrow-default.js`.
>
> **Done when.** `price(100)` gives `100 USD` and `price(100, "IDR")` gives `100 IDR`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** What does `currency || "USD"` do when `currency` is an empty string?
2. **Point to:** Block 0 topic 3: a default can sit in the parameter list. Topic 2 for the arrow.
3. **Almost there:** The parameter list becomes `(amount, currency = ...)`, and the body can be a single template string.

**Watch for.** Leaving out the parentheses around two parameters (`amount, currency => ...`) gives `SyntaxError: Malformed arrow function parameter list`.

**If it runs long.** Hand over the arrow version and spend the minutes on the `||` versus default question.

**Answer.** [Appendix D.0](#d0-block-0-es6-primer)

#### E0.3 Change without mutating (5 min)

> **Task.** You have `const car = { id: 1, make: "Tesla", price: 25000 }`.
>
> (a) Make `updated`, a copy of `car` with `price: 26000`. `car` must stay unchanged.
> (b) Using destructuring, take `id` out of `car` and keep the other fields together in a variable `rest`.
>
> **Starting point.** A new file `e3-destructure-spread.js`.
>
> **Done when.** `rest` prints as `{ make: 'Tesla', price: 25000 }`, `updated.price` is `26000` and `car.price` is still `25000`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** After `car.price = 26000`, what is inside `car`? What do you want instead?
2. **Point to:** Block 0 topic 5 (spread copies) and topic 4 (the rest pattern inside destructuring braces).
3. **Almost there:** Spread `car` into a new object literal and write the changed key after it. For `rest`, put `...rest` last inside the braces next to `id`.

**Watch for.** Writing the changed key **first**, `{ price: 26000, ...car }`, gives `price: 25000`, because the later key wins. Editing `car.price` directly changes the original.

**If it runs long.** Do only (a). It is the one React needs in Block 4.

**Answer.** [Appendix D.0](#d0-block-0-es6-primer)

#### E0.4 Count with a Map, unique with a Set (5 min)

> **Task.** Given the three cars below, (a) count how many cars there are per make, and (b) list the different years, smallest first.
>
> ```js
> const cars = [
>   { make: "Tesla", year: 2023 },
>   { make: "Ford", year: 2021 },
>   { make: "Tesla", year: 2021 },
> ];
> ```
>
>
> **Starting point.** A new file `e4-map-set.js`.
>
> **Done when.** (a) prints `Map(2) { 'Tesla' => 2, 'Ford' => 1 }` and (b) prints `[ 2021, 2023 ]`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** For the count, what should the key be and what should the value be?
2. **Point to:** Block 0 topic 7: `has`, `get` and `set`. Topic 9 shows `??`, which gives a starting value of 0.
3. **Almost there:** Loop with `for...of`. For each car, read the current count (0 if there is none), add one, and set it back. For the years, build a `Set` from the years, turn it into an array and sort it.

**Watch for.** `.sort()` with no argument sorts numbers as text: `[100, 20, 3].sort()` gives `[ 100, 20, 3 ]`. Years happen to work. Pass `(a, b) => a - b` as the habit.

**If it runs long.** Do (a) only. It is the same job as SQL `GROUP BY`, which comes in Block 3a.

**Answer.** [Appendix D.0](#d0-block-0-es6-primer)

#### E0.5 Safe lookup (3 min)

> **Task.** Given the users below, make a list with each user's city. If a user has no address, use the text `unknown`.
>
> ```js
> const users = [{ name: "Ada", address: { city: "Jakarta" } }, { name: "Lin" }];
> ```
>
>
> **Starting point.** A new file `e5-optional.js`.
>
> **Done when.** The list prints as `[ 'Jakarta', 'unknown' ]`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** What happens if you write `u.address.city` for Lin?
2. **Point to:** Block 0 topic 9: `?.` and `??`.
3. **Almost there:** Read `address` with `?.` and chain `city`, then supply the fallback with `??`.

**Watch for.** `u.address.city` for Lin throws `TypeError: Cannot read properties of undefined (reading 'city')`. People reach for `||`, which works here. Ask what would break if a value were `0`.

**If it runs long.** Skip it. Topic 9's own snippet covers the same ground.

**Answer.** [Appendix D.0](#d0-block-0-es6-primer)

#### E0.6 A class with a private field (5 min)

> **Task.** Write a `Counter` class. It keeps a count that code outside the class cannot read or change directly. `increment()` adds one and can be chained. A `value` getter returns the count.
>
> **Starting point.** A new file `e6-class.js`.
>
> **Done when.** `new Counter().increment().increment().value` gives `2`, and reading `.count` on the counter gives `undefined`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Who should be allowed to change the count? Who should only be able to read it?
2. **Point to:** Block 0 topic 10: a field that starts with `#`, and `get`.
3. **Almost there:** Declare the private field at the top of the class body. `increment()` adds one and returns the object itself. `get value()` returns the field.

**Watch for.** Using `this.#count` without declaring `#count = 0;` in the class body gives `SyntaxError: Private field '#count' must be declared in an enclosing class`. Forgetting to return the object breaks the chain with `TypeError: Cannot read properties of undefined (reading 'increment')`.

**If it runs long.** Show the finished class from topic 10 and move on.

**Answer.** [Appendix D.0](#d0-block-0-es6-primer)

#### E0.7 From promise chain to async/await (5 min)

> **Task.** Rewrite the chain below using `async`/`await` with `try`, `catch` and `finally`. It must behave the same, including when the request fails.
>
> ```js
> const fetchCars = (fail = false) =>
>   new Promise((resolve, reject) =>
>     setTimeout(() => (fail ? reject(new Error("network down")) : resolve([{ id: 1 }])), 10),
>   );
>
> fetchCars()
>   .then((cars) => console.log("then:", cars.length))
>   .catch((err) => console.log("then failed:", err.message))
>   .finally(() => console.log("then done"));
> ```
>
>
> **Starting point.** A new file `e7-async.js`.
>
> **Done when.** Called normally, your version prints `await: 1` then `await done`. Called with `fail` set to `true`, it prints `await failed: network down` then `await done`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** What does `await` give you that the `.then` callback's parameter gave you?
2. **Point to:** Block 0 topic 13: where do `.catch` and `.finally` go in `try`/`catch`/`finally`?
3. **Almost there:** Put everything in an `async` function. The `await` line and the `console.log` go in `try`. `catch` replaces `.catch`, and `finally` replaces `.finally`.

**Watch for.** Forgetting `await` gives `await: undefined`, because the variable holds a promise and `cars.length` is `undefined`. Using `await` in a plain function is a `SyntaxError`.

**If it runs long.** Show the answer. The point is to see the same logic written flat.

**Answer.** [Appendix D.0](#d0-block-0-es6-primer)

#### E0.8 Mini-challenge: report() (8 min, in pairs)

> **Task.** Build a small report from fake API data. `data.js` is given in the Block 0 mini-challenge slide. Write `report.js` with a default-exported `async` function `report(minPrice = 0)` that returns `{ lines, owners, makes }`: one line per make like `"Tesla: Model S, Model 3"`, the owner name of each car or `"no owner"`, and the number of different makes. Then write `main.js` that prints `report(30000)` and `report()`.
>
> **Starting point.** A folder with `package.json` set to `{"type":"module"}` and the given `data.js`.
>
> **Done when.** `node main.js` prints:
>
> ```text
> [ 'Ford: F-150', 'Tesla: Model 3' ]
> [ 'no owner', 'Lin' ]
> 2
> [ 'Tesla: Model S, Model 3', 'Ford: F-150' ] [ 'Ada', 'no owner', 'Lin' ] 2
> ```

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Split it into steps: get the data, keep what matches, group, shape the result. Which Block 0 topic helps each step?
2. **Point to:** `Map` for grouping, `?.` with `??` for the owner, `Set` for different makes, a default parameter for `minPrice`.
3. **Almost there:** `report` waits for `fetchCars()`, filters with a destructured arrow function, groups into a `Map` (`get(make) ?? []`), then builds `lines`, `owners` and `makes`.

**Watch for.** A missing `await` before `fetchCars()` gives `TypeError: fetchCars(...).filter is not a function`. Importing a default export with braces (`import { report } from ...`) gives `SyntaxError: The requested module './report.js' does not provide an export named 'report'`. A missing `"type": "module"` stops `import` and top-level `await`.

**If it runs long.** At minute 6, show the answer and walk through it line by line with the room.

**Answer.** [Appendix D.0](#d0-block-0-es6-primer)

### E.1 Block 1: Node.js

Starting point: `01_nodejs/server.js` as written in the lesson. Answers: [Appendix D.1](#d1-block-1-raw-http-server).

#### E1.1 Routes by hand (20 min)

> **Task.** Change the server so that `GET /` still answers `You just built a server in Node.js!`, `GET /api/hello` answers with the JSON `{"message":"hi"}` and the right content type, and any other URL answers with status 404 and the text `Not found`. No packages.
>
> **Starting point.** `01_nodejs/server.js`. Remember to stop and restart `node server.js` after every change.
>
> **Done when.** `curl -i localhost:3000/api/hello` shows status `200`, the header `Content-Type: application/json` and the body `{"message":"hi"}`. `curl -i localhost:3000/nope` shows status `404` and the body `Not found`. `curl localhost:3000/` prints `You just built a server in Node.js!`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** What does `req.url` hold when you open `/api/hello`? How could you check?
2. **Point to:** Node `http` docs for `res.writeHead` and `res.end`. One `if` per URL.
3. **Almost there:** One `if` for `/`, one for `/api/hello` that sends `JSON.stringify(...)` with a JSON content type, and a final response for everything else.

**Watch for.** No `return` after the first `res.end(...)` makes the code fall through to the 404 lines, and Node crashes with `ERR_HTTP_HEADERS_SENT`. Passing an object straight to `res.end({ ... })` throws `ERR_INVALID_ARG_TYPE`: it needs a string. `01_nodejs` has no `--watch`, so an old server keeps answering until you restart it.

**If it runs long.** At minute 15 show only the 404 branch and let them finish the rest.

**Answer.** [Appendix D.1](#d1-block-1-raw-http-server)

#### E1.2 Stretch: read a JSON body (stretch)

> **Task.** Add `POST /api/hello`. The client sends `{"name":"Ada"}` and gets back `{"message":"hi Ada"}`. If the body is not valid JSON, answer with status 400.
>
> **Starting point.** Your server from E1.1.
>
> **Done when.** `curl -X POST localhost:3000/api/hello -d '{"name":"Ada"}'` prints `{"message":"hi Ada"}`. `curl -X POST localhost:3000/api/hello -d 'nope'` answers `400` with `{"error":"Invalid JSON"}`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** The body of a request is not a value you can read from `req`. How does Node hand over data that arrives in pieces?
2. **Point to:** Look for the `data` and `end` events on `req`.
3. **Almost there:** Collect the chunks into a string on `data`. Parse it on `end`. Wrap the parse in `try`/`catch` so bad input becomes a 400.

**Watch for.** `JSON.parse` throwing inside the `end` handler is not caught by anything, so the whole server process crashes with `SyntaxError: Unexpected token`. Answering inside `data` instead of `end` replies before the body is complete.

**If it runs long.** Skip it for anyone behind. Its job is to show why Express exists.

**Answer.** [Appendix D.1](#d1-block-1-raw-http-server)

### E.2 Block 2: Express

Starting point: `02_expressjs/server.js` after step 7 of the lesson (the GET routes and the `cars` array). Use `curl` with the JSON header on every request that sends a body. Answers: [Appendix D.2](#d2-block-2-express-api).

#### E2.1 POST, PUT and DELETE (15 min)

> **Task.** Only the GET routes work. Add `POST /api/v1/cars`, `PUT /api/v1/cars/:id` and `DELETE /api/v1/cars/:id`. POST needs `make`, `model`, `year` and `price` and answers 400 if one is missing. PUT changes only the fields that were sent. A missing id answers 404.
>
> **Starting point.** `02_expressjs/server.js` with three cars.
>
> **Done when.** With the three starting cars:
>
> - `curl -X POST localhost:3000/api/v1/cars -H 'content-type: application/json' -d '{"make":"BMW","model":"4 Series","year":2020,"price":15000}'` answers `201` with `{"id":4,"make":"BMW","model":"4 Series","year":2020,"price":15000}`.
> - `curl -X PUT localhost:3000/api/v1/cars/2 -H 'content-type: application/json' -d '{"price":26000}'` answers `200` with `{"id":2,"make":"Tesla","model":"Model S","year":2023,"price":26000}`.
> - `curl -X DELETE localhost:3000/api/v1/cars/1` answers `200`.
> - `PUT` or `DELETE` with an id that does not exist answers `404` with `{"error":"Car not found"}`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Which of the three needs `req.body`? Which need `req.params.id`?
2. **Point to:** Block 2 steps 3 and 8, and Block 0 topic 4 for pulling the fields out of the body.
3. **Almost there:** POST: take the fields out of the body, check them, build a new object, push it, answer 201. PUT: find the index, 404 if it is `-1`, change only the given fields. DELETE: find the index, 404 if `-1`, remove it.

**Watch for.** Without `app.use(express.json())`, or without the `content-type: application/json` header in the request, `req.body` is `undefined` and the answer is `500` with `Cannot destructure property 'make' of 'req.body' as it is undefined.` Ids from the URL are strings: compare after `parseInt`, or a car that exists answers 404.

**If it runs long.** At minute 10, show the POST route and let them do PUT and DELETE, which follow the same pattern.

**Answer.** [Appendix D.2](#d2-block-2-express-api)

#### E2.2 Filter by make (8 min)

> **Task.** Make `GET /api/v1/cars?make=tesla` return only the Tesla cars. Letter case must not matter. With no query string it returns every car as before.
>
> **Starting point.** Your `GET /cars` route.
>
> **Done when.** `curl 'localhost:3000/api/v1/cars?make=tesla'` prints `[{"id":2,"make":"Tesla","model":"Model S","year":2023,"price":25000}]`. `curl 'localhost:3000/api/v1/cars?make=nobody'` prints `[]`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Where does the `?make=tesla` part of the URL end up in the request?
2. **Point to:** Express docs for `req.query`, and `toLowerCase()` for the case.
3. **Almost there:** Inside the existing `GET /cars` route: if `make` is a text value, return the cars whose lowercase make equals the lowercase query. Otherwise return all.

**Watch for.** `?make=a&make=b` makes `req.query.make` an **array**, and an array has no `.toLowerCase()`. Check `typeof make === "string"` first. Adding a new route such as `/cars/filter` misses the point: the URL the client calls is `/cars`.

**If it runs long.** Give them hint 3 early. It is a few lines.

**Answer.** [Appendix D.2](#d2-block-2-express-api)

#### E2.3 Validate year and price (8 min)

> **Task.** `POST` must reject a `year` that is not a whole number between 1900 and this year, and a `price` that is not above 0. Answer 400 with a message that says what is wrong. Nothing is added to the list.
>
> **Starting point.** Your `POST /cars` route.
>
> **Done when.** A POST with `"year":1800`, a POST with `"year":"abc"` and a POST with `"price":-3` each answer `400`. For example, the first answers `{"error":"year must be a whole number between 1900 and 2026"}` (the message wording is yours) and `GET /api/v1/cars` still shows the same cars.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** What does `parseInt("abc")` give? How can you test for that?
2. **Point to:** `Number.isInteger`, `Number.isFinite`, and `new Date().getFullYear()` for the upper limit.
3. **Almost there:** After the existing missing-field check, convert `year` and `price`, test both, and return 400 **before** the `push`.

**Watch for.** The existing check `!year` does not catch `"abc"`: it is a non-empty string, so it passes. `parseInt("2020abc")` is `2020`, so it is lenient. Make sure the return happens before `cars.push(...)`.

**If it runs long.** Do the `year` check only.

**Answer.** [Appendix D.2](#d2-block-2-express-api)

#### E2.4 Find the bug (8 min)

> **Task.** Restart the server. Delete car 1. Add a new car. Then ask for all the cars and look at the ids. Something is wrong. Find it and fix it in the code.
>
> **Starting point.** Your server with the POST route from E2.1.
>
> **Done when.** Before the fix the ids are `2, 3, 3` (two cars share an id). After the fix they are `2, 3, 4`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Two cars have the same id. Where does the new id come from?
2. **Point to:** Look at how `nextId` is computed. How many cars are left after a delete? Is that number free?
3. **Almost there:** Base the new id on the **largest** id in use, plus one. Think about what the largest id is when the list is empty.

**Watch for.** `Math.max(...[])` is `-Infinity`: handle the empty list. Using `cars[cars.length - 1].id + 1` only works while the list stays in order.

**If it runs long.** Tell them the cause after minute 5 and let them write the fix. Then link it to Block 3: a database `serial` never reuses a number.

**Answer.** [Appendix D.2](#d2-block-2-express-api)

### E.3a Block 3a: SQL practice

This replaces the second half of the SQL lab (lab 15 minutes, practice 10). Everyone first runs the setup below in `psql` (`docker compose exec db psql -U postgres -d cars`). It creates a table of five cars. Answers: [Appendix D.3a](#d3a-block-3a-sql-practice).

> **Setup (run once).**
>
> ```sql
> CREATE TABLE cars_scratch (
>   id SERIAL PRIMARY KEY,
>   make VARCHAR(100) NOT NULL,
>   model VARCHAR(100) NOT NULL,
>   year INTEGER NOT NULL,
>   price NUMERIC(10, 2) NOT NULL,
>   created_at TIMESTAMP DEFAULT NOW()
> );
>
> INSERT INTO cars_scratch (make, model, year, price) VALUES
>   ('BMW', '4 Series', 2022, 28000),
>   ('Ford', 'Mustang', 2021, 25000),
>   ('Tesla', 'Model 3', 2021, 30000),
>   ('Tesla', 'Model S', 2023, 45000),
>   ('Honda', 'Civic', 2020, 15000);
> ```
>
> The last line printed is `INSERT 0 5`.

#### E3a.1 Filter and sort (2 min)

> **Task.** Show `make`, `model`, `year` and `price` of every car from 2021 or newer, with the most expensive first.
>
> **Starting point.** The `cars_scratch` table from the setup.
>
> **Done when.** Four rows, in this order of `model`: Model S, Model 3, 4 Series, Mustang.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Which two keywords from the lab do you need: one to filter, one to sort?
2. **Point to:** `WHERE` with a comparison, then `ORDER BY ... DESC`. See the PostgreSQL `SELECT` page.
3. **Almost there:** `SELECT` the four columns `FROM cars_scratch`, then `WHERE year` at least 2021, then order by price descending.

**Watch for.** `ORDER BY` goes after `WHERE`. Writing `year > 2021` leaves out the 2021 cars.

**If it runs long.** Move on at 2 minutes.

**Answer.** [Appendix D.3a](#d3a-block-3a-sql-practice)

#### E3a.2 The two cheapest (2 min)

> **Task.** Show `make`, `model` and `price` of the two cheapest cars only.
>
> **Starting point.** The same table.
>
> **Done when.** Two rows: Civic, Mustang.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** How do you sort cheapest first? How do you stop after two rows?
2. **Point to:** `ORDER BY` and `LIMIT`, from the lab.
3. **Almost there:** Order by price ascending, then limit to 2.

**Watch for.** `LIMIT` without `ORDER BY` returns two arbitrary rows.

**If it runs long.** Move on at 2 minutes.

**Answer.** [Appendix D.3a](#d3a-block-3a-sql-practice)

#### E3a.3 Raise the Tesla prices (3 min)

> **Task.** Raise the price of every Tesla by 1000. Look at the Teslas before and after to check.
>
> **Starting point.** The same table.
>
> **Done when.** The command answers `UPDATE 2`, and the two Teslas show `31000.00` and `46000.00` at the end.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Which statement changes existing rows? Which rows should it touch?
2. **Point to:** `UPDATE ... SET ... WHERE`. A column can be used on the right side: `price = price + ...`.
3. **Almost there:** `UPDATE cars_scratch SET price = ...` with a `WHERE` that matches only the make `'Tesla'`. Run a `SELECT` with the same `WHERE` first.

**Watch for.** Forgetting the `WHERE` raises **every** car. Run the `SELECT` with the same `WHERE` before any `UPDATE` or `DELETE`.

**If it runs long.** Move on at 3 minutes.

**Answer.** [Appendix D.3a](#d3a-block-3a-sql-practice)

#### E3a.4 Delete the old cars (2 min)

> **Task.** Delete the cars older than 2021. First look at which ones would go.
>
> **Starting point.** The same table.
>
> **Done when.** The preview shows one car, and the delete answers `DELETE 1`. A count afterwards shows `4` cars left.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Before deleting anything, how can you see exactly which rows would go?
2. **Point to:** A `SELECT` with the same `WHERE` as the `DELETE`. Then `DELETE FROM ... WHERE ...`.
3. **Almost there:** `WHERE year` is lower than 2021.

**Watch for.** `DELETE FROM cars_scratch;` with no `WHERE` empties the table. The same applies to Drizzle's `db.delete(cars)` in Block 3b.

**If it runs long.** Move on at 2 minutes.

**Answer.** [Appendix D.3a](#d3a-block-3a-sql-practice)

#### E3a.5 Stretch: cars per make (stretch)

> **Task.** Show how many cars there are for each make, the make with the most cars first.
>
> **Starting point.** The same table (after the delete).
>
> **Done when.** Three rows: Tesla 2, BMW 1, Ford 1.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** How would you count rows? How would you count them per make instead of in total?
2. **Point to:** `COUNT(*)` and `GROUP BY`.
3. **Almost there:** `SELECT make, COUNT(*) ... GROUP BY make`, ordered by the count, highest first.

**Watch for.** Selecting a column that is not in `GROUP BY` and not inside a function gives `must appear in the GROUP BY clause`. This is the SQL version of grouping with a `Map` in Block 0.

**If it runs long.** Skip it.

**Answer.** [Appendix D.3a](#d3a-block-3a-sql-practice)

### E.3 Block 3b: Drizzle routes

Starting point: `03_postgresql/server.js` as it is in the repo. `GET /api/v1/cars` and `POST` work. The other three routes still use the old array code. Make sure the database is up (`npm run db:up`) and create a car first so everyone has an id:

```bash
curl -X POST localhost:3000/api/v1/cars -H 'content-type: application/json' \
  -d '{"make":"Tesla","model":"Model 3","year":2023,"price":42000}'
```

It answers `201` with the new row, including its `id` (use that id below as `<id>`). Answers: [Appendix D.3](#d3-block-3b-drizzle-routes).

#### E3.1 Read one car (10 min)

> **Task.** `GET /api/v1/cars/<id>` still has the array code and fails. Rewrite it to read the car from Postgres. An id that does not exist answers 404. An id that is not a number answers 400.
>
> **Starting point.** `03_postgresql/server.js`. Today, `curl localhost:3000/api/v1/cars/<id>` answers `500` with `{"error":"Something went wrong!","message":"cars.find is not a function"}`.
>
> **Done when.** `curl localhost:3000/api/v1/cars/<id>` answers `200` with the car (note that `price` is a text like `"42000.00"`). `/cars/99999` answers `404` with `{"error":"Car not found"}`. `/cars/abc` answers `400` with `{"error":"Invalid id"}`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** What does `cars.find is not a function` tell you about what `cars` is now?
2. **Point to:** The mapping table in Block 3b: SQL `WHERE id = ...` becomes `.where(eq(cars.id, id))`, and `eq` is imported from `drizzle-orm`. Drizzle docs: Select and Operators.
3. **Almost there:** `await` the query, take the first row out of the array it returns, and answer 404 if there is none. Check for a number before querying.

**Watch for.** Without `await`, destructuring the result fails with `TypeError: object is not iterable (cannot read property Symbol(Symbol.iterator))`. Forgetting `import { eq } from "drizzle-orm"` gives `ReferenceError: eq is not defined`. `parseInt("abc")` is `NaN`: test it with `Number.isNaN`.

**If it runs long.** Show the GET answer at minute 7. PUT and DELETE are the same shape.

**Answer.** [Appendix D.3](#d3-block-3b-drizzle-routes)

#### E3.2 Update a car (10 min)

> **Task.** Rewrite `PUT /api/v1/cars/<id>` so it changes only the fields that were sent and answers with the updated car. An id that does not exist answers 404. A body with nothing to change answers 400.
>
> **Starting point.** Your GET route from E3.1. Today `PUT` answers `500` with `{"error":"Something went wrong!","message":"cars.findIndex is not a function"}`.
>
> **Done when.** `curl -X PUT localhost:3000/api/v1/cars/<id> -H 'content-type: application/json' -d '{"price":39999.5}'` answers `200` and the car shows `"price":"39999.50"`. `-d '{"make":"Tesla Inc","year":2024}'` changes only those two fields. `-d '{}'` answers `400` with `{"error":"Nothing to update"}`. An id that does not exist answers `404`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** In SQL, which statement changes a row? What did your Express PUT do to the array?
2. **Point to:** Drizzle: `update`, `set`, `where`, and `returning` to get the row back. Build the `set` object from only the fields that are present.
3. **Almost there:** Start with an empty object, add each field only if it was sent, stop with 400 if it is still empty, then run the `update`. Take the first row of the result.

**Watch for.** Drizzle throws `No values to set` for an empty `set({})`, which becomes a 500, so the empty body needs its own check. Without `.returning()`, the update **works** but returns nothing, so every PUT looks like a 404 even though the row changed.

**If it runs long.** Hand over the shape in hint 3 at minute 7.

**Answer.** [Appendix D.3](#d3-block-3b-drizzle-routes)

#### E3.3 Delete a car (10 min)

> **Task.** Rewrite `DELETE /api/v1/cars/<id>` so it deletes the car from Postgres and answers with the deleted car. An id that does not exist answers 404.
>
> **Starting point.** Your PUT route from E3.2. Today `DELETE` answers `500` with `{"error":"Something went wrong!","message":"cars.findIndex is not a function"}`.
>
> **Done when.** `curl -X DELETE localhost:3000/api/v1/cars/<id>` answers `200` with `{"message":"Car deleted successfully","car":{...}}`. The same call again answers `404` with `{"error":"Car not found"}`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** What is the one thing the SQL `DELETE` must never be missing?
2. **Point to:** `db.delete(cars)`, `where`, `returning`. Same pattern as the last two routes.
3. **Almost there:** Run the delete with the `where` and `returning`, take the first row, answer 404 if there is none, otherwise answer with the message and the row.

**Watch for.** `db.delete(cars)` with no `.where(...)` deletes **every** row in the table (the same warning as the SQL lab). Test with a car you created, not with data you need.

**If it runs long.** Skip it if time is short: it is the third copy of the same pattern.

**Answer.** [Appendix D.3](#d3-block-3b-drizzle-routes)

### E.4 Block 4: React

Starting point: `04_reactjs` with the backend running, and the proxy from the lesson in `vite.config.js`. Answers: [Appendix D.4](#d4-block-4-react).

The "Done when" lines here are things to see in the browser. The answers were linted and built but **not clicked through** while writing this guide, so try each one yourself first.

#### E4.1 Loading and error (8 min)

> **Task.** `App.jsx` shows an empty page while the cars load, and nothing at all if loading fails. Show `Loading cars...` while the request is running, and `Could not load cars: ` followed by the reason when it fails.
>
> **Starting point.** `src/App.jsx` with the `fetch` in `useEffect`.
>
> **Done when.** With the backend running you briefly see `Loading cars...`, then the list. With the backend stopped and the page reloaded, you see `Could not load cars: ...` and no list.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** What does the page do if the server answers with an error? Does `fetch` fail when that happens?
2. **Point to:** Block 0 topic 13: `fetch` only rejects when the network fails, so look at `res.ok`. You need two more pieces of state.
3. **Almost there:** State for `loading` (starts as true) and for `error` (starts as null). If `res.ok` is false, throw. `catch` stores the message. `finally` turns loading off.

**Watch for.** Without the `res.ok` check, an error answer such as `{ "error": "..." }` is stored as the cars, and the page crashes with `cars.map is not a function`. Component edits reload by themselves. Only `vite.config.js` needs a restart.

**If it runs long.** Hand over the answer from D.4 and talk through `finally`.

**Answer.** [Appendix D.4](#d4-block-4-react)

#### E4.2 Price as currency (4 min)

> **Task.** `Car.jsx` shows the price as text like `28000.00`. Show it as US dollars with a dollar sign and thousands separators: `$28,000.00`.
>
> **Starting point.** `src/components/Car.jsx`.
>
> **Done when.** A car with price `"28000.00"` shows `Price: $28,000.00`.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** What type is `price` when it reaches the component? How can you check?
2. **Point to:** The browser has a built-in number formatter. MDN: `Intl.NumberFormat`. Topic 1 explains why the price is a string.
3. **Almost there:** Create the formatter once, outside the component, with the `en-US` locale and the `currency` style. Call its `format` with the price converted to a number.

**Watch for.** Creating the formatter inside the component works but rebuilds it on every render. A missing price prints `$NaN`.

**If it runs long.** Skip it. It is a polish step.

**Answer.** [Appendix D.4](#d4-block-4-react)

#### E4.3 Add a car from the page (12 min)

> **Task.** Add a form with make, model, year and price. When it is submitted, send the car to the API. The new car must appear in the list without reloading the page. If the API refuses, show an error and keep what the user typed.
>
> **Starting point.** `App.jsx` listing cars from the API.
>
> **Done when.** Submitting `Ford`, `F-150`, `2025`, `50000` adds a car to the list. Reload the page and it is still there. With the backend stopped, submitting shows an error and the fields keep their text.

**Instructor hints** (give one at a time, a minute apart, and let them try again after each):

1. **Ask:** Where does the text the user types live while they type? What does a browser do when a form is submitted?
2. **Point to:** Block 0 topics 4, 5 and 13, and Block 4: controlled inputs with `useState`, stopping the default submit, and `fetch` with `method: "POST"` and a JSON header.
3. **Almost there:** Keep all four fields in one state object, and update one key on every change. On submit: send a POST, check `res.ok`, read the new car from the answer, and add it to the list with a state update that spreads the old list.

**Watch for.** Forgetting to stop the default submit reloads the page and the list resets. Missing `Content-Type: application/json` gives the same `req.body` error as in E2.1. Input values are always strings, so convert `year` and `price` with `Number(...)` before sending.

**If it runs long.** Give them the `AddCarForm.jsx` from D.4 and review it together instead.

**Answer.** [Appendix D.4](#d4-block-4-react)
