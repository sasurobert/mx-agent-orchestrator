# mx-agent-orchestrator

> **Hire expert AI agents, pay them fractions of a penny, and get aggregated results — all on MultiversX.**

The Agent Orchestrator is the user-facing product in the [MultiversX Agentic Commerce](https://multiversx.com) ecosystem. Users type a natural-language request. The orchestrator decomposes it into sub-tasks, discovers the best agents on the [MX-8004 Identity Registry](https://github.com/sasurobert/mx-8004), scores them by reputation/price/speed, constructs a batch crypto payment, and dispatches work — collecting and merging results into a single response.

---

## Architecture

```
User Request
    │
    ▼
┌──────────────┐
│  Decomposer  │  ← LLM-powered task breakdown
└──────┬───────┘
       ▼
┌──────────────┐
│  Discovery   │  ← Query Identity + Reputation Registries
└──────┬───────┘
       ▼
┌──────────────┐
│   Router     │  ← RICE scoring, cost optimization
└──────┬───────┘
       ▼
┌──────────────┐
│   Payment    │  ← x402 batch transaction construction
└──────┬───────┘
       ▼
┌──────────────┐
│  Aggregator  │  ← Merge multi-agent results via LLM
└──────┬───────┘
       ▼
   Final Response
```

## Features

- **Task Decomposition** — Break complex requests into atomic sub-tasks with dependency graphs (sequential, parallel, DAG)
- **Agent Discovery** — Find agents by skill, domain, reputation, price, and response time
- **RICE Scoring** — Rank agents using `(Reputation × 0.4) + (Price × 0.3) + (Speed × 0.2) + (Activity × 0.1)`
- **x402 Payments** — Construct batch micropayment transactions for MultiversX
- **Result Aggregation** — Merge outputs from multiple agents into a single coherent response
- **Reputation Feedback** — Auto-rate agents based on latency, quality, and user satisfaction
- **A2A Authentication** — Cryptographic challenge-response (nonce signing) for secure agent-to-agent communication
- **Wallet Integration** — MultiversX `sdk-dapp` v5 with xPortal, Extension, and WalletConnect support
- **Network Switch** — Toggle between Devnet, Testnet, and Mainnet with persisted state

## Tech Stack

| Layer | Technology |
|:--|:--|
| **Frontend** | Next.js 15, React 19, Vanta.js (Three.js), `@multiversx/sdk-dapp` v5 |
| **Backend** | Express, TypeScript, Google Gemini (LLM) |
| **Blockchain** | MultiversX, ESDT, x402 protocol, MX-8004 registries |
| **Testing** | Jest (65 unit/integration), Playwright (38 E2E) |
| **Auth** | `@multiversx/sdk-wallet` (ED25519 nonce signing) |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/sasurobert/mx-agent-orchestrator.git
cd mx-agent-orchestrator

# 2. Setup environment
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
# Edit both files with your API keys

# 3. Install & run backend
cd backend && npm install && npm run dev

# 4. Install & run frontend (in another terminal)
cd frontend && npm install && npm run dev

# 5. Run tests
cd backend && npm test          # 65 unit/integration tests
cd ../e2e && npm install && npx playwright test   # 38 E2E tests
```

## Project Structure

```
mx-agent-orchestrator/
├── backend/
│   ├── src/
│   │   ├── a2a/            # Agent-to-Agent authentication (nonce signing)
│   │   ├── aggregator/     # Result collection + LLM merging
│   │   ├── decomposer/     # LLM-powered task decomposition
│   │   ├── discovery/      # Agent search + filtering
│   │   ├── feedback/       # Reputation auto-rating
│   │   ├── llm/            # Gemini provider interface
│   │   ├── mx/             # MultiversX ABIs + blockchain service
│   │   ├── payment/        # x402 batch payment construction
│   │   ├── router/         # RICE scoring + cost optimization
│   │   └── types/          # Shared TypeScript interfaces
│   ├── scripts/
│   │   └── test_a2a.ts     # A2A authentication demo script
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── components/     # Sidebar, NetworkSwitch, DappInitializer
│   │   ├── hooks/          # useWallet
│   │   ├── lib/            # API client, initDapp
│   │   ├── discover/       # Agent discovery page
│   │   └── job/            # Job dashboard page
│   └── package.json
├── e2e/
│   ├── tests/              # 7 Playwright test suites (38 tests)
│   └── playwright.config.ts
├── .env.example            # Backend env template
└── .gitignore
```

## API Endpoints

| Method | Endpoint | Description |
|:--|:--|:--|
| `POST` | `/api/decompose` | Decompose a request into sub-tasks |
| `GET` | `/api/agents/discover` | Search agents by skill, reputation, price |
| `POST` | `/api/route` | Assign best agents to tasks (RICE scoring) |
| `POST` | `/api/payment/prepare` | Construct batch x402 payment |
| `POST` | `/api/payment/confirm` | Confirm signed payment |
| `POST` | `/api/feedback` | Submit agent ratings |

## A2A Authentication

The orchestrator authenticates with external agents using ED25519 cryptographic challenge-response:

```
1. POST /auth/nonce       → Request a nonce
2. Sign nonce with UserSigner (ED25519)
3. POST /auth/verify      → Exchange signature for Bearer token
4. Use Bearer token for all subsequent requests
```

Test it with: `cd backend && npm run test:a2a`

## Test Results

```
Backend:  65 passed, 9 suites  ✅
E2E:      38 tests (Desktop Chrome + Mobile iPhone 13)  ✅
Frontend: Production build clean  ✅
```

## Related Repositories

- [mx-8004](https://github.com/sasurobert/mx-8004) — On-chain Identity, Validation, Reputation, and Escrow contracts
- [mx-openclaw-template-solution](https://github.com/sasurobert/mx-openclaw-template-solution) — Agent builder template (backend + frontend + deploy)
- [mx-openclaw-content-machine](https://github.com/sasurobert/mx-openclaw-content-machine) — Example AI agent built with the template

## License

[MIT](LICENSE)
