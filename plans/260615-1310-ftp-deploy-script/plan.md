---
title: FTP Deployment Script Setup
description: Create a Python script to deploy the PHP backend from 3f-api to Plesk over FTP, with environment file support and detailed guides.
status: in-progress
priority: high
effort: low
branch: main
tags: [deploy, ftp, python, phtml, backend]
created: 2026-06-15
---

# FTP Deployment Plan

This plan details the implementation of a Python script to securely deploy backend code inside `3f-api/` to `/httpdocs` on the Plesk server via FTP.

## Phases

1. **Phase 1: Implementation & Integration** (Status: In Progress)
   - [Phase Details](file:///c:/Users/Admin/Downloads/ccc/plans/260615-1310-ftp-deploy-script/phase-01-ftp-deploy.md)
   - Create `scripts/deploy_ftp.py`
   - Update `.gitignore` to ignore `.deploy.env`
   - Create documentation `docs/deploy-ftp-python.md`

## Key Dependencies

- Python 3.x (Standard library `ftplib`, `os`, `sys`, `fnmatch`)
- `.deploy.env` configuration (FTP Host, FTP User, FTP Pass, FTP Target Directory)
