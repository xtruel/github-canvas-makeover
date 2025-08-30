# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ad45f660-19d6-41e8-8460-2ddc6c86b1cc

## Roma Matches Auto-Update Feature 🏟️

This project includes an automated AS Roma fixture update system that fetches match data from API-Football and updates the site automatically.

### Setup Instructions

To enable automatic match updates, you need to add an API key secret to your repository:

1. Get a free API key from [api-football.com](https://api-football.com)
2. Go to your repository Settings → Secrets and variables → Actions
3. Add a new repository secret named `API_FOOTBALL_KEY` with your API key as the value

**That's it!** The GitHub Actions workflow will automatically:
- Update match data daily at 6:00 AM UTC
- Refresh more frequently (every 30 minutes) during European evening hours (18:00-22:00 UTC)
- Handle rate limiting responsibly to work with free tier API limits
- Commit changes only when new data is available

### Without API Key

The site will build and work perfectly without the API key - it will simply use static placeholder data and gracefully fall back to any available legacy data sources.

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

### Manual Match Data Update

If you want to manually update Roma match data locally:

```sh
# Set your API key (get free key from api-football.com)
export API_FOOTBALL_KEY="your-api-key-here"

# Run the update script
npm run update-roma-matches
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
- API-Football for live match data

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ad45f660-19d6-41e8-8460-2ddc6c86b1cc) and click on Share → Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
