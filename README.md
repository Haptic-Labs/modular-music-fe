# Modular Music

**⚠️ Alpha Release - This application is currently in alpha and under active development.**

A modular music automation platform that allows you to create custom workflows for automated Spotify playlist generation. Build modules that connect various Spotify sources, apply processing actions, and automatically generate playlists in your Spotify account.

## Features

- **Modular Workflow System**: Create custom modules that automate Spotify playlist generation
- **Spotify Integration**: Connect to your Spotify account to access playlists, recently played tracks, and more
- **Spotify Sources**: Pull data from various Spotify sources including recently played tracks, existing playlists, and saved music
- **Configurable Actions**: Apply different processing actions to filter and transform your music data
- **Playlist Generation**: Automatically create and update playlists in your Spotify account
- **Scheduling**: Schedule modules to run automatically and keep your playlists updated
- **Real-time Updates**: Live updates using WebSocket connections

## Prerequisites

Before running this application, make sure you have:

- Node.js (version 18 or higher)
- npm
- A Supabase account and project (see the [modular-music-be repository](https://github.com/Haptic-Labs/modular-music-be) for backend setup)
- Spotify Developer credentials (for music integration)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Haptic-Labs/modular-music-fe.git
cd modular-music-fe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: You'll need to set up a Supabase project and configure the database schema.

### 4. Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

To build the application for production:

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run gen-types` - Generate TypeScript types from Supabase schema

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Mantine v8 with Emotion styling
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Backend**: Supabase (Database + Auth + Edge Functions)

## Alpha Notice

This application is currently in alpha stage, which means:

- Features may be incomplete or subject to change
- Breaking changes may occur between updates
- Some functionality may be unstable
- Documentation may be limited
- Use in production environments is not recommended

## Contributing

As this is an alpha release, contribution guidelines are still being developed. Please reach out to the development team if you're interested in contributing.

## Support

For questions, issues, or feature requests during the alpha phase, please contact the development team directly.

## License

See the [LICENSE](LICENSE) file for details.
