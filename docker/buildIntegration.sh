#!/usr/bin/env bash
sed -ie 's/\"task-profile\": \"auto-regression-firefox\"/\"task-profile\": \"auto-regression-chromium\"/g' package.json