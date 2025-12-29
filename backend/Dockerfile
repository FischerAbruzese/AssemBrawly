# Java 21 (LTS) runtime on Debian slim
FROM eclipse-temurin:25-jdk-jammy

# Install common tools your script may need; add more as required (curl, git, jq, unzip, bash)
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash curl git jq ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy project files
COPY . /app

# Ensure the script is executable
RUN chmod +x ./deploy_backend.sh

# Environment variables for Java (optional tunings)
# ENV JAVA_OPTS="-Xms256m -Xmx1g"

# Run the deployment script
CMD ["/bin/bash", "-c", "./deploy_backend.sh"]
