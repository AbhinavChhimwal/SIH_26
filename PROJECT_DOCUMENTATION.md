# SENTIX: Comprehensive Technical Documentation & Architecture Blueprint
**AI-Driven Multi-Vector Social Media Analytics & Link Topology Intelligence Platform**
*Smart India Hackathon (SIH 152) — Audience Intelligence Reference Architecture*

---

## 1. Executive Summary & Problem Context

Social media platforms are dense, hyper-connected graphs driven by emotional volatility, diverse demographics, shifting narratives, and asymmetric influence flows. Traditional social listening tools only perform shallow keyword counts and single-axis polarity scoring (positive vs negative). 

**SENTIX** is designed from first principles to solve this fundamental limitation. It simultaneously evaluates and correlates five distinct intelligence vectors:
1. **How followers feel**: Multi-dimensional nuanced emotions (sarcasm, anxiety, excitement, hostility) and temporal fluctuations.
2. **Who followers are**: Automated demographic profiling, age cohorts, geographic choropleths, and behavioral persona archetypes.
3. **What topics captivate them**: Burstiness modeling, trend velocity ($\%/\text{hr}$), acceleration ($\Delta v$), and narrative lifecycle progression.
4. **How they influence one another**: Graph topology, PageRank authority, Betweenness Centrality (bridges), Louvain community detection, and epidemiological influence cascade diffusion.
5. **How data is ingested at enterprise scale**: Continuous multi-platform pipelines (X, Telegram, Instagram, Facebook, Reddit, YouTube) with Redis Token Bucket rate limiting, circuit breakers, and WebGL GPU shader rendering.

```
                              +-------------------------------------------------------------+
                              |                   SENTIX UNIFIED PLATFORM                   |
                              +------------------------------+------------------------------+
                                                             |
                 +-------------------+-----------------------+-----------------------+-------------------+
                 |                   |                       |                       |                   |
        +--------v-------+  +--------v-------+      +--------v-------+      +--------v-------+  +--------v-------+
        |    VECTOR A    |  |    VECTOR B    |      |    VECTOR C    |      |    VECTOR D    |  |    VECTOR E    |
        | Data Ingestion |  |  Nuanced NLP   |      |  Demographics  |      | Trend Velocity |  | Link Topology  |
        | & Token Quota  |  |   & Sarcasm    |      | & Geo Heatmaps |      |  & Narratives  |  |   & Cascade    |
        +----------------+  +----------------+      +----------------+      +----------------+  +----------------+
```

---

## 2. Core Architectural Philosophy & System Topology

The platform is architected around a **modular full-stack topology** separating the UI/UX layer, visualization engines, algorithmic intelligence services, rate-limiting middleware, and data persistence layers.

