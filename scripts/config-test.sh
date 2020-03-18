#! /bin/bash

gcloud config set project cii-sytem-test
gcloud beta runtime-config configs create cii-system-config
gcloud beta runtime-config configs variables set DATABASE_URL "postgres://postgres:rJtJnO0JhlKJjw3L@35.200.51.176:5432/cii-test" --config-name cii-system-config

gcloud beta runtime-config configs variables set ONE_SIGNAL_APP_ID "3623f360-64cd-4f9f-a5cb-64ef00ea3317" --config-name cii-system-config
gcloud beta runtime-config configs variables set ONE_SIGNAL_API_KEY "MWZlODk1ZWMtOTBhNi00YTllLWE5OGYtOWUyZWZiZGEwYThj" --config-name cii-system-config

gcloud beta runtime-config configs variables set DEBUG "true" --config-name cii-system-config
