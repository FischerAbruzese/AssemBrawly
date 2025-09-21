# Use a small, stable base image
FROM debian:stable-slim

# Install bash and any common utilities your script might need.
# Add more packages as required by your script (e.g., curl, git, openssh-client, jq).
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash ca-certificates coreutils curl jq git \
 && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy your project files (adjust as needed)
COPY . /app

# Ensure the script is executable
RUN chmod +x ./deploy_backend.sh

# If the script needs environment variables, set them here or pass at runtime
# ENV FOO=bar

# Run the script as the container's main process
# If your script needs bash features, ensure /bin/bash is used.
CMD ["/bin/bash", "-c", "./deploy_backend.sh"]