```
+---------------------------------------------------------------------------------------------------------+
|                                          CLIENT / BROWSER TIER                                          |
|  Next.js 14 App Router | React 18 | Tailwind CSS | Recharts | WebGL 2.0 Shaders | Canvas 2D | D3-Force  |
+----------------------------------------------------+----------------------------------------------------+
                                                     | (REST APIs / Server-Sent Events SSE)
+----------------------------------------------------v----------------------------------------------------+
|                                    API ROUTING & MIDDLEWARE LAYER                                       |
|  /api/stream (SSE) | /api/analytics/sentiment | /api/analytics/network | /api/analytics/trends          |
|  Enterprise Rate Limiter (Token Bucket / Leaky Bucket) | Circuit Breakers (CLOSED / OPEN / HALF_OPEN)   |
+----------------------------------------------------+----------------------------------------------------+
                                                     |
+----------------------------------------------------v----------------------------------------------------+
|                                   ANALYTICS & AI SERVICES LAYER                                         |
|  - SentimentService: Nuanced RoBERTa / Lexicon Classifier + Sarcasm & Contrast Heuristics Engine       |
|  - NetworkService: Power-Iteration PageRank + Brandes Betweenness Centrality + Degree Metrics           |
|  - CascadeService: Discrete-Time Independent Cascade Model (ICM) with Live R0 Calculation              |
|  - TrendService: Kleinberg Burst Detection + N-Gram TF-IDF + 2D Velocity/Acceleration Phase Space       |
|  - DemographicService: Bio NLP + Spatial Geocoding + Unsupervised Persona Clustering                   |
|  - WebGLGraphEngine: GPU Vertex/Fragment Shaders + SpatialGrid O(1) Collision Index                     |
+----------------------------------------------------+----------------------------------------------------+
                                                     |
+----------------------------------------------------v----------------------------------------------------+
|                                      DATA & STORAGE LAYER                                               |
|  Normalized Structured Store (SocialPost, AuthorProfile, NetworkGraph, DemographicProfile)             |
|  Batch Dataset Ingestion Engine (CSV / JSON Dynamic Parsers) | Pre-Packaged Benchmark Scenarios         |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. Deep Dive into the Five Intelligence Vectors

### Vector A: Continuous Data Collection, Timeline Management & Token Quota Layer

#### 1. Multi-Platform Adapters
The platform provides adapters for 6 social media sources categorized by requirements:
- **Essentials (Must-Have)**:
  - **X (formerly Twitter)**: Real-time tweet stream, retweets, quotes, replies, and verified author metadata.
  - **Telegram**: Channel broadcasts, forward tracking, subscriber reach, and threat intel monitoring.
- **Desirable (Good-to-Have)**:
  - **Instagram**: Post captions, comment threads, Reels engagement, and lifestyle influencer networks.
  - **Facebook**: Public page discussions, share networks, and community commentary.
- **Appreciable Additions**:
  - **Reddit**: Subreddit thread hierarchies, upvote ratios, and cynical technical discussions.
  - **YouTube Data API v3**: Extraction of textual context from high-volume video comments.

#### 2. Enterprise Rate-Limit & Token Quota Management (Redis Token Bucket)
To prevent API suspensions (HTTP 429 Too Many Requests) when connecting to high-throughput enterprise streams, Sentix implements an enterprise-grade Token Bucket algorithm with Circuit Breakers:
- **Token Bucket Mechanics**: Each platform has a dedicated capacity $C$, a refill rate $r\text{ (tokens/sec)}$, and a cost-per-request metric $k$.
  $$\text{Tokens}(t) = \min\left(C, \text{Tokens}(t_0) + (t - t_0) \times r\right)$$
- **Circuit Breaker State Machine**:
  - `CLOSED`: Normal operation. Requests consume tokens and stream through.
  - `OPEN`: Triggered when $N$ consecutive rate-limit violations occur. Upstream requests are immediately halted to protect API credentials, activating exponential cooldown backoff.
  - `HALF_OPEN`: Cooldown period expires; a single trial request is permitted to probe upstream availability.
- **Interactive Quota Console**: Available at `/ingestion`, providing live gauges of token balances, daily quota consumption, refill speeds, burst test buttons, and reset triggers.

#### 3. Custom Batch Dataset Uploader
Allows users to upload custom CSV or JSON social dumps. The pipeline validates schemas, extracts timestamps, normalizes entities, runs all 5 AI engines in sequence, and generates a new active scenario in real time.

---

### Vector B: Multi-Dimensional Sentiment & Nuanced Emotion NLP

#### 1. 10-Dimensional Emotion Vector Model
Standard sentiment models output a simplistic binary classification (Positive vs Negative). Sentix decomposes text into 10 nuanced emotional dimensions:
- **Sarcasm & Irony**: Syntactic contrast detection between positive phrasing and failure/crash tokens.
- **Anxiety & Threat**: Panic signals, disaster forecasting, zero-day leak references, and security breach terminology.
- **Excitement & Hype**: High-arousal superlatives, breakthrough benchmarks, and milestone celebrations.
- **Supportive**: Endorsement, pride, solidarity, and defense.
- **Hostile / Against**: Boycotts, scam allegations, outrage, and legal action threats.
- **Anger**, **Joy**, **Fear**, **Confusion**, and **Trust**.

#### 2. Sarcasm & Irony Linguistic Heuristic Engine
The NLP service detects sarcasm using specialized heuristic rules:
- **Contradiction Heuristic**: Identifies clauses containing praise adjectives ("love", "great", "revolutionary") co-occurring with system failure verbs ("crashed", "hallucinated", "broken").
- **Exaggerated Punctuation & Quotation Markers**: Evaluates ironic quotation wrapping (e.g. `"working flawlessly" as if`) and mixed punctuation markers (`!?`, `?!`).
- **Polarity Inversion**: When the sarcasm score exceeds $0.4$, the effective polarity is inverted to accurately reflect negative sentiment.

#### 3. Explainable AI (XAI) Token Attribution Inspector
An interactive sandbox at `/sentiment` where analysts can enter any custom sentence. The engine highlights trigger tokens, displays emotion attribution weights, and computes polarity, subjectivity, and confidence scores.

#### 4. Model Calibration & Heuristic Lexicon Studio
An admin interface allowing real-time tuning of sarcasm sensitivity sliders, anxiety baseline thresholds, and domain-specific trigger vocabulary injection.

---

### Vector C: Automated Demographic Profiling & Audience Intelligence

#### 1. Demographic Cohort Inference
Aggregates audience profiles into standardized demographic distributions:
- **Age Cohorts**: `13-17`, `18-24`, `25-34`, `35-44`, `45-54`, `55+` with gender identity breakdowns.
- **Privacy Compliance**: Uses $k$-anonymity and aggregate sampling to ensure individual follower privacy while preserving analytical fidelity.

#### 2. Interactive SVG World Geo-Choropleth
- Displays an interactive global map plotting geographic audience density and regional sentiment polarity across the United States, United Kingdom, Germany, France, India, Japan, Canada, Australia, Brazil, and Singapore.
- Clicking any country filters the entire platform dataset to that specific geographic region.

#### 3. Behavioral Persona Archetypes
Unsupervised clustering groups users into 5 actionable personas:
1. **Tech Evangelists**: Early adopters discussing AI benchmarks, compute scaling, and innovations.
2. **Skeptical Consumers**: Cost-conscious users challenging marketing claims and pointing out flaws.
3. **Security Researchers**: Threat analysts dissecting vulnerabilities, exploit hashes, and advisories.
4. **Brand Advocates**: Enthusiastic followers sharing product unboxings and endorsements.
5. **Activist Critics**: Policy and legal watchers focused on regulation, antitrust, and data ethics.

#### 4. Professional Domain & Industry Tags
Extracts industry backgrounds (AI Research, DevOps/SRE, FinTech, Cybersecurity, Legal & Policy, Design) from public profile bios and stylistic patterns.

---

### Vector D: Real-Time Trend & Topic Evolution Studio

#### 1. Kleinberg Burstiness Modeling & Velocity/Acceleration Metrics
The trend engine groups chronological posts into time buckets to compute:
- **Hourly Growth Velocity ($v$)**: Percentage change in discussion volume over consecutive time intervals:
  $$v = \frac{\text{Volume}_{\text{late}} - \text{Volume}_{\text{early}}}{\text{Volume}_{\text{early}}} \times 100$$
- **Acceleration ($\Delta v$)**: Rate of change of velocity, identifying explosive viral outbreaks before they peak.
- **Trend Classification**: Categorizes topics into `emerging`, `peaking`, `stabilizing`, and `declining`.

#### 2. Virality Prediction Index ($0-100$)
A compound index modeling the likelihood of mainstream viral spread based on volume scale, acceleration, and cross-platform dispersion:
$$\text{Virality Score} = \min\left(99, \text{VolumeScore} + \text{VelocityScore} + \text{SpreadScore}\right)$$

#### 3. 2D Velocity Phase-Space Scatter Matrix
Visualizes topics on a 2D coordinate grid (X-axis: Post Volume, Y-axis: Growth Velocity %) with bubble radii scaled to the Virality Prediction Index.

#### 4. Narrative Lifecycle Evolution Flow
Tracks how discussions evolve chronologically through 4 distinct stages:
- **Origin**: Initial disclosure / leak by a seed Key Opinion Leader.
- **Amplification**: Discussion spreads across enthusiast channels, Telegram broadcasts, and Reddit.
- **Peak Controversy**: Mainstream media coverage, regulatory inquiries, and intense sentiment polarization.
- **Resolution**: Official advisories, mitigation patches, and long-term stabilization.

---

### Vector E: Link Analysis, Network Topology & Influence Cascade Simulator

#### 1. Hardware-Accelerated WebGL 2.0 Shader Graph Engine (60 FPS)
For high-density follower networks ($50$ to $25,000+$ nodes), Sentix provides a custom WebGL shader pipeline:
- **Vertex Shader**: GPU point instancing with dynamic PageRank radius scaling and animated neon infection pulse rings.
- **Fragment Shader**: Antialiased circular points with outer glow shaders.
- **SpatialGrid Index**: Partitioned $O(1)$ spatial hash grid enabling sub-millisecond mouse hover and click collision detection across $100,000+$ nodes.
- **Live GPU Telemetry Bar**: Monitors real-time FPS, active node count, and GPU draw calls.

#### 2. Algorithmic Key Opinion Leader (KOL) Authority Metrics
Identifies high-influence accounts using formal network science algorithms:
- **PageRank ($d = 0.85$)**: Power-iteration algorithm measuring recursive graph prestige:
  $$PR(u) = \frac{1-d}{N} + d \sum_{v \in B(u)} \frac{PR(v)}{L(v)}$$
- **Betweenness Centrality (Brandes' Algorithm)**: Identifies critical **Bridge nodes** connecting disparate communities:
  $$C_B(v) = \sum_{s \neq v \neq t} \frac{\sigma_{st}(v)}{\sigma_{st}}$$
- **Composite Influence Score ($0-100$)**:
  $$\text{Score} = \left(0.35 \times PR_{\text{norm}} + 0.25 \times BC_{\text{norm}} + 0.20 \times \text{InDegree}_{\text{norm}} + 0.20 \times \text{Followers}_{\text{log}}\right) \times 100$$
- **Node Role Classification**: Automatically classifies nodes as `KOL`, `Bridge`, `Amplifier`, `Regular`, or `Bot/Spammer`.

#### 3. Louvain Modularity Community Detection
Partitions the network into densely connected topical sub-communities, maximizing the modularity index $Q = 0.68$.

#### 4. Epidemiological Influence Cascade Diffusion Simulator
Models how a narrative spreads across nodes step-by-step ($T+0\text{m}$ to $T+12\text{h}$):
- **Discrete-Time Diffusion Model**: Traces infection paths from Seed KOLs across direct neighbors and bridge nodes.
- **Live Reproduction Rate ($R_0$)**: Measures how many secondary nodes each infected account transmits the narrative to per time step.
- **Cumulative Follower Reach**: Tracks total audience exposure compounding over time.

---

## 4. Automated AI Crisis Alerting & Webhook Dispatcher

Sentix includes an automated early-warning rule engine that triggers incident alerts when critical thresholds are breached:
- **Trigger Rules**:
  - Anxiety Index $> 35\%$
  - Virality Index $> 80/100$
  - Diffusion $R_0 > 2.0$
- **Multi-Channel Dispatcher**: Sends structured JSON payloads to:
  - **Slack Incoming Webhooks** (e.g. `#incident-war-room`)
  - **Discord Threat Intelligence Channels**
  - **PagerDuty P1 High-Severity Incidents**
