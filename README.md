# Nosocial API

Nosocial API is a revolutionary product that puts developers at the forefront by offering world-class API services to the general public. With its powerful features, Nosocial API takes developers' creativity to new heights and enables them to present unparalleled software applications based on Nosocial.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)
- [Contact](#contact)
- [Additional Information](#additional-information)

## Installation

```
git clone https://github.com/nosocialxyz/api.git
cd api
yarn
```

## Usage

```
yarn build && yarn start
```

## Project Structure
Here is the folder structure and short decriptions for some key contents.
```
├── LICENSE
├── README.md
├── VERSION
├── codegen.yaml
├── docker
│   ├── Dockerfile
│   ├── build.sh
│   └── docker-compose.yaml
├── docs
│   ├── Base API.md
│   └── Entities.md
├── package.json
├── src
│   ├── abis: Used for calling lens api
│   │   ├── lens-follow-nft-contract-abi.json
│   │   ├── lens-hub-contract-abi.json
│   │   └── lens-periphery-data-provider.json
│   ├── apollo-client.ts
│   ├── config.ts
│   ├── db: Basic db operator with mongo db
│   │   └── index.ts
│   ├── graphql: Used for calling lens api
│   │   ├── common.graphql
│   │   ├── explore-profiles.graphql
│   │   ├── explore-publications.graphql
│   │   ├── generated.ts
│   │   ├── get-profile.graphql
│   │   ├── get-profiles-show.graphql
│   │   ├── get-publication.graphql
│   │   └── get-publications.graphql
│   ├── main.ts
│   ├── services: Main logic of nosocial api
│   │   ├── db.ts
│   │   ├── index.ts
│   │   ├── lens-api.ts
│   │   └── utils.ts
│   ├── state.ts
│   ├── types: Type definitions
│   │   ├── context.d.ts
│   │   ├── database.d.ts
│   │   └── lens-api.d.ts
│   └── utils
│       ├── datetime.ts
│       ├── index.ts
│       ├── logger.ts
│       └── promise-utils.ts
├── tsconfig.json
└── yarn.lock
```

## Contributing

We welcome contributions from the community! If you have any enhancements, bug fixes, or issues, please do send us a pull request or open an issue on the Github page.

When submitting a pull request, please follow these guidelines:

- The title and content of the pull request should clearly indicate the purpose of the changes.
- The code should be formatted and consistent with the existing codebase.

## License

This project is licensed under the Apache License 2.0. For more details, please refer to the LICENSE file.

## Credits

N/A

## Contact

Please feel free to contact us at nosociallabs@gmail.com with any questions or feedback about the project.

## Additional Information

N/A
