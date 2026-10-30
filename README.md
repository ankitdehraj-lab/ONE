# ONE WORLD — Full-stack MVP starter

A Next.js + Supabase foundation for the seven-network ONE WORLD concept:
Human, Action, Knowledge, Opportunity, Experience, Personal AI and Collective World.

## What is included

- Responsive Next.js application UI
- Supabase email/password sign-up and sign-in
- Profile creation trigger
- Live database-backed public posts
- Create/publish posts to a selected network
- Search across loaded posts
- Authenticated server-side AI endpoint using the OpenAI Responses API
- Supabase schema for profiles, posts, follows, comments, reactions, projects, opportunities, events, communities and private conversations/messages
- Row Level Security (RLS) policies and user-owned media storage policies
- Vercel-ready project structure

## Important: this is a deployable MVP foundation, not a fully launched social network

The live service integrations require your Supabase and OpenAI accounts and credentials. Messaging tables are included, but a complete chat inbox, conversation creation flow, realtime chat UI, moderation console, reporting workflow, email notifications, push notifications, billing, analytics and production security review remain to be built. The seven networks are represented in the UI and schema foundations; not every network has a full dedicated workflow yet.

## 1. Requirements

- Node.js 20.9 or newer
- A Supabase project
- An OpenAI API key if you want the AI assistant enabled
- GitHub account (optional, for deployment from GitHub)
- Vercel account (for hosting)

## 2. Configure Supabase

1. Create a project at https://supabase.com.
2. Open **SQL Editor** in your Supabase dashboard.
3. Paste and run `supabase/schema.sql`.
4. In **Project Settings → API**, copy the Project URL and anon/publishable key.
5. In **Authentication → URL Configuration**, set your Site URL to your deployment URL. During local development add `http://localhost:3000` to Redirect URLs.
6. In Authentication email settings, configure the confirmation email template/provider appropriate for your launch.

## 3. Configure environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY` (optional until AI is enabled)
- `OPENAI_MODEL` (defaults to `gpt-4.1-mini`)
- `NEXT_PUBLIC_APP_URL`

**Never expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` in client-side code.** The current browser app uses only the public anon key under RLS. Keep service-role key out of `.env.local` unless you add a server-only admin feature that genuinely needs it.

## 4. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To check a production build:

```bash
npm run build
npm start
```

## 5. Deploy to Vercel

1. Push this project to a private GitHub repository.
2. In Vercel choose **Add New → Project** and import the repository.
3. Add the environment variables from `.env.example` in Vercel Project Settings.
4. Deploy.
5. Add the deployed URL to Supabase Authentication → URL Configuration (Site URL and Redirect URLs).
6. Redeploy after changing environment variables.

## 6. MVP limitations and launch checklist

Before inviting real users, complete and test:

- Email verification, password reset, OAuth and account deletion
- Username/profile editing and avatar upload UI
- Follow/connect requests and blocking
- Comments and reactions backed by database operations
- Real conversation creation and realtime chat UI
- Project membership, milestones and collaboration workflow
- Event discovery and location permissions (opt-in only)
- Opportunity listings and application/contact flow
- Community creation, moderation and member management
- AI rate limits, abuse controls, privacy disclosures and cost limits
- Content reporting, moderation queue, spam prevention and age-appropriate safeguards
- Rate limiting on API routes, audit logging and security review
- Privacy policy, terms, community standards, data export/deletion process
- Accessibility, cross-browser, load and penetration testing
- Backups, monitoring, error tracking and incident response

## Product and safety notes

- Do not store sensitive personal information unless necessary and explicitly disclosed.
- Location must be opt-in, granular and revocable.
- Do not present user-generated claims, job listings or opportunities as verified without a verification process.
- AI output is advisory and should not automatically publish, message, hire, invest or make commitments on behalf of users.
- RLS is a critical layer; test policies with multiple accounts before launch.
