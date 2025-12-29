#!/usr/bin/env bash

set -x

./docker_config.sh
./gradlew run --no-daemon
