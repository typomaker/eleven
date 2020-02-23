#!/usr/bin/env bash
set -eo pipefail

CMD=$@
if [[ ${CMD} = "" ]]; then
    case ${ENV} in
        "development")
          CMD="fresh -c runner.conf"
        ;;
        *)
          CMD="app"    
        ;;
    esac
fi
exec ${CMD};
