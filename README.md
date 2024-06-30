# The tweasel.org website

> Server for the tweasel.org platform, allowing users to analyse Android and iOS apps for data protection violations and send complaints about them to the data protection authorities.

Tweasel is a project building infrastructure for detecting and complaining about tracking and privacy violations in mobile apps on Android and iOS. The platform lies at the heart of the project, providing an accessible web interface for end users.

It uses [Astro](https://astro.build/) in SSR mode as the web framework and [EdgeDB](https://www.edgedb.com/) as the database. For our [integration tests](/cypress/README.md), we use [Cypress](https://www.cypress.io/).

Many of the specific functions of the platform have been intentionally built as [separate tools and libraries](https://docs.tweasel.org/) that can also be used indepentently. The platform server does not run the actual analyses itself. It instead delegates that to separate runners. This not only allows for more flexibility in deploying the platform, but also provides security isolation benefits. Currently, only [`analysis-runner-local`](https://github.com/tweaselORG/analysis-runner-local) is implemented, which runs the analyses on locally connected devices/emulators.

## Development

To run the project locally for development, follow these steps:

1. Install [Node.js](https://nodejs.org/en/download), [Yarn 1](https://classic.yarnpkg.com/en/docs/install) (Classic), and [EdgeDB](https://docs.edgedb.com/get-started/quickstart#installation) if you haven't done so already.
2. Clone the repo and run `yarn` in the root directory of the repo to fetch all required dependencies.
3. Run `edgedb project init` to set up the database. You can refer to the [EdgeDB documentation](https://docs.edgedb.com/get-started/quickstart#initialize-a-project) for more details.
4. You will need to set a few environment variables that are required for the server. You can do that by copying the file [`.env.sample`](/.env.sample) to `.env` and editing it accordingly. The variables set there will be automatically picked up by the server. Alternatively, you can also set them interactively in your terminal.

   A few notes on what you need to set:

   * `*_RUNNER_API_URL` and `*_RUNNER_TOKEN` configure the connection to the analysis runner described above. Check out the documentation of [`analysis-runner-local`](https://github.com/tweaselORG/analysis-runner-local) on how to set that up.
   
     Depending on what you want to work on, you may not need to set up a full analysis runner, which can be a little cumbersome and resource-intensive. As part of our test suite, we also have a mock analysis runner that accepts all analysis requests for any platform but never actually processes them. You can start it by running `yarn mock-analysis-runner`. It will listen on `http://localhost:3000` and accept any token.
   * `RATELIMIT_POINTS` configures the ratelimit, as the name implies. In production, this is set to 50 points. But unless you are working on ratelimiting, you probably want to set this much higher, lest you constantly hit the ratelimit during development. *Hint*: If you do, you can just restart the server to reset it.
5. Finally, run `yarn dev` to start the server in development mode. It will be available at [`http://localhost:4321`](http://localhost:4321) and automatically reload for any changes you make.

### Database schema changes

If you need to change the schema of the database, you will need to create a migration using EdgeDB.

During development, you will likely iteratively work towards the final schema changes and having to create a migration for each step is quite annoying. Additionally, we also prefer to not have those effectively useless migrations in the repository.

Luckily, EdgeDB has a solution for this. You can run `edgedb watch` while developing. This will automatically apply all schema changes to your local development database as you make them. Once you are done, run `edgedb migration create` and `edgedb migrate --dev-mode` to actually create and commit the migration. Check out the [EdgeDB docs on migrations](https://docs.edgedb.com/get-started/migrations) for more details.

## Contributing

First of all, thank you very much for your interest in contributing! Contributions are incredibly valuable for a project like ours.

We warmly welcome issues and pull requests through GitHub. You can also chat with us through Matrix, either through the [Tweasel room](https://matrix.to/#/#dade-tweasel:matrix.altpeter.me) or the [space](https://matrix.to/#/#datenanfragen:matrix.altpeter.me) for datarequests.org. Feel free to ask questions, pitch your ideas, or just talk with the community.

Please be aware that by contributing, you agree for your work to be released under the MIT license, as specified in the `LICENSE` file.

If you are interested in contributing to Tweasel and datarequests.org in other ways besides coding, we can also really use your help. Have a look at our [contribute page](https://www.datarequests.org/contribute) for more details.

## License

The code for this site is licensed under the MIT license. See the [`LICENSE`](LICENSE) file for details.
