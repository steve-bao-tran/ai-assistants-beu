#! /bin/bash
gcloud config set project cii-system-dev
gcloud beta runtime-config configs create cii-system-config
gcloud beta runtime-config configs variables set DATABASE_URL "postgres://postgres:rJtJnO0JhlKJjw3L@35.200.51.176:5432/cii-dev" --config-name cii-system-config
gcloud beta runtime-config configs variables set ONE_SIGNAL_APP_ID "7e0add2b-9326-4b51-a150-03b84c78c20e" --config-name cii-system-config
gcloud beta runtime-config configs variables set ONE_SIGNAL_API_KEY "ZDE2MjJjMTQtMTU1NC00ODI5LTg3ZTEtMTg2NjIyNDFlMjE4" --config-name cii-system-config

gcloud beta runtime-config configs variables set DEBUG "true" --config-name cii-system-config
