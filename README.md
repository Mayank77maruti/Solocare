# SoloCare

**AI-Powered Decentralized Healthcare Platform**

SoloCare is revolutionizing digital healthcare by merging **artificial intelligence**, **blockchain**, and **Web3 authentication** into a secure, transparent, and patient-centric medical assistant platform. Designed for patients, doctors, and administrators alike, SoloCare ensures trust, privacy, and efficiency at every step of the healthcare journey.

---

## Why SoloCare?

In today’s fast-evolving healthcare landscape, data security, accessibility, and intelligent decision-making are paramount. SoloCare answers this call by:

* Enabling **voice-guided medical triage** to streamline patient assessments
* Empowering administrators to **intelligently assign patients** to the right specialists
* Providing doctors a seamless interface to **upload and verify reports** with absolute confidence
* Ensuring **immutability and privacy** of medical records through blockchain technologies like Solana and IPFS
* Simplifying login with **secure, passwordless Web3 authentication using Gmail**
* Automatically generating **trusted, tamper-proof medical PDF reports**

---

## Architecture

![SoloCare Architecture](https://github.com/user-attachments/assets/08c4341f-dc0c-4fd4-9329-311f4e2bdbcf)

Our modular architecture allows each component to work in harmony, delivering a robust and scalable platform:

### Core Components

#### 1. Frontend (Next.js)

* Intuitive, role-based dashboards tailored for doctors, patients, and admins
* Secure Gmail-based login powered by Web3Auth
* Real-time access to patient queues, medical histories, and report uploads

#### 2. Backend (Node.js, Prisma, RenderDB)

* Manages user data and medical file metadata
* Drives AI-powered diagnostics and report generation
* Issues blockchain tokens for secure data validation
* Provides RESTful APIs for seamless frontend integration

#### 3. Blockchain Layer (Solana + IPFS)

* Stores access tokens, AI insights, and final reports immutably
* Leverages IPFS for decentralized and tamper-proof PDF storage
* Utilizes Solana blockchain to enforce secure, token-based access control

#### 4. AI Services

* Voice triage and symptom extraction via **Elysian Labs**
* Smart diagnosis and report drafting powered by **Gemini (Text Generation)**
* Automated medical test recommendations

#### 5. CI/CD & DevOps

* Automated testing and deployment with GitHub Actions
* Containerized microservices using Docker
* Reliable, scalable hosting on AWS EC2

---

## How It Works

1. **Patient uploads** a medical document (e.g., symptom report, scan).
2. **AI analyzes** the document, delivering preliminary recommendations.
3. **Admin assigns** the patient to an appropriate doctor.
4. **Doctor logs in** with Gmail via Web3Auth, reviews patient data, and uploads the final report.
5. Reports are **secured on IPFS and Solana blockchain** for integrity and privacy.
6. Authorized users **access reports** via secure token validation.

---

## Security & Privacy First

* Passwordless, **Gmail-based Web3 authentication** for enhanced security and user convenience.
* **Immutable medical records** via decentralized IPFS storage.
* Strict **token-based access controls** enforced by the Solana blockchain.
* Clearly defined **role-based access** to protect sensitive data.

---

## Technology Stack

| Layer       | Technologies                           |
| ----------- | -------------------------------------- |
| Frontend    | Next.js, Tailwind CSS, Web3Auth        |
| Backend     | Node.js, Prisma, RenderDB              |
| Blockchain  | Solana, IPFS                           |
| AI Services | Gemini (Text Generation), Elysian Labs |
| DevOps      | GitHub Actions, Docker                 |

---

## Quick Start

### Launch the platform with Docker Compose:

```bash
docker compose up
```

### Stop the services when done:

```bash
docker compose down
```

Access the app at [http://localhost:3000](http://localhost:3000)

> **Note:** Backend and blockchain services require environment variables and API keys configured in `.env` files. See respective directories for `env.example`.

---

## Get Involved

SoloCare is a collaborative effort involving:

* Full-stack developers
* AI/ML specialists
* Healthcare consultants
* DevOps engineers

Contributions and feedback are welcome. Reach out to learn how you can participate.

---