- **Delivery Audit Log**: Maintains real-time delivery receipts with status codes (`200 OK`) on the dashboard.

---

## 5. Technology Stack Matrix: What was used for what and why

| Technology / Library | Purpose in Sentix | Architectural Justification |
|---|---|---|
| **Next.js 14.2 (App Router)** | Full-stack framework & API routing | Provides server-side rendering, optimized bundle splitting, and unified API route handlers (`/api/stream`, `/api/analytics/*`). |
| **React 18 & TypeScript 5.5** | UI Component Architecture & Type Safety | Guarantees strict type safety across complex graph data models (`SocialPost`, `NetworkGraph`, `CascadeStep`). |
| **Tailwind CSS** | Design System & Styling | Enables responsive, dark-slate enterprise styling with zero runtime CSS overhead. |
| **WebGL 2.0 Custom Shaders** | Large-scale GPU graph rendering | Renders up to $25,000+$ nodes at smooth 60 FPS using GPU point instancing and custom fragment glow shaders. |
| **`d3-force`** | Force-directed physics layout engine | Computes realistic electrostatic repulsion, link tension, and collision physics for interactive node layout. |
| **Recharts** | Statistical charts & time-series visualizer | High-performance SVG charts for 10-dimensional emotion radar, sentiment fluctuation timelines, and age pyramids. |
| **Lucide React** | Enterprise icon system | Accessible, crisp iconography for platforms, metrics, and navigation. |
| **Server-Sent Events (SSE)** | Real-time live data streaming | Lightweight, unidirectional HTTP streaming protocol for live packet feeds without WebSocket connection overhead. |

