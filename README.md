# YesBroker — AI Estate OS

YesBroker is an AI-first real estate operating system built with Next.js and connected to a real backend stack including Supabase, Vapi, n8n, Gemini, Qdrant, and Twilio.

The application provides a real-estate marketplace, property discovery, AI voice assistance, negotiation, CRM, analytics, site-visit management, WhatsApp integration, and related dashboards.

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

Clone the repository:

```bash
git clone https://github.com/karthik-varma06/YesBroker_AI.git
```

Enter the project:

```bash
cd YesBroker_AI.git
```

Install dependencies:

```bash
npm install
```

## 3. Configure Environment Variables

The repository contains:

```text
.env.example
```

This file contains the required environment variable names only.

Create your local environment file from the example.

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
```

## 4. Run the Application

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 7. AI Voice Agent

Open:

```text
http://localhost:3000/voice-agent
```

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

## 8. Voice Agent Test Script

Use a fresh voice call and test the following scenarios.

### Test 1 — Property Requirement

Say:

> Hi, my name is Karthikeya. I'm looking for a 2BHK apartment in Whitefield, Bangalore with a budget of 85 lakhs and I will require a home loan.

Expected:

The agent should understand the requirement and collect the necessary contact information.

### Test 2 — Property Search

Say:

> Can you show me the best properties available in Whitefield within my budget and tell me their amenities?

Expected:

The agent should retrieve real property options through the property-search workflow and provide their relevant details and amenities.

### Test 3 — Price Negotiation

Say:

> I like the property, but instead of 85 lakhs I can only offer 78 lakhs. Is there any flexibility in the price?

Expected:

The agent should process the negotiation request through the negotiation workflow.

### Test 4 — Site Visit

Say:

> That sounds reasonable. I'd like to schedule a site visit on June 25th at 11:00 AM.

Expected:

The agent should process the site-visit request and collect any information required for booking.

### Test 5 — Human Handoff

Say:

> Before I decide, I'd like to speak with a senior property consultant directly.

Expected:

The agent should trigger the human handoff flow.

### Test 6 — End Conversation

Say:

> Thank you for all the information. That's all I needed today.

Expected:

The agent should end the conversation normally.

## 9. Backend Architecture

The main architecture is:

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

## 10. Property Data and Qdrant

Property data is stored in Supabase.

The Qdrant collection used for property retrieval is:

```text
real_estate_kb
```

The project contains:

```text
03_qdrant_sync.py
```

This script synchronizes property data from Supabase into Qdrant.

Run it only when the property knowledge base needs to be synchronized:

```bash
python 03_qdrant_sync.py
```









