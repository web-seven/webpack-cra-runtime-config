#!/bin/bash

env_vars=
for var in "${!REACT_@}"; do
    env_vars+="$var=|"
done
env_vars=${env_vars%|}
export $(cat ./build/.env | grep -Ev "$env_vars" | xargs)
envsubst < ./build/PLACEHOLDER_JS_DIST > ./build/PLACEHOLDER_JS
envsubst < ./build/PLACEHOLDER_MAP_DIST > ./build/PLACEHOLDER_MAP
rm -f ./build/.env

exec "$@"