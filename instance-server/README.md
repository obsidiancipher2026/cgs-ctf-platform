# CGS CTF Instance Server

Standalone server that manages Docker-based challenge instances for the CGS CTF platform.

## Quick Start (Docker Compose)

```bash
# From the project root
docker-compose up -d
```

This starts:
- **Instance Server** on port `3100` — manages container lifecycle
- **Nginx Proxy** on port `8080` — routes traffic to instances

## Quick Start (Manual)

```bash
cd instance-server
npm install
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `INSTANCE_PORT` | `3100` | Port for the instance server |
| `BASE_DOMAIN` | `localhost` | Domain for instance URLs |
| `INSTANCE_PREFIX` | `ctf` | URL prefix for instances |
| `INSTANCE_TTL` | `1800` | Default TTL in seconds (30 min) |
| `MAX_INSTANCES` | `3` | Max concurrent instances per user |
| `DOCKER_SOCKET` | `/var/run/docker.sock` | Docker socket path |
| `CHALLENGE_SITES_DIR` | `../../challenge-sites` | Path to static challenge files |

## How It Works

1. User clicks "Open Instance" on a challenge
2. Frontend calls `POST /api/challenges/[slug]/launch`
3. Launch route calls the instance server at `POST /api/instances/launch`
4. Instance server either:
   - Spawns a Docker container (if `dockerImage` is set)
   - Serves static files from `challenge-sites/` (for pre-built challenges)
   - Returns a static `instanceUrl` (for pre-deployed challenges)
5. User gets a URL to access their personal instance
6. Instance auto-expires after TTL

## Adding Docker Challenges

1. Build a Docker image for your challenge:
   ```bash
   docker build -t ctf-challenge-cookie-jar .
   ```

2. In the admin panel, edit the challenge and set:
   - **Docker Image**: `ctf-challenge-cookie-jar`
   - **Instance Type**: `web`
   - **Instance TTL**: `1800` (seconds)

3. The instance server will spawn a container per user when they click "Open Instance"

## Adding Static Challenges

1. Place challenge files in `challenge-sites/<challenge-id>/`:
   ```
   challenge-sites/
   ├── 6/
   │   ├── index.html
   │   └── styles.css
   ├── 7/
   │   ├── index.html
   │   └── login/
   │       └── dashboard.html
   ```

2. The instance server will serve these files at `/api/instances/site/<challenge-id>/`

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/instances/health` | Health check |
| `POST` | `/api/instances/launch` | Launch a new instance |
| `GET` | `/api/instances/:id` | Get instance status |
| `POST` | `/api/instances/:id/destroy` | Destroy an instance |
| `GET` | `/api/instances/user/:userId` | List user's instances |
| `GET` | `/api/instances/site/:slug/*` | Serve static challenge files |
