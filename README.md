# Welcome to your Lovable project

## Roma Matches Data Pipeline

This project includes a zero-keys Roma matches data pipeline using OpenFootball community data:

### Features
- **No API Keys Required**: Uses open-source [OpenFootball](https://github.com/openfootball/italy) data
- **Automated Updates**: GitHub Actions workflow updates matches every 6 hours
- **Fallback System**: Falls back to Supabase data if OpenFootball is unavailable
- **Non-Live Data**: Accepts slower updates in exchange for no API dependencies

### Data Source
- **Source**: OpenFootball community-maintained Serie A data
- **Update Frequency**: Every 6 hours (configurable via GitHub Actions)
- **Limitations**: 
  - Not live/real-time (depends on community updates)
  - May lag behind actual match results
  - No minute-by-minute match status
  - Serie A men's matches only (no women's matches in OpenFootball)

### Files
- `scripts/updateRomaOpenfootball.ts` - Main update script
- `scripts/openfootball/parseSerieA.ts` - Parser for OpenFootball data format
- `.github/workflows/roma-openfootball.yml` - Automated update workflow
- `data/roma-matches.json` - Generated matches data
- `public/data/roma-matches.json` - Data accessible to frontend

### Manual Update
```bash
npx tsx scripts/updateRomaOpenfootball.ts
```

## Project info

**URL**: https://lovable.dev/projects/ad45f660-19d6-41e8-8460-2ddc6c86b1cc

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ad45f660-19d6-41e8-8460-2ddc6c86b1cc) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ad45f660-19d6-41e8-8460-2ddc6c86b1cc) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
