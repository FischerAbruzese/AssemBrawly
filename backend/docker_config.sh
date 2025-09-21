#!/usr/bin/env sh
set -eu

IMAGE_NAME="riscv-sandbox-arch:latest"

check_image_tools() {
  docker run --rm --network none --read-only \
    --tmpfs /tmp:rw,exec,nosuid,nodev,size=64m \
    "$IMAGE_NAME" \
    sh -lc 'set -e;
      command -v riscv64-linux-gnu-gcc >/dev/null;
      command -v riscv64-linux-gnu-ld >/dev/null;
      (command -v qemu-riscv64 >/dev/null || command -v qemu-riscv64-static >/dev/null);
      riscv64-linux-gnu-gcc --version >/dev/null;
      (qemu-riscv64 -version >/dev/null 2>&1 || qemu-riscv64-static -version >/dev/null 2>&1)'
}

have_image_locally() {
  docker image inspect "$IMAGE_NAME" >/dev/null 2>&1
}

build_image() {
  echo "Building $IMAGE_NAME ..."
  docker build -t "$IMAGE_NAME" - <<'EOF'
FROM archlinux:latest

RUN set -eux; \
  pacman -Syu --noconfirm; \
  pacman -S --noconfirm \
    riscv64-linux-gnu-gcc \
    riscv64-linux-gnu-binutils \
    qemu-user \
    ca-certificates \
  ; \
  pacman -Scc --noconfirm

RUN set -eux; \
  command -v riscv64-linux-gnu-gcc; \
  command -v riscv64-linux-gnu-ld; \
  command -v qemu-riscv64 || command -v qemu-riscv64-static
EOF
}

verify_and_print() {
  docker run --rm -it --network none --read-only \
    --tmpfs /tmp:rw,exec,nosuid,nodev,size=64m "$IMAGE_NAME" \
    sh -lc 'riscv64-linux-gnu-gcc --version && (qemu-riscv64 -version || qemu-riscv64-static -version) && echo "Docker image riscv-sandbox-arch:latest is ready."'
}

main() {
  if have_image_locally; then
    echo "Found local image $IMAGE_NAME. Verifying tools..."
    if check_image_tools; then
      echo "Image $IMAGE_NAME is already set up."
      verify_and_print
      exit 0
    else
      echo "Image $IMAGE_NAME exists but failed tool check. Rebuilding..."
    fi
  else
    echo "Image $IMAGE_NAME not found locally."
  fi

  build_image

  echo "Verifying newly built image..."
  if check_image_tools; then
    verify_and_print
    exit 0
  else
    echo "Error: $IMAGE_NAME failed verification after build." >&2
    exit 1
  fi
}

main "$@"