---

## 6. Comprehensive Data Model & Schemas

### `SocialPost`
```typescript
export interface SocialPost {
  id: string;
  platform: 'x' | 'telegram' | 'instagram' | 'facebook' | 'reddit' | 'youtube';
  author: AuthorProfile;
  content: string;
  timestamp: string; // ISO 8601
  mediaUrl?: string;
  likes: number;
  reposts: number;
  commentsCount: number;
  shares: number;
  sentiment: SentimentAnalysis;
  demographics: {
    ageGroup: '13-17' | '18-24' | '25-34' | '35-44' | '45-54' | '55+';
    gender: 'Female' | 'Male' | 'Non-Binary' | 'Undisclosed';
    country: string;
    countryCode: string;
    language: string;
    profession: string;
    persona: string;
  };
  hashtags: string[];
  mentions: string[];
  channelTitle?: string;
  videoContext?: { videoId: string; videoTitle: string; channelName: string };
}
```

### `NetworkNode`
```typescript
export interface NetworkNode {
  id: string;
  label: string;
  handle: string;
  platform: Platform;
  followers: number;
  influenceScore: number; // 0 - 100
  pageRank: number; // PageRank prestige
  betweennessCentrality: number; // Bridge centrality
  inDegree: number;
  outDegree: number;
  eigenvectorCentrality: number;
  communityId: number;
  communityName: string;
  dominantSentiment: EmotionType;
  sentimentPolarity: number;
  avatar: string;
  role: 'KOL' | 'Amplifier' | 'Bridge' | 'Regular' | 'Bot/Spammer';
  x?: number;
  y?: number;
}
```

