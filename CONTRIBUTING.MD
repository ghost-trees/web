# Code Contribution

## Prerequisites

- Node.js

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/ghost-trees/web.git
    cd web
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

## Development

To start local development server:

    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

## Checks

Check for regression, format, lint, and build.

Checks can be performed with a single script.

```bash
npm run check
```

Individual checks can also be performed.

- Regression test(s)

  ```bash
  npm run test:run
  ```

- Format

  ```bash
  npm run format:check
  ```

  Format errors might automatically be fixed with

  ```bash
  npm run format:fix
  ```

- Lint

  ```bash
  npm run lint:check
  ```

  Lint errors might automatically be fixed with

  ```bash
  npm run lint:fix
  ```

- Build
  ```bash
  npm run build
  ```

## Documentation

Documentation live in the [`docs/`](/docs/) directory.