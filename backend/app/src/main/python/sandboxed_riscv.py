#!/usr/bin/env python3
import secrets
import subprocess
import sys

# This script reads a short RISC-V assembly function from stdin that defines a
# symbol named `solution`. It wraps it with a tiny RISC-V _start that:
#   - calls solution
#   - prints the returned 64-bit integer in decimal to stdout with a newline
#   - exits(0)
#
# It compiles for riscv64 (RV64GC) with -nostdlib -static and runs it via QEMU
# inside a locked-down Docker container.
#
# Notes:
# - The container image must provide a riscv64 cross-compiler and qemu-riscv64.
# - We try common tool names:
#     riscv64-linux-gnu-gcc, riscv64-unknown-linux-gnu-gcc,
#     riscv64-linux-musl-gcc
#   and qemu names:
#     qemu-riscv64-static, qemu-riscv64
# - Your input should be RISC-V assembly for a function:
#     .text
#     .globl solution
#     .type solution, @function
#     solution:
#         li a0, 0    # return value in a0 (rv64)
#         ret
#
# Example input:
#   solution:
#       li a0, 42
#       ret

TIMEOUT_SECS = 10

IMAGE = "riscv-sandbox-arch:latest"


def main() -> None:
    code = sys.stdin.buffer.read()

    # Prelude declares `solution` as a function symbol in .text.
    prelude = b"".join(
        [
            b".text\n",
            b".globl solution\n",
            b".type solution, @function\n",
        ]
    )

    # Trailer: RISC-V rv64 code to call `solution`, convert a0 to decimal,
    # write, and exit. Uses Linux syscalls: write (64), exit (93).
    #
    # Registers:
    #   t0: value (abs if negative)
    #   t1: end_ptr = buf + 63 (newline stored at [t1])
    #   t2: cursor (building digits backward)
    #   t3: sign flag (0/1)
    #   t4: constant 10
    #   t5: quotient / length temp
    #   t6: remainder / char temp
    #
    # Algorithm:
    #   - call solution -> a0
    #   - newline at end, build digits backwards, optional '-'
    #   - write(1, start_ptr, len)
    #   - exit(0)
    trailer = b"".join(
        [
            b"\n",
            b".section .text\n",
            b".globl _start\n",
            b"_start:\n",
            b"    call solution\n",
            b"    mv t0, a0\n",
            b"    la t1, buf\n",
            b"    addi t1, t1, 63\n",
            b"    li t6, 10\n",
            b"    sb t6, 0(t1)\n",
            b"    addi t2, t1, -1\n",
            b"    beqz t0, 1f\n",
            b"    li t3, 0\n",
            b"    bge t0, x0, 2f\n",
            b"    neg t0, t0\n",
            b"    li t3, 1\n",
            b"2:\n",
            b"    li t4, 10\n",
            b"0:\n",
            b"    divu t5, t0, t4\n",
            b"    remu t6, t0, t4\n",
            b"    addi t6, t6, '0'\n",
            b"    sb t6, 0(t2)\n",
            b"    addi t2, t2, -1\n",
            b"    mv t0, t5\n",
            b"    bnez t0, 0b\n",
            b"    beqz t3, 3f\n",
            b"    li t6, '-'\n",
            b"    sb t6, 0(t2)\n",
            b"    addi t2, t2, -1\n",
            b"    j 3f\n",
            b"1:\n",
            b"    li t6, '0'\n",
            b"    sb t6, 0(t2)\n",
            b"    addi t2, t2, -1\n",
            b"3:\n",
            b"    addi t2, t2, 1\n",
            b"    sub t5, t1, t2\n",
            b"    addi t5, t5, 1\n",
            b"    li a0, 1\n",
            b"    mv a1, t2\n",
            b"    mv a2, t5\n",
            b"    li a7, 64\n",
            b"    ecall\n",
            b"    li a0, 0\n",
            b"    li a7, 93\n",
            b"    ecall\n",
            b".section .bss\n",
            b".lcomm buf, 64\n",
        ]
    )

    payload = code + trailer

    name = "py_sandbox_" + secrets.token_hex(8)

    # Build and run inside the container. We:
    #  - write /tmp/prog.S
    #  - find a riscv64 gcc (try several common tool names)
    #  - compile with -nostdlib -static for rv64gc, ABI lp64d
    #  - find qemu-riscv64 and run the binary
    #
    # Note:
    # - Use "sh -c" (not "-lc") for maximum compatibility; some /bin/sh
    #   implementations don't support the "-l" option.
    # - Use "set -e" and semicolons to avoid relying on "&&", which fixes the
    #   "Syntax error: '&&' unexpected" you hit in certain shells.
    build_and_run = "\n".join(
        [
            "set -e",
            "cat >/tmp/prog.S",
            # Pick compiler
            'CC="$(command -v riscv64-linux-gnu-gcc 2>/dev/null || true)";',
            'if [ -z "$CC" ]; then '
            'CC="$(command -v riscv64-unknown-linux-gnu-gcc 2>/dev/null || '
            'true)"; fi;',
            'if [ -z "$CC" ]; then '
            'CC="$(command -v riscv64-linux-musl-gcc 2>/dev/null || true)"; '
            "fi;",
            '[ -n "$CC" ] || { echo "RISC-V gcc not found" >&2; exit 127; }',
            # Compile
            '"$CC" -nostdlib -static -march=rv64gc -mabi=lp64d -s '
            "-o /tmp/a.out /tmp/prog.S",
            # Pick QEMU
            'QEMU="$(command -v qemu-riscv64-static 2>/dev/null || '
            'command -v qemu-riscv64 2>/dev/null)";',
            '[ -n "$QEMU" ] || { echo "qemu-riscv64 not found" >&2; '
            "exit 127; }",
            # Run (static binary should not need -L, but it is harmless)
            '"$QEMU" -L / /tmp/a.out',
        ]
    )

    cmd = [
        "docker",
        "run",
        "--rm",
        "--name",
        name,
        "-i",
        "--network",
        "none",
        "--read-only",
        "--user",
        "65534:65534",
        "--pids-limit",
        "64",
        "--cpus",
        "1.0",
        "--memory",
        "256m",
        "--memory-swap",
        "256m",
        "--ulimit",
        "nproc=64:64",
        "--ulimit",
        "nofile=256:256",
        "--ulimit",
        "cpu=5:5",
        "--security-opt",
        "no-new-privileges=true",
        "--cap-drop",
        "ALL",
        "--ipc",
        "none",
        "--workdir",
        "/",
        "--tmpfs",
        "/tmp:rw,exec,nosuid,nodev,size=64m",
        IMAGE,
        "/bin/sh",
        "-c",
        build_and_run,
    ]

    try:
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        try:
            proc.communicate(input=payload, timeout=TIMEOUT_SECS)
        except subprocess.TimeoutExpired:
            try:
                proc.kill()
            finally:
                subprocess.run(
                    ["docker", "rm", "-f", name],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
            sys.exit(124)
        sys.exit(proc.returncode)
    except FileNotFoundError:
        sys.exit(127)


if __name__ == "__main__":
    main()
