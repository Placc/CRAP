CRAPPI Project
==============

Setup
-----

Before you can build the project, you have to install the following applications:

- [Docker](https://www.docker.com/get-started)
- [Node 8.x](https://nodejs.org/en/download/)
- [yarn](https://yarnpkg.com/lang/en/docs/install)


If you are running Windows, you need a bash installed. I recommend to install
	
- [Git for Windows](https://gitforwindows.org/)

which ships with a fully functional bash.


Now, you can open a CLI of your choice and execute the following commands:

```
yarn global add typescript
yarn global add cwd
yarn global add tsc
yarn global add dotenv-cli
yarn global add serve

docker network create crappi-net
```

Components: Execution/Testing
-----------------------------

Each component (except the extension) has the same commands:

- `yarn build`: build the component
- `yarn start`: run the component (requires `yarn build`)
- `yarn test`: run the tests (requires `yarn build`)
- `yarn clean`: reset the database(s)

The commands for the extensions are:

- `yarn build`: build the extension dist
- `yarn test`: run the tests (requires `yarn build`)

Spec-App
--------

The example app starts a small script which behaves like a *Publisher*. This publisher wants to deploy a webapp (source code under /spec-app/webapp) and register an *Application Certificate* for it. After starting its local Publisher Server, building the webapp and executing the `deploy.js` script (under /publisher/src/scripts), he offers you some options to choose from: 

1. He can ask an *Auditor* to audit and create an *Audition Certificate* for the app
2. Or he can alter some critical resources (so that the password is sent in plain-text)


To **build** and **start** the example app, follow the pattern above:

- `yarn build`: Builds **ALL** required components
- `yarn start`: Runs all required components and launches the *Publisher* script
- `yarn clean`: Resets the databases of all participating components

*Caution*: Currently, you have to close the *Auditor* process by yourself (if you launched it).

Troubleshooting
---------------

I developed on Windows (poor me!), so here are some advices when you encounter problems:

- No access to `registry.yarnpkg.com:443`: Restart docker
- `FileNotFoundError [WinError 3]` in `docker-compose`: The path which is not found exists; it is just too long, so remove the `node_modules` directory specified in it
- When the connection to a database container fails (because of whatever): Restart docker; if this doesn't help, run `docker system prune`
- Any other `docker` or `docker-compose` error: Restart docker; if this doesn't help, run `docker system prune` (hopefully, this only happens on Windows all the time...)
- A container lost connection to its database (`server closed connection`): Run `yarn clean` for the affected component
- The build of the spec-app fails because `crappi-net has active endpoints`: Run `docker network inspect crappi-net` to find out the container names which still use it and `docker network disconnect crappi-net [container]` to remove them from the network; then, `yarn build` should work again