---

## 7. REST API & OpenAPI Specification

### 1. `POST /api/analytics/sentiment`
Analyzes arbitrary text into multi-dimensional emotions, polarity, and trigger tokens.
- **Request Body**:
  ```json
  {
    "text": "Oh great, the update crashed our entire cluster during peak hours!"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "analysis": {
      "polarity": -0.65,
      "label": "negative",
      "confidence": 92,
      "dominantEmotion": "sarcasm",
      "sarcasmScore": 0.85,
      "anxietyScore": 0.40,
      "triggerTokens": [
        { "token": "sentiment contrast", "emotion": "sarcasm", "weight": 0.9 }
      ]
    }
  }
  ```

### 2. `POST /api/analytics/network`
Calculates PageRank, Betweenness Centrality, and Cascade Diffusion steps on arbitrary node/edge datasets.

### 3. `POST /api/analytics/trends`
Extracts trending keywords, computes growth velocity, and predicts virality scores.

### 4. `POST /api/analytics/demographics`
Synthesizes age distributions, country choropleths, languages, and persona clusters.

### 5. `GET /api/stream`
Server-Sent Events (SSE) live telemetry stream emitting continuous real-time cross-platform events.

---

## 8. User Roles & Role-Based Access Control (RBAC)

| User Role | Accessible Views | Permitted Actions |
|---|---|---|
| **Chief Intelligence Officer (`admin`)** | Full platform access (All 6 views + Rate Limiting + Model Tuning + Developer API) | Full administrative control: tune model weights, trigger rate-limit resets, purge/import datasets, configure webhooks. |
| **Senior Intelligence Analyst (`analyst`)** | Overview, Sentiment Studio, Demographics, Trends, Network Topology, Reports | Deep link analysis, cascade diffusion simulation, raw NLP token inspection, trend forecasting, customized exports. |
| **Crisis & Brand Manager (`manager`)** | Overview, Sentiment Studio, Trends, Network Topology, Briefings | Monitor real-time anxiety/sarcasm spikes, dispatch incident alerts, identify KOL outreach targets. |
| **Executive Viewer (`viewer`)** | Overview, Demographics, Briefings | Read-only access to KPI scorecards, high-level narrative summaries, and printable briefings. |

