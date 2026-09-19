# KisanOS AI — Incremental Development Plan
**Phased Implementation Matrix (Prompts 1 - 13)**

---

## Phase 1: Planning & Specification (Prompt 1) — CURRENT
- [x] Inspect environment & runtimes (Python 3.14, Node 24, Pip).
- [x] Create core architectural blueprint (`ARCHITECTURE.md`).
- [x] Formulate API contracts and Swagger endpoint definitions (`API_SPEC.md`).
- [x] Design normalized relational schema + pgvector RAG data model (`DATABASE.md`).
- [x] Detail incremental execution plan (`DEVELOPMENT_PLAN.md`).

---

## Phase 2: Database Layer & Realistic Seed Data (Prompt 2)
- SQLAlchemy 2.0 async models for all 11 entities (User, Farm, CropHistory, CropObservation, Store, StoreInventory, Market, HarvestLot, AIInteraction, Notification, KnowledgeChunk).
- Dual-engine connection pool: PostgreSQL with pgvector + transparent fallback to local SQLite with cosine vector search for zero-friction local development.
- Realistic Indian agriculture seed dataset:
  - Demo farmer: Ramesh Patel (सीहोर, मध्य प्रदेश, Phone: `9876543210`, Password: `Password123!`).
  - Farms: North Field A (2.5 acres, Sharbati Wheat, Tillering stage, Black loamy soil, pH 6.8).
  - Multi-season history: Rabi 2024, Kharif 2024 (Soybean, 24 Quintal, ₹96,000), Rabi 2025 (Wheat, 18 Quintal, ₹41,400).
  - Verified local agri-input retail stores with GPS coordinates & stock inventories (DAP, Neem coated Urea, Tilt Propiconazole, Nano Zinc).
  - Live Mandi prices & verified buyer listings (Sehore APMC Mandi, Bhopal Krishi Mandi, ITC Choupal).
  - Seeded agricultural RAG documents for Wheat, Rice, Potato, Tomato with pest/nutrient profiles.

---

## Phase 3: FastAPI Backend & Swagger APIs (Prompt 3)
- Modular FastAPI application with CORS, exception handlers, and auto-documentation (`/docs`).
- Full JWT authentication flow (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
- CRUD routers for Farms, History, Observations, Stores, Markets, Harvest, Notifications, and Weather.
- Integration tests verifying every endpoint returns conforming HTTP status and payloads.

---

## Phase 4: Farmer-Facing Next.js Frontend (Prompt 4)
- Next.js application with Tailwind CSS, Lucide icons, and responsive components.
- Hindi-first with 1-click English toggle (state persisted in localStorage).
- High-contrast, touch-optimized UI (minimum 48px buttons, clear visual indicators).
- Real integration with FastAPI endpoints via TanStack React Query.
- Authentication state management with auto-redirects and demo farmer 1-click sign-in.

---

## Phase 5: Farm Memory & Personalized Dashboard (Prompt 5)
- Dynamic dashboard displaying:
  - Current farm telemetry (Soil type, pH, Acreage, Current stage).
  - Farm Memory card: Historical comparison with previous seasons (Yield & Revenue).
  - Real-time weather card with localized farming advisory.
  - Quick action dials: AI Advice, Crop Scan, Store Finder, Mandi Rates.

---

## Phase 6: AI Farming Advisor with RAG (Prompt 6)
- RAG pipeline combining:
  - Farm profile (Soil pH, crop stage).
  - Farm memory (Historical yield & fertilizers).
  - Live weather forecast.
  - Curated agronomy chunks retrieved via vector similarity.
- Configurable LLM provider (Gemini / Groq / OpenAI / Deterministic Agronomy Engine fallback).
- Guaranteed structured JSON output with treatments, dosage, and local store availability.

---

## Phase 7: Crop Image Analysis & Vision Diagnostics (Prompt 7)
- Vision service with multi-modal LLM support and botanical symptom classifier fallback.
- Upload dropzone + camera capture for mobile farmers.
- Immediate diagnostic breakdown: Disease name in Hindi & English, severity badge, step-by-step cure, and matching remedies available in nearby stores.

---

## Phase 8: Nearby Stores, Inventory & Interactive Maps (Prompt 8)
- Interactive Leaflet map displaying farmer's farm and local input stores within radius.
- Store inventory breakdown with real-time stock levels, farmer pricing, and direct call button.
- Route distance calculation and turn-by-turn navigation link.

---

## Phase 9: Harvest Lot & Mandi Market Discovery (Prompt 9)
- Digital harvest lot creation with crop variety, moisture content, and quality grade.
- Instant Mandi price comparator across regional APMCs and private procurement hubs.
- Direct buyer inquiry submission.

---

## Phase 10: Smart Automation & Proactive Alert Engine (Prompt 10)
- Automated rule triggers:
  - Irrigation postponement warning on rain probability > 60%.
  - Critical disease severity broadcast to farmer's notification feed.
  - Mandi price spike alert to optimize selling window.

---

## Phase 11: End-to-End Demo Validation & Bug Scrubbing (Prompt 11)
- Comprehensive test suite covering Auth -> Farm -> Advisor -> Vision -> Stores -> Harvest -> Market -> Notifications.
- Validation that every button and workflow performs genuine operations.

---

## Phase 12: Mobile-First, PWA & Accessibility Polish (Prompt 12)
- Bottom navigation bar for thumb-friendly mobile operation.
- Web app manifest and service worker configuration for PWA installation.
- Accessible semantic markup and screen-reader considerations.

---

## Phase 13: Production Docker & Deployment Packaging (Prompt 13)
- Multi-stage Dockerfile for FastAPI backend.
- Optimized standalone Dockerfile for Next.js frontend.
- `docker-compose.yml` orchestrating Frontend, Backend, and PostgreSQL with pgvector.
- Exhaustive `README.md` with step-by-step local setup, API keys guide, demo credentials, and production deployment instructions.
