name: Deploy to mini

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: self-hosted
    steps:
      - name: Deploy
        run: |
          set -e
          cd /home/anver/nutrition-tracker
          git pull
          /home/anver/nutrition-tracker/backend/.venv/bin/pip install -r /home/anver/nutrition-tracker/backend/requirements.txt
          sudo /usr/bin/systemctl restart mybackend
          sudo /usr/bin/systemctl status mybackend --no-pager
