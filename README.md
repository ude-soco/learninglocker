[![Learning Locker Logo](https://i.imgur.com/hP1yFKL.png)](http://learninglocker.net)
> An open source Learning Record Store (LRS) implementing the [xAPI](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md) ([Tin Can API](http://tincanapi.com/)).

*Learning Locker is copyright [Learning Pool](https://learningpool.com/)*

---

## Run with Docker (recommended)

The whole stack — UI, API, Worker, the xAPI service, plus **MongoDB** and
**Redis** — runs in containers via [`compose.yaml`](compose.yaml). You do **not**
need Node, MongoDB or Redis installed on your host.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker
  Engine + Compose v2). Allocate at least **4 GB** of memory to Docker for the
  first build.

### Start everything

From the repository root:

```bash
docker compose up -d --build
```

The first run builds the Learning Locker image (an older Node 10 stack, so the
initial build takes several minutes), then starts the full stack. On first boot
the stack automatically:

1. waits for MongoDB to be healthy,
2. runs the database migrations (`migrations` service), and
3. seeds a site admin (`seeds` service — see [Default credentials](#default-credentials)).

The `api` service only starts after migrations and seeding have completed
successfully.

Check status and logs:

```bash
docker compose ps
docker compose logs -f api ui
```

### Services and ports

| Service                | URL / Address                 | Notes                                  |
| ---------------------- | ----------------------------- | -------------------------------------- |
| Learning Locker **UI** | http://localhost:3000         | Web interface                          |
| Learning Locker **API**| http://localhost:8080         | Internal API (proxied by the UI)       |
| **xAPI** service       | http://localhost:8081         | LRS endpoint, e.g. `/data/xAPI/about`  |
| **MongoDB**            | `mongodb://localhost:27017`   | Database `learninglocker_v2`           |
| **Redis**              | `redis://localhost:6379`      | Used for queues / caching              |

> Inside the Docker network the apps reach Mongo on `mongo:27017` and Redis on
> `redis:6379` (the service names in `compose.yaml`).

### Default credentials

The bootstrap site admin is seeded on first boot:

| Field        | Value             |
| ------------ | ----------------- |
| Email        | `admin@mail.com`  |
| Password     | `1234qweR`        |
| Organisation | `soco`            |

These are defined in [`compose.yaml`](compose.yaml) under the shared
`x-common.environment` block (`LL_ADMIN_EMAIL` / `LL_ADMIN_PASSWORD` /
`LL_ADMIN_ORG`). Change them there **before the first `up`**, or reset the data
(see below) to re-seed.

> ⚠️ The default password and the placeholder `APP_SECRET`
> (`i-am-not-secure-please-change-me`) in `compose.yaml` are fine for local
> development only. Change both before exposing this anywhere.

### Connect the xAPI service

After logging in to the UI:

1. Select the **`soco`** organisation.
2. Open **Settings → Stores** and add a new store (the defaults are fine).
3. Open the **Clients** tab → **New xAPI store client**.
4. Use that client's **Basic Auth** credentials to send xAPI statements to the
   xAPI service at `http://localhost:8081`.

### Common commands

```bash
docker compose up -d              # start (after images are built)
docker compose up -d --build      # rebuild image and start
docker compose ps                 # container status
docker compose logs -f <service>  # follow logs (ui | api | worker | xapi-service | mongo | redis)
docker compose restart            # restart containers (keeps data)
docker compose down               # stop and remove containers (KEEPS data volumes)
docker compose down -v            # stop and DELETE all data volumes (resets the DB + re-seeds admin)
```

### Development stack

For local development use [`compose.dev.yaml`](compose.dev.yaml). It is a
self-contained stack that runs in `development` mode and **publishes MongoDB on
`27018`** (instead of the default `27017`) so it doesn't clash with any other
Mongo already running on the host:

```bash
docker compose -f compose.dev.yaml up -d --build   # build & start
docker compose -f compose.dev.yaml up --watch       # live-reload on source changes
docker compose -f compose.dev.yaml logs -f api ui
docker compose -f compose.dev.yaml down             # stop (keeps data volumes)
```

Dev host ports: UI `3000`, API `8080`, xAPI `8081`, **Mongo `27018`**, Redis
`6379`. The `develop.watch` rules rebuild the affected service when you edit
`ui/`, `api/`, `worker/`, `cli/`, `lib/`, `package.json`, or the `Dockerfile`.

### Resetting the database / admin

Data lives in named Docker volumes (`mongo`, `redis`, `xapi-service`), so it
survives `down`/`up`. To wipe everything and start fresh (re-runs migrations and
re-seeds the admin):

```bash
docker compose down -v
docker compose up -d --build
```

---

## Optional: Task runner & Tilt

A [`Taskfile.yaml`](Taskfile.yaml) wraps the common Compose commands via
[Task](https://taskfile.dev/):

```bash
task docker:build     # docker compose build
task docker:up        # docker compose up
task docker:watch     # docker compose up --watch
task docker:down      # docker compose down
task docker:clean     # docker compose down --volumes
task docker:cli       # open a shell in the cli container
```

A [`Tiltfile`](Tiltfile) is also provided for use with
[Tilt](https://tilt.dev/) (`tilt up`), which drives the same `compose.yaml`.

---

## Documentation

See the upstream [documentation](http://docs.learninglocker.net) for
configuration and usage details. Note that this fork uses **Redis** for queues
and **local** file storage, and the disabled Google Cloud / pkgcloud providers
have been removed.
