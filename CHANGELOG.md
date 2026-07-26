# 📜 Changelog - PBDA Blood Donation System

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-07-26

### 🚀 Added
- **Production Core**: Released official Version 1.0.0 for Pangsha Blood Donors Association.
- **Enterprise Security Suite**: Added rate limiters for authentication, search, requests, export, and settings endpoints.
- **JWT Revocation Blacklist**: Added token blacklist middleware enabling instant session invalidation on admin logout.
- **CSRF & Injection Defenses**: Implemented strict header/bearer verification and recursive input sanitization for XSS/code injection prevention.
- **Tagged In-Memory Cache**: Added high-performance tagged caching layer (`appCache`) with automated tag invalidation on donor, request, and campaign updates.
- **Fast Public Stats API**: Added cached `/api/stats` endpoint returning aggregated system metrics in under 5ms.
- **Multi-Channel Notifications**: Integrated Telegram Bot API broadcasts and WhatsApp gateway/QR management service.
- **Multi-Format Reports**: Full export support for Excel (`.xlsx`), CSV, and styled PDF files for donor and request datasets.
- **Trash & Soft-Delete Engine**: Soft-delete and instant restore capabilities for donors, requests, and administrative users.
- **PWA & SEO Readiness**: Manifest v2, robots.txt, sitemap.xml, and OpenGraph metadata configuration.
- **Complete Documentation**: Published README, Deployment Guide, Environment Variable Reference, Admin Manual, Volunteer Manual, and Release Notes.

### 🛡️ Security & Performance
- Zero TypeScript strict compilation errors.
- Zero ESLint linting warnings/errors.
- Production build compiled via Vite and ESBuild.
- Enforced security headers (`HSTS`, `CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
