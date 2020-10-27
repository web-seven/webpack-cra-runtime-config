#!/bin/bash

env_vars="ENTRY_POINT_DUMMY=1|"
for var in "${!REACT_APP_@}"; do
    env_vars+="$var=|"
done
env_vars=${env_vars%|}
export $(cat ./.env | grep -Ev "$env_vars" | xargs)
envsubst < ./PLACEHOLDER_JS_DIST > ./PLACEHOLDER_JS
envsubst < ./PLACEHOLDER_MAP_DIST > ./PLACEHOLDER_MAP
rm -f ./.env

exec "$@"