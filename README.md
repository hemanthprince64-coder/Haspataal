# Haspataal
> The Unified Healthcare Operating System for India.

![CI Status](https://github.com/haspataal/haspataal/actions/workflows/ci.yml/badge.svg)

Haspataal is a comprehensive B2B2C healthcare monorepo that connects patients, doctors, and hospitals through a secure, high-performance platform. Built with Turborepo, Next.js, and Clean Architecture.

<<<<<<< Updated upstream
- `haspataal-in`: The main Next.js web application (Patient Portal, Hospital Admin, Super Admin).
- `haspataal-mobile`: The React Native (Expo) mobile application for patients.
- `workers`: Background job processors (e.g., notifications).
=======
## 🏗️ Architecture Overview
>>>>>>> Stashed changes

```mermaid
graph TD
    subgraph Client_Portals
        PP[Patient Portal]
        HP[Hospital HMS]
        AP[Admin Panel]
    end

<<<<<<< Updated upstream
### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis (for background jobs)
=======
    subgraph API_Layer
        NG[Nginx Proxy]
        GW[API Gateway]
    end
>>>>>>> Stashed changes

    subgraph Core_Services
        AS[Auth Service]
        MC[MedChat AI Service]
        DS[Dashboard Service]
    end

    subgraph Data_Persistence
        DB[(PostgreSQL)]
        RD[(Redis)]
    end

    PP & HP & AP --> NG
    NG --> GW
    GW --> AS & MC & DS
    AS & MC & DS --> DB
    DS --> RD
```

## 🚀 Quick Start

Get your local development environment running in 2 minutes:

<<<<<<< Updated upstream
- **Hospital Management**: Manage doctors, staff, and appointments.
- **Patient Portal**: Book appointments, view health records.
- **ABDM Integration**: ABHA linking and consent management (Sandbox).
- **Analytics**: Admin and Hospital dashboards powerd by Recharts and PostHog.

## 📚 Documentation

- [ABDM Integration Guide](./haspataal-in/ABDM_GUIDE.md)
=======
1. **Clone & Enter**:
   ```bash
   git clone https://github.com/haspataal/haspataal.git && cd haspataal
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env.local
   ```

3. **Launch Stack**:
   ```bash
   docker compose up -d && npm install && npm run dev
   ```

## 📂 Project Structure

- **`apps/`**: Next.js applications (Patient Portal, Hospital Admin, Marketing).
- **`packages/`**: Shared logic (DB, Auth, Types, Config).
- **`services/`**: Backend microservices (Auth, Gateway, MedChat).

## 📚 Resources

- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Onboarding, commit conventions, and development guidelines.
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)**: Detailed architectural decisions and ADRs.
- **[SECURITY.md](./docs/SECURITY.md)**: PHI handling and security protocols.

---
Built with ❤️ for the Indian Healthcare Ecosystem.
>>>>>>> Stashed changes
