#!/usr/bin/env bash
# render-build.sh — runs on every Render deploy

set -o errexit  # Exit on error

pip install -r requirements.txt

python backend/manage.py collectstatic --no-input
python backend/manage.py migrate