# syntax=docker/dockerfile:1.6
FROM node:10-stretch as build
WORKDIR /opt/learninglocker

ADD package.json .yarnrc yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,rw <<EOF
  yarn upgrade @google-cloud/pubsub@0.32.1 --ignore-engines
  yarn install --ignore-engines --ignore-platform
EOF

ADD . .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,rw <<EOF
  touch .env
  yarn build-all
EOF


FROM node:10-stretch-slim as runtime
WORKDIR /opt/learninglocker
ENV NODE_ENV production
RUN touch .env
ADD package.json .yarnrc yarn.lock .
RUN --mount=type=cache,target=/usr/local/share/.cache/yarn,rw <<EOF
  yarn upgrade @google-cloud/pubsub@0.32.1 --ignore-engines
  yarn install --ignore-engines --ignore-platform --only=production
EOF


FROM runtime
COPY --from=build /opt/learninglocker/api/dist ./api/dist
COPY --from=build /opt/learninglocker/cli/dist ./cli/dist
COPY --from=build /opt/learninglocker/ui/dist ./ui/dist
COPY --from=build /opt/learninglocker/worker/dist ./worker/dist
COPY lib/templates/emails ./lib/templates/emails
