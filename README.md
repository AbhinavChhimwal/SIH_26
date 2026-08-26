# SENTIX: AI-Driven Multi-Vector Social Media Analytics & Link Topology Intelligence Platform

> **SIH 152 Enterprise Audience Intelligence Platform** — Production-grade AI framework processing cross-platform social streams (X/Twitter, Telegram, Instagram, Facebook, Reddit, YouTube) to uncover multi-dimensional sentiment (nuanced emotions & sarcasm), automated demographic profiling, real-time trend velocity, and graph topology link analysis with WebGL 60 FPS large-scale shaders and token-bucket rate limiting.

---

## 1. Enterprise Advancements Implemented

### 1. Enterprise Rate-Limit & Token Quota Architecture (Redis Token Bucket)
- **Token Bucket Algorithm**: Configurable capacity, refill rate, and cost-per-request models preventing 429 Too Many Requests bans across high-volume streams.
- **Per-Platform Quota Management**:
  - *X (Twitter) Enterprise Filtered Stream*: $100$ token burst, $+25\text{ tokens/s}$, $2.5\text{M}$ daily quota.
  - *Telegram MTProto & Bot Broadcast*: $60$ token burst, $+30\text{ tokens/s}$, $1.5\text{M}$ daily quota.
  - *Instagram Graph API*: $40$ token burst, $+10\text{ tokens/s}$, $500\text{K}$ daily quota.
  - *Facebook Public Pages API*: $40$ token burst, $+8\text{ tokens/s}$, $400\text{K}$ daily quota.
  - *Reddit Streaming OAuth API*: $50$ token burst, $+15\text{ tokens/s}$, $800\text{K}$ daily quota.
  - *YouTube Data API v3 (Comments)*: $200$ unit burst, $+20\text{ units/s}$, $1\text{M}$ daily units.
- **Circuit Breaker State Machine**: `CLOSED` $\to$ `OPEN` $\to$ `HALF_OPEN` with automatic cooldown retry backoff.
- **Interactive Rate Limiter Console**: Real-time capacity gauges, burst testing button, and reset controls at `/ingestion`.

### 2. Hardware-Accelerated Large-Scale WebGL 60 FPS Graph Engine
- **Custom WebGL 2.0 Shader Pipeline**:
  - Vertex Shader with PageRank node size scaling, instanced colors, and animated infection pulse rings.
  - Fragment Shader with antialiased circles and neon glow shaders.
- **Spatial Grid $O(1)$ Collision Index**: Instantaneous hover and click hit-testing across dense node meshes.
- **Scalable Node Density Stress Tester**: Scale effortlessly from $15$ nodes up to **$25,000+$ synthetic nodes** (Barabási–Albert scale-free graph generator) maintaining smooth 60 FPS on GPU.
- **Live GPU Telemetry Bar**: Shows real-time FPS counter, active node count, and GPU draw calls.

### 3. Automated AI Crisis Alerting & Webhook Dispatcher
- Real-time early warning rule engine monitoring:
  - Discourse Anxiety $> 35\%$
  - Virality Velocity Index $> 80/100$
  - Diffusion $R_0 > 2.0$
- Dispatcher simulation delivering alerts to **Slack incoming webhooks**, **Discord threat channels**, or **PagerDuty P1 alerts**.

### 4. Live Model Calibration & Heuristic Lexicon Studio
- Admin studio at `/sentiment` to tune sarcasm sensitivity thresholds, adjust baseline anxiety activation levels, and inject custom domain trigger keywords on the fly.

### 5. Developer OpenAPI Console & REST Playground
- Interactive playground at `/developer` with cURL generators and live response viewers for `/api/analytics/sentiment`, `/api/analytics/network`, `/api/analytics/trends`, `/api/analytics/demographics`, and `/api/stream`.

---

## 2. Technology Stack

- **Frontend & Full-Stack**: Next.js 14.2 (App Router), React 18, TypeScript 5.5
- **Styling & Design System**: Tailwind CSS, Lucide React Icons, Cyber Slate Dark Theme
- **Data Visualization & Graph Physics**:
  - WebGL 2.0 Custom Shaders + HTML5 Canvas + `d3-force` for interactive network topology & cascade diffusion animation
  - Recharts for multi-dimensional emotion radar, time-series fluctuation, and demographic pyramids
  - Interactive SVG Choropleth for Global Audience Geography
- **NLP & Graph Intelligence Pipeline**:
  - Nuanced Emotion NLP Classifier + Sarcasm Linguistic Heuristics Engine
  - Graph Topology Engine: PageRank (Power iteration, $d=0.85$), Brandes Betweenness Centrality, Degree Centrality
  - Kleinberg Burst Detection & Virality Acceleration Matrix
- **Real-Time Streaming**: Server-Sent Events (SSE) `/api/stream` with live telemetry emitter
- **Reporting Engine**: Automated executive briefings with client-side JSON, CSV, and printable PDF export

---

## 3. How to Run

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Unit Tests
```bash
npm test
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Step 4: Production Build
```bash
npm run build
npm start
```

---

## 4. Verification & Testing

- **12/12 Unit Tests Passed** across NLP emotion extraction, Sarcasm heuristics, PageRank sum normalization, Hub KOL detection, Token Bucket rate limiting, Circuit Breaker transitions, and Spatial Grid $O(1)$ queries.
- **15 Routes Built with 0 Errors** across static and dynamic Next.js App Router endpoints.
