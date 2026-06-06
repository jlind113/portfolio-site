# TESD-1640 Final Project Reference

## Project Overview
This project is a mobile trip-tracking application built with React Native and Expo. It allows authenticated users to create, view, and delete saved trips that include a custom title, camera image, and geolocation data with map support.

The app combines cloud-backed authentication and user profile storage with on-device trip persistence. Users can capture trip photos, select locations either from GPS or by tapping on an interactive map, and review trip details with address and map visualization.

## Primary Goals
- Build a full mobile app flow from sign up/login to authenticated content.
- Implement practical mobile-native capabilities (camera, location permissions, maps).
- Persist user-generated trip data locally using SQLite for reliable offline access.
- Practice scalable React patterns with reusable components, context state, and navigation stacks.

## Tech Stack
- Framework: React Native (0.81), React (19), Expo SDK 54
- Navigation: React Navigation (native stack + bottom tabs)
- Local database: Expo SQLite
- Authentication: Firebase Authentication REST API (Identity Toolkit)
- Cloud data: Firebase Realtime Database (user profile records)
- Maps and geocoding: react-native-maps + Google Maps Static/Geocoding APIs
- HTTP client: Axios
- Device APIs: Expo Image Picker, Expo Location, Expo Splash Screen, Expo Font

## Core Features
1. Authentication and gated navigation
- Sign up and login flows with credential validation.
- Auth state managed with React Context.
- Route protection: unauthenticated users see auth stack; authenticated users see app tabs/stacks.

2. Trip creation workflow
- Add a trip title.
- Capture an image with the device camera.
- Select location by either:
- Using current GPS location.
- Picking a point directly on an interactive map.
- Reverse geocode coordinates into a human-readable address.
- Save complete trip to SQLite.

3. Trip management and details
- List all saved trips in a scrollable card UI.
- Open a trip details screen with image, address, and actions.
- View trip location on map.
- Delete trips from local database.

4. UX and app polish
- Custom fonts loaded via splash-screen-controlled startup.
- Reusable UI components for buttons, inputs, loading overlays, and outlined actions.
- Consistent color system and screen theming across navigation and components.

## Data and Architecture Notes
- `AuthContext` manages token/email/authentication completion state.
- `UserContext` uses `useReducer` for profile form fields and validation flags.
- SQLite table schema (`trips`):
- `id` (PK, autoincrement)
- `title` (text)
- `imageUri` (text)
- `address` (text)
- `lat`, `lng` (real)
- Navigation architecture combines:
- Auth stack (`Login`, `Signup`)
- Bottom tabs for core app areas (`Your Trips`, `Add Trip`)
- Nested stacks for list/details/map and add/map flows

## What This Demonstrates
- End-to-end mobile app delivery with authentication, local persistence, and map/location integration.
- Confident use of asynchronous flows (API requests, permissions, DB ops) and error handling.
- Practical state management with React hooks, context providers, and reducer-driven validation.
- Component-based architecture and reusable UI patterns in a multi-screen React Native app.

## Resume-Ready Bullet Options
- Built an Expo/React Native trip management app with Firebase Auth, Google Maps integration, and SQLite persistence.
- Implemented camera capture and location workflows (GPS + map picker) with runtime permissions and reverse geocoding.
- Designed nested stack/tab navigation with authenticated route gating and reusable UI components.
- Developed local CRUD operations for trip records using Expo SQLite, including detail views and delete actions.
- Integrated Firebase Realtime Database for user profile storage during registration.

## Possible Future Improvements
- Store auth tokens securely (e.g., secure storage) and add session persistence across app restarts.
- Move API keys to environment-based configuration and secrets management.
- Add richer form validation and stronger error messaging for edge cases.
- Expand trip model with notes, dates, tags, and edit functionality.
- Add automated tests for reducers, form validation, and critical screen flows.
