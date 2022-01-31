# Builder
FROM rust:1.58-slim-buster AS builder

COPY . .

RUN cargo build --release

# Final Image
FROM debian:buster-slim

COPY --from=builder /target/release/api .

CMD ["./api"]
