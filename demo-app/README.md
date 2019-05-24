# Peepeth Subgraph Demo App

Simple React app that consumes the subgraph's GraphQL API using Apollo client.

It displays a list of Peepeth accounts (users) on the left, allows you to filter those. When clicking on an account it shows account details on the right, including follwers and peeps.

## Run it locally

```sh-session
$ cd demo-app

# Install dependencies
$ yarn install

# Run it
$ yarn start
```

Open [http://localhost:3000](http://localhost:3000)

## Build it

```sh-session
$ yarn install
$ yarn build
```

Output gets generated in the `/build` folder.

## Code organization

- [src/index.ts](./src/index.ts) - Entrypoint
- [src/components](./src/components) - Presentational React components
- [src/containers](./src/containers) - Connected components (data fetching/state management, GraphQL queries)
