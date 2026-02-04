# Dev Skill Checker

A lightweight full-stack app that lets developers assess their skills by answering short coding questions and getting instant feedback.

## Run locally

```bash
node server.js
```

Then open `http://localhost:3000`.

## Deploy

This app can be deployed on any Node-compatible host. A `render.yaml` blueprint is included for quick deployment on Render.

1. Create a new Render **Blueprint** and point it at this repository.
2. Render will provision the service and provide a public URL.
3. Add the deployed URL to the repository bio.

If you use another host (Railway, Fly.io, etc.), configure the start command as:

```bash
node server.js
```
