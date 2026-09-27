FROM node:24-slim AS base
RUN npm install -g @nubjs/nub@0.9.5 && npm cache clean --force

WORKDIR /usr/src/app
RUN mkdir -p data && chown -R node:node /usr/src/app
USER node

# Frozen installs produce self-contained dependencies for copying between stages.
FROM base AS install
RUN mkdir -p /tmp/dev /tmp/prod
COPY --chown=node:node package.json bun.lock .node-version /tmp/dev/
RUN cd /tmp/dev && nub ci
COPY --chown=node:node package.json bun.lock .node-version /tmp/prod/
RUN cd /tmp/prod && nub ci --prod

FROM base AS prerelease
COPY --chown=node:node --from=install /tmp/dev/node_modules node_modules
COPY --chown=node:node . .
RUN nub run build

FROM base AS release
ENV NODE_ENV=production
COPY --chown=node:node --from=install /tmp/prod/node_modules node_modules
COPY --chown=node:node --from=prerelease /usr/src/app/src/server src/server
COPY --chown=node:node --from=prerelease /usr/src/app/src/shared src/shared
COPY --chown=node:node --from=prerelease /usr/src/app/dist dist
COPY --chown=node:node package.json tsconfig.json .node-version ./

EXPOSE 3000/tcp
CMD ["nub", "run", "start"]
