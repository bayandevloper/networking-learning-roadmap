# Networking Learning Roadmap

Arabic (RTL) roadmap website for learning networking through hands-on, project-based lessons.

- 9 phases, 18 lessons, one applied project per lesson
- Free learning resources linked per lesson
- Progress tracking (localStorage) with per-phase and overall progress bars
- Built with Vite + TypeScript

Live site: https://cozy-otter-3ggd4.surething.host

## Stack
- `src/data.ts` — all content (phases, lessons, projects, resources, FAQs)
- `src/main.ts` — render logic + progress tracking
- `src/style.css` — styling
- `public/images/` — phase illustrations

## Run locally
```
bun install
bun run dev
```
