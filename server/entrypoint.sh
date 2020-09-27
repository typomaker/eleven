#!/usr/bin/env bash
set -eo pipefail

CMD=$@
NODE_ENV=${ENV}
if [[ ${CMD} = "" ]]; then
    case ${ENV} in
        "development")
            if [[ ! -d "./node_modules" || -z "$(ls -A ./node_modules)" ]]; then
                npm install
            fi
            if [[ ! -d "./dist"  || -z "$(ls -A ./dist)" ]]; then
                npm run build
            fi
            CMD="npm run watch"
        ;;
        *)
            CMD="npm run start"
        ;;
    esac
fi
exec ${CMD};
