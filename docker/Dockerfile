# nosical api image
FROM ubuntu:18.04

RUN apt-get clean
RUN apt-get update --fix-missing
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN npm install --global yarn
ADD src /nosocial-api/src
ADD .env /nosocial-api/.env
ADD codegen.yaml /nosocial-api/codegen.yaml
ADD package.json /nosocial-api/package.json
ADD tsconfig.json /nosocial-api/tsconfig.json
ADD VERSION /nosocial-api/VERSION
RUN cd /nosocial-api && yarn && yarn build
CMD cd /nosocial-api && yarn start
