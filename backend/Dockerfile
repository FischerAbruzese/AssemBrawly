# ---- Build stage ----
FROM eclipse-temurin:21-jdk-jammy AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-venv python3-pip \
    qemu-user \
    gcc-riscv64-linux-gnu binutils-riscv64-linux-gnu \
    curl git jq ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY . .
ENV GRADLE_USER_HOME=/src/.gradle
# Build the app distribution (subproject ":app")
RUN ./gradlew --no-daemon :app:installDist

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-jammy AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    qemu-user \
    gcc-riscv64-linux-gnu binutils-riscv64-linux-gnu \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the installed application (scripts + libs + resources)
COPY --from=build /src/app/build/install/app /app

# Copy your sandbox scripts into a fixed location
COPY src/main/python /app/python
RUN chmod -R a+r /app/python

# Allow the app to locate the sandbox scripts in production
ENV PY_SANDBOX_DIR=/app/python

# Help Render detect the service; Ktor should bind 0.0.0.0:${PORT}
ENV PORT=8080
EXPOSE 8080

# Run the app directly (no Gradle)
CMD ["/app/bin/app"]
