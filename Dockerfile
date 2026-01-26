# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
USER bun

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
USER bun

RUN mkdir -p /tmp/dev
COPY --chown=bun:bun package.json bun.lock /tmp/dev/
RUN cd /tmp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /tmp/prod
COPY --chown=bun:bun package.json bun.lock /tmp/prod/
RUN cd /tmp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
USER bun

COPY --chown=bun:bun --from=install /tmp/dev/node_modules node_modules
COPY --chown=bun:bun . .

# [optional] tests & build
ENV NODE_ENV=production
USER bun

RUN pwd
RUN ls -la /usr/src/app
RUN id
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
USER bun

COPY --chown=bun:bun --from=install /tmp/prod/node_modules node_modules
COPY --chown=bun:bun --from=prerelease /usr/src/app/src/server src/server
COPY --chown=bun:bun --from=prerelease /usr/src/app/dist dist
COPY --chown=bun:bun --from=prerelease /usr/src/app/package.json .

# run the app
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "start"]
