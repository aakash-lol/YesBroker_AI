# YesBroker — AI Estate OS

YesBroker is an AI-first real estate operating system built with Next.js and connected to a backend stack including Supabase, Vapi, n8n, Gemini, Qdrant, and Twilio.

The application provides a real-estate marketplace, property discovery, AI voice assistance, negotiation, CRM, analytics, site-visit management, WhatsApp integration, and related dashboards.

Built and maintained by [Aakash Tutlani](https://github.com/aakash-lol).

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Recharts
- Supabase
- Vapi
- n8n
- Google Gemini
- Qdrant
- Twilio / WhatsApp

## 1. Requirements

Install the following before starting:

- Node.js
- npm
- Git

You also need access to the required external services and credentials:

- Supabase
- Vapi
- n8n
- Qdrant
- Google Gemini
- Twilio / WhatsApp (when enabled)

## 2. Clone the Project

```bash
git clone https://github.com/aakash-lol/YesBroker_AI.git
cd YesBroker_AI
npm install
```

## 3. Configure Environment Variables

The repository contains `.env.example`, which lists the required variable names only (no values).

Create your local environment file from it.

**macOS / Linux**

```bash
cp .env.example .env.local
```

**Windows PowerShell**

```powershell
Copy-Item .env.example .env.local
```

Then fill in your own keys in `.env.local`. Never commit this file.

> Variables starting with `NEXT_PUBLIC_` are exposed to the browser. Keep secret keys (Supabase service role, Gemini, Qdrant, Twilio, n8n webhook) server-side only.

## 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. AI Voice Agent

Open [http://localhost:3000/voice-agent](http://localhost:3000/voice-agent).

The voice agent uses Vapi and connects to backend automation through n8n.

The voice flow supports:

- Requirement collection
- Lead capture
- Property search
- Property details
- Price negotiation
- Site-visit booking
- Human handoff
- Conversation completion

## 6. Voice Agent Test Script

Use a fresh voice call and test the following scenarios.

### Test 1 — Property Requirement

Say:

> Hi, my name is Aakash. I'm looking for a 2BHK apartment in Whitefield, Bangalore with a budget of 85 lakhs and I will require a home loan.

Expected: the agent understands the requirement and collects the necessary contact information.

### Test 2 — Property Search

Say:

> Can you show me the best properties available in Whitefield within my budget and tell me their amenities?

Expected: the agent retrieves property options through the property-search workflow and provides their details and amenities.

### Test 3 — Price Negotiation

Say:

> I like the property, but instead of 85 lakhs I can only offer 78 lakhs. Is there any flexibility in the price?

Expected: the agent processes the request through the negotiation workflow.

### Test 4 — Site Visit

Say:

> That sounds reasonable. I'd like to schedule a site visit on June 25th at 11:00 AM.

Expected: the agent processes the site-visit request and collects any information required for booking.

### Test 5 — Human Handoff

Say:

> Before I decide, I'd like to speak with a senior property consultant directly.

Expected: the agent triggers the human handoff flow.

### Test 6 — End Conversation

Say:

> Thank you for all the information. That's all I needed today.

Expected: the agent ends the conversation normally.

## 7. Backend Architecture

```text
Next.js Application
        |
        +---- Supabase
        |       └── Application data
        |
        +---- Vapi
        |       └── AI voice conversations
        |
        +---- n8n
        |       └── Backend automation / tools
        |
        +---- Gemini
        |       └── AI / embedding tasks
        |
        +---- Qdrant
        |       └── Vector property search
        |
        └---- Twilio
                └── WhatsApp integration
```

The frontend, external services, and automation workflows work together as one system.

## 8. Property Data and Qdrant

Property data is stored in Supabase. Vector property search uses a Qdrant collection named:

```text
real_estate_kb
```

Properties are embedded with Gemini (`gemini-embedding-001`, 768 dimensions) and synced from Supabase into Qdrant. The sync script is kept out of this public repository, so set up the collection separately with the same embedding settings.

## Author :3

**Aakash Tutlani** — [GitHub](https://github.com/aakash-lol) · [Portfolio](https://www.aakashtutlani.me/)