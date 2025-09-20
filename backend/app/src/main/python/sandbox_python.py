#!/usr/bin/env python3
import secrets
import subprocess
import sys

TIMEOUT_SECS = 10
IMAGE = "python:3.12-slim"


def main() -> None:
    code = sys.stdin.buffer.read()
    trailer = (
        b"\n\n"
        b"import inspect, asyncio\n"
        b"fn = globals().get('solution')\n"
        b"if callable(fn):\n"
        b"    res = (asyncio.run(fn()) if "
        b"inspect.iscoroutinefunction(fn) else fn())\n"
        b"    print(res)\n"
    )
    payload = code + trailer

    name = "py_sandbox_" + secrets.token_hex(8)
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
        "-e",
        "PYTHONDONTWRITEBYTECODE=1",
        IMAGE,
        "python",
        "-I",
        "-B",
        "-",
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
