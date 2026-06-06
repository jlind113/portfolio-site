# Super Beat Maker

## Project Summary
Super Beat Maker is a web app that turns beat production into a roguelike-style challenge system. Each "Room" represents creating a new track, and players roll randomized Mutations, Curses, and Track Types that constrain composition decisions. The app guides users through run setup, active room decisions, and room history while preserving progress between sessions.

## What I Built
- Designed and implemented a multi-page React application for an original music-production game system.
- Built run setup flow with configurable options (track type generation toggle, game mode, and player class).
- Implemented the core room gameplay loop: roll curse, roll mutation, roll track type, finalize room, then move to next room.
- Added a power-up mechanic with automatic point awards and spend logic.
- Created a room history UI with tooltip-based detail views for previously finalized rooms.
- Built reference pages for rules and full probability tables (mutations, curses, targets, power-ups, track types).

## Technical Highlights
- **Frontend:** React 19, TypeScript, Vite, React Router.
- **UI System:** shadcn/ui + Radix primitives, Tailwind CSS v4, custom neon/synthwave styling.
- **State Management:** Custom React Context (`RunContext`) for run lifecycle and gameplay state.
- **Persistence:** Local storage sync for active run continuation and end-run cleanup.
- **Game Logic:** d100-style randomization utilities mapped to large table datasets for deterministic rule-driven outcomes.

## Architecture and Data Flow
- Centralized run state model includes settings, current room, previous rooms, and power-up count.
- `startNewRun` initializes a fresh run object from selected setup options.
- `finalizeRoom` snapshots room decisions into history and advances room numbering.
- Reactive local storage synchronization keeps state durable and enables resume behavior.

## Resume-Ready Impact
- Demonstrates ability to turn a complex domain concept into a usable interactive product.
- Shows strength in TypeScript-based frontend architecture, state modeling, and UI composition.
- Highlights practical game-system implementation: probabilistic tables, flow control, and persistent session UX.
