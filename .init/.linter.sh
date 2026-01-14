#!/bin/bash
cd /home/kavia/workspace/code-generation/minimal-notes-199055-199064/notes_app_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

