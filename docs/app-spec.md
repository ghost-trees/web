# Application Architecture Specification (App Spec)

## Purpose

Visualize a time-series map and supporting chart(s) exploring illegal tree mortality across Atlant'a urban canopy.

## Features

The application should...
- Performantly present a map of Atlanta with tens of thousands of nodes representing locations where illegal activity occured
- Have map interactivity: zoom in/out, home button/location, pan/drag, scale
- Have filters for determining data points shown in the map and companion chart(s) features (e.g., tree types)
- Tool tips showing summary information of nodes in the map when individual node is selected
- Allow visually grouping data by time period (e.g., before covid, during covid, and after covid) or other column values (e.g., outstanding fees vs no outstanding fees, tree types)
- Selection of map features via multiclick and/or brushing
- Search bar (e.g., address look up)
- Be able to scroll through different months (time selection scroll bar)
- Display data point information and be able to hide/show specific column values

## Software Tools

- **ESLint**: Analyzes code to catch bugs, anti-patterns, and style issues early.
- **Git**: Tracks code changes locally with commits, branching, and history.
- **GitHub**: Hosts repository remotely for collaboration, pull requests, and CI/CD workflows.
- **JavaScript**: Provides runtime language foundation for web behavior and tooling.
- **MapLibre**: Renders interactive web maps with pan/zoom controls and custom layers.
- **Node**: Runs JavaScript outside the browser for local development and provides dependency management through npm.
- **Prettier**: Automatically formats code to keep style consistent across repository.
- **React**: Builds reusable UI components and manages client-side rendering.
- **Deck**: Provides high-performance geospatial layers and interactions for large datasets.
- **Tailwind**: Supplies utility-first CSS classes for rapid, consistent UI styling.
- **Turf**: Supplies geospatial utility functions for filtering, selection, and analysis.
- **TypeScript**: Adds static typing on top of JavaScript for safer, clearer code.
- **Vite**: Provides fast dev server startup and optimized frontend production builds.
- **Vitest**: Runs code tests to ensure expected performance.
- **Zustand**: Offers lightweight global state management for React applications.

## Repository Structure

### Diagram

**Legend**

- [ ] Planned but not started
- [-] Started but will change
- [✓] Completed

```text
ghost-trees/web/
[✓] ├── .editorconfig         # Editor formatting configuration
[✓] ├── .gitattributes        # Git file handling configuration
[✓] ├── .gitignore            # Paths excluded from git
[✓] ├── .prettierignore       # Paths excluded from prettier
[✓] ├── CONTRIBUTING.MD       # Guidelines for contributing to application development
[✓] ├── LICENSE               # Project license terms
[✓] ├── README.md             # High-level project overview
[✓] ├── eslint.config.js      # Eslint rules and linting configuration
[✓] ├── index.html            # Html shell and application root mount point
[✓] ├── package-lock.json     # Exact dependency versions used (auto-generated)
[✓] ├── package.json          # Project metadata, scripts, and permissible dependency range
[✓] ├── tsconfig.app.json     # Typescript application configuration
[✓] ├── tsconfig.json         # Typescript configuration paths definition
[✓] ├── tsconfig.node.json    # Typescript development configuration
[✓] ├── vite.config.ts        # Vite build and dev server configuration
[✓] ├── dist/                 # Production build output (auto-generated)
[✓] ├── node_modules/         # Locally installed npm dependencies (auto-generated)
[✓] ├── .github/              # GitHub platform and automation configurations
[✓] │   └── workflows/        # GitHub Actions workflow definitions
[✓] │       └── ci.yml        # Continuous integration checks on pushes and pull requests
[✓] │       └── cd.yml        # Continuous deployment workflow for publishing application
[✓] ├── docs/                 # Repository documentation directory
[-] │   └── app_spec.md       # Application architecture specification doc (This file)
[✓] ├── public/               # Static files served directly by the application
[-] │   └── data.geojson      # Information visualized in application
[✓] │   └── atlanta.geojson   # Atlanta city limits shape
[-] │   └── logo.svg          # Application logo for favicon and web page
[✓] └── src/                  # Application source directory
[-]     ├── index.css         # Application visual styling defaults
[-]     ├── main.tsx          # Application entry point
[✓]     └── vite-env.d.ts     # Vite application support for TypeScript configuration
```

## Data Flow