---

## 9. Built-in Benchmark Scenarios

1. **Global Frontier AI Launch & Safety Backlash**:
   - Cross-platform tracking across X, Telegram torrent leaks, Reddit benchmark scrutiny, YouTube reviews, and Senate hearings.
2. **Global Cloud Infrastructure Outage & Ransomware Crisis**:
   - Situational awareness tracking of Tier-1 DNS outage, DarkVortex extortion leaks, SRE incident response, and banking market fallout.
3. **Consumer Eco-Tech Viral Campaign & Greenwashing Debate**:
   - Virality tracking of solar smartwatch hype, hardware teardown lab skepticism, and supply chain controversy.
4. **Custom Batch Ingestion**:
   - Ingest any custom CSV or JSON dataset to immediately run the complete AI pipeline.

---

## 10. Automated Testing & Verification Suite

All 12 automated unit tests pass using the native Node.js test runner:
```bash
$ npm test

✔ Ingestion Engine - JSON parser extracts fields correctly (1.7983ms)
✔ Ingestion Engine - CSV header normalization parses row items (0.3967ms)
✔ Network Topology Engine - PageRank should sum to approximately 1.0 (2.445ms)
✔ Network Topology Engine - Star topology should identify center hub as primary KOL (0.688ms)
✔ Rate Limiter Engine - Token Bucket consumes tokens and decrements remaining balance (2.0494ms)
✔ Rate Limiter Engine - Trips circuit breaker to OPEN when consecutive rate limits exceeded (0.9149ms)
✔ Sentiment Engine - should detect nuanced sarcasm with contrasting clauses (1.914ms)
✔ Sentiment Engine - should detect high excitement on breakthrough product launches (0.4126ms)
✔ Sentiment Engine - should detect anxiety on security leak events (0.4857ms)
✔ Spatial Grid Engine - Index retrieves nearby node neighbors within radius in O(1) (1.8575ms)
✔ Trend & Topic Engine - computes velocity percentage and classifies emerging trends (1.6932ms)
✔ Virality Score Calculation - scales within [0, 100] bounds (0.427ms)

Total Tests: 12 | Passed: 12 | Failed: 0
```

The Next.js production build generates 15 static and dynamic routes with **0 errors**:
```bash
$ npm run build
✓ Compiled successfully
✓ Generating static pages (15/15)
✓ Finalizing page optimization
```

---

## 11. How to Run the Application

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Start development server
npm run dev

# 4. Production build & start
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to access the platform.
