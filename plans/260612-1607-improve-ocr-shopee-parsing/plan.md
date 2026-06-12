---
title: Improve OCR Shopee Parsing
description: Refactor OcrService.php parsing logic to resolve incorrect phone, name, tracking, and COD amount extractions on Shopee labels.
status: planning
priority: high
effort: medium
branch: main
tags: [backend, php, ocr, parser, regex]
created: 2026-06-12
---

# Plan - Improve OCR Shopee Parsing

This plan details the changes to `OcrService.php` parsing to correctly identify Shopee shipping label data.

## Phases

1. [Phase 1: Parsing Refactoring](file:///c:/Users/Admin/Downloads/ccc/plans/260612-1607-improve-ocr-shopee-parsing/phase-01-parsing.md) - Implement new block-based and label-based line parsing in `parseShopeeOrderText`. (Status: Not Started)

## Key Dependencies

- PHP GD extension (already used for optimization)
- OCR.space API connection
