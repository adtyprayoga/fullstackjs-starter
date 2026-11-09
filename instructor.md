# Instructor Guide: Node.js → Express → Postgres + Drizzle → React

One-day workshop (about 6.5 hours of room time) for developers who know basic JavaScript. Participants build a Car Store: a REST API backed by Postgres, and a React page that lists the cars.

Source material: the JS Mastery PERN crash course, https://youtu.be/ek7hmv5PVV8, **16:43 to 1:43:43**. `[mm:ss]` markers in this guide point to the moment in the video where each idea is taught, so you can replay a segment or check your own wording against it. Video times use the hour as the first number for anything past 59:59 (`1:07:30`).

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

1. Explain what Node is (and is not) and write a bare HTTP server.
2. Build a REST API in Express: routes, params, JSON bodies, status codes, routers, middleware.
3. Explain why in-memory data is not enough, and write basic SQL (create, insert, select, update, delete).
4. Define a table with Drizzle, generate and apply a migration, and query it from Express.
5. Fetch API data in React with `useState` and `useEffect`, render a list of components, and explain why a dev-server proxy is needed.

---

## 2. Schedule

| Time           | Block                                                                                     | Video ref          | Folder            |
| -------------- | ----------------------------------------------------------------------------------------- | ------------------ | ----------------- |
| 09:00 – 09:20 | Welcome, setup check                                                                      |                    | all               |
| 09:20 – 10:30 | **Block 1: Node.js** (concepts 25 min, live code 25 min, exercise 20 min)           | 16:43 – 23:30     | `01_nodejs`     |
| 10:30 – 10:45 | Break                                                                                     |                    |                   |
| 10:45 – 12:30 | **Block 2: Express** (concepts 20, live code 50, exercise 30)                       | 24:00 – 47:30     | `02_expressjs`  |
| 12:30 – 13:30 | Lunch                                                                                     |                    |                   |
| 13:30 – 14:15 | **Block 3a: Databases and SQL** (concepts 20, SQL lab 25)                           | 48:00 – 1:09:00   | psql in Docker    |
| 14:15 – 14:25 | Break                                                                                     |                    |                   |
| 14:25 – 15:40 | **Block 3b: Drizzle + Express + Postgres** (concepts 15, live code 30, exercise 30) | 1:09:00 – 1:27:00 | `03_postgresql` |
| 15:40 – 15:50 | Break                                                                                     |                    |                   |
| 15:50 – 16:45 | **Block 4: React** (live code 35, exercise 20)                                      | 1:27:00 – 1:43:43 | `04_reactjs`    |
| 16:45 – 17:00 | Final demo, wrap-up                                                                       |                    | all               |

The video itself covers this in 87 minutes. The extra time is for participants typing along, setup problems and exercises. If you run behind, shorten Block 3a (the SQL lab) first. Do not cut the Block 3b exercise or the Block 4 proxy explanation: those are the two places where this stack actually breaks for beginners.

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

> If someone sees `Cannot use import statement outside a module`: this folder needs `"type": "module"` in `package.json` (or the `.mjs` extension). You will see the same error again in Block 2 on purpose.

### Exercise (20 min)

Without installing anything, change the server so that:

1. `GET /` returns text as before.
2. `GET /api/hello` returns JSON `{ "message": "hi" }` with `Content-Type: application/json`.
3. Anything else returns status 404 and the text `Not found`.

Hint: branch on `req.url`. Do not give the answer away; the ugliness of the `if` chain is the lesson.

**Answer:** [Appendix D.1](#d1-block-1-raw-http-server).

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

   Run `npm run dev`. **Show the error on purpose**: if `"type": "module"` is missing you get `Cannot use import statement outside a module`. Fix it in `package.json`. `[31:00]`
3. **One route per verb.** Add stubs for `GET /api/v1/cars`, `POST`, `PUT /:id`, `DELETE /:id`, `GET /:id` that just `res.send(...)` a message. Explain that `:id` becomes `req.params.id`, and that params are **strings**. `[33:00 – 34:30]` Docs to open: [Routing guide](https://expressjs.com/en/guide/routing.html) (route parameters section).
4. **Notice the repetition, introduce the router.** `/api/v1` is repeated everywhere. Create `const router = express.Router()`, move the routes to `router.get("/cars", ...)`, and mount it once: `app.use("/api/v1", router)`. `[34:30 – 35:50]`
5. **Add the data.** An array at the top with three cars (Toyota Camry, Tesla Model S, Ford F-150). Call it "a sort of database. Not really. What is missing is persistence." `[36:00 – 37:00]`
6. **JSON bodies.** `app.use(express.json())`. Without it `req.body` is `undefined`. `[37:20]`
7. **GET all / GET one.** `res.json(cars)`. For one: `parseInt(req.params.id)`, `cars.find(...)`, return `404` with `{ error: "Car not found" }` if missing. `[38:00 – 39:50]`
8. **POST, PUT, DELETE.** The video leaves these as a challenge, so let the room try for 10 minutes, then show the solution. `[40:00 – 43:30]`
   - POST: read `make, model, year, price` from `req.body`, return `400` if one is missing, build a new object, `push`, return `201`.
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

**Answer:** [Appendix D.2](#d2-block-2-express-api). The same appendix has the full POST, PUT and DELETE reference solution for the step-8 challenge.

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

### Lab: SQL in `psql` (25 min)

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

> **Express 5 note.** If an `async` handler throws or a promise rejects, Express 5 forwards the error to the error-handling middleware by itself. In Express 4 you needed `try/catch` or a wrapper in every handler. Do not spend more than a minute on this.

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

**Answer:** [Appendix D.3](#d3-block-3b-drizzle-routes).

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

   The empty dependency array means "run once, after the component first appears". The first render has `cars = []`, then `setCars` triggers a second render with the data. Docs to open: [`useState`](https://react.dev/reference/react/useState) and [`useEffect`](https://react.dev/reference/react/useEffect).
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

**Answer:** [Appendix D.4](#d4-block-4-react).

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

Verified while writing this guide: the video's transcript window and timestamps, the contents of every file quoted above, and the live responses of `GET /api/v1/cars` (200) and of GET-by-id, PUT and DELETE (500, as described). Not verified: a clean-machine install from scratch, and the React page in a browser.

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

- **D.1 and D.2** ran on spare ports with `curl`.
- **D.3** ran against a throwaway Postgres database in the Docker container (created, migrated, tested, dropped), so no real data was touched.
- **D.4** passed ESLint (exit 0) and `vite build` in a fresh install. It was **not** clicked through in a browser.

Use these as the "model answer" after participants have tried. Several different solutions are fine as long as the status codes and behavior match.

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
