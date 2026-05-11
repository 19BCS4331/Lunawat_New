# Lunawat Loan Management App

A production-grade React Native Expo loan management mobile application.

## Tech Stack

- **Framework**: Expo SDK 52
- **Language**: TypeScript
- **Routing**: Expo Router v5
- **State Management**: Zustand + React Query v5
- **Styling**: NativeWind v4 + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Storage**: Expo SecureStore + react-native-mmkv
- **Internationalization**: i18next (English, Hindi, Marathi)

## Project Structure

```
src/
  api/           # Axios configuration and base HTTP requests
  services/      # Raw API endpoint functions
  repositories/  # Business data transformation
  hooks/         # React Query hooks and shared logic
  store/         # Zustand global state
  components/    # Reusable UI components
  features/      # Feature-specific modules
  screens/       # Screen implementations
  navigation/    # Navigation configuration
  utils/         # Utility functions
  constants/     # App constants
  theme/         # Design system tokens
  types/         # TypeScript type definitions
  validation/    # Zod validation schemas
  localization/  # i18next translation files
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Run on Android:
```bash
npm run android
```

4. Run on iOS:
```bash
npm run ios
```

## Environment Variables

Create a `.env` file:
```
API_BASE_URL=https://myloan.slunawat.com/LoanAPI
ENV=development
```

## Build Configuration

- **Development**: Local development with hot reload
- **Staging**: Pre-production testing
- **Production**: Production builds via EAS

## API Documentation

See `API_DOCUMENTATION.md` for complete API reference.

## Agent Guidelines

See `AGENTS.md` for development standards and architecture rules.
