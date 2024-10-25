
# API Schema Generator

This npm package generates API endpoints and React hooks based on an OpenAPI schema, with TypeScript types for improved type safety and autocompletion. Built for use with `fetch`, it offers native, dependency-free HTTP requests.

## Features

- **API Endpoints**: Generates endpoint functions with `fetch` implementation, providing a simple way to integrate APIs with native JavaScript methods.
- **TypeScript Types**: Automatically generates TypeScript types for API requests and responses based on the OpenAPI schema.
- **React Hooks**: Optional generation of React hooks, simplifying data fetching with hooks tailored to each endpoint.

## Installation

Install the package via npm:

```bash
npm install openapi-fetch-gen
```

## Usage

To generate API endpoints, TypeScript types, and React hooks (optional), use the CLI command:

```bash
node dist/cli.js -s schema.json -o generated --hooks react
```

### Parameters

- `-s, --schema`: Path to the OpenAPI schema file (e.g., `schema.json`).
- `-o, --output`: Directory where the generated files will be saved.
- `--hooks`: Adds React hooks for each API endpoint (optional). Currently supports `react`.

### Example

```bash
node dist/cli.js -s ./openapi-schema.json -o ./src/api --hooks react
```

## Generated Files

- **TypeScript Types**: Strongly-typed request and response objects for each endpoint.
- **API Endpoints**: Functions using `fetch` to call each API endpoint.
- **React Hooks**: Optional React hooks for seamless API integration.

> **Tip**: Using TypeScript with this package enhances type safety and auto-completion, reducing errors and improving development speed.

## Project Vision

This package is designed to bring type safety and streamlined API integration to the TypeScript and React ecosystem by utilizing OpenAPI schemas and native `fetch` requests.

---

### NPM Description

> Generate TypeScript types, fetch-based API endpoints, and React hooks from OpenAPI schemas with a simple CLI. Build robust, type-safe API integrations in TypeScript with minimal dependencies.
