# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/b1c4d704-acc6-460b-907a-08dd4c1cdb64

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/b1c4d704-acc6-460b-907a-08dd4c1cdb64) and start prompting.

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
- Supabase (Backend & Database)
- Agricultural Research Data (agridat package integration)

## Features

### AI-Powered Crop Recommendations
- **Agricultural Research Integration**: Recommendations based on data from the `agridat` R package
- **Soil Analysis**: Compare soil conditions against crop-specific optimal ranges
- **Weather-Based Risk Assessment**: Temperature and humidity analysis
- **Pest/Disease Prediction**: Crop-specific pest and disease risk assessment
- **Fertilizer Recommendations**: Precise amounts based on research data
- **Growing Calendars**: 4-week actionable plans aligned with research-proven growth cycles

### Data-Driven Insights
- Crop-specific optimal pH ranges (e.g., corn 5.8-7.0, wheat 6.0-7.5)
- Temperature requirements and growing periods
- Expected yields based on agricultural research
- Common pests and diseases for each crop
- Fertilizer needs in kg/ha (N, P, K)
- Soil preferences and amendments

See [AGRIDAT_INTEGRATION.md](./AGRIDAT_INTEGRATION.md) for details.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/b1c4d704-acc6-460b-907a-08dd4c1cdb64) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
