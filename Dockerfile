FROM golang:1.20-alpine AS gaiad-builder
WORKDIR /src/app/
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
ENV PACKAGES curl make git libc-dev bash gcc linux-headers eudev-dev python3
RUN apk add --no-cache $PACKAGES
RUN CGO_ENABLED=0 make install

FROM alpine:latest
RUN apk add --no-cache curl jq lz4-libs lz4 
COPY --from=gaiad-builder /go/bin/gaiad /usr/local/bin/
COPY start-gaiad.sh /usr/local/bin/start-gaiad.sh
RUN chmod +x /usr/local/bin/start-gaiad.sh

EXPOSE 26656 26657 1317 9090

USER 0

ENTRYPOINT ["/usr/local/bin/start-gaiad.sh"]