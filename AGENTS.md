# AGENTS.md

# Purpose

This document defines the engineering standards, architecture rules, implementation workflow, coding conventions, and behavioral expectations for all AI coding agents working on this React Native Expo fintech application.

The project is a production-grade loan management mobile application with critical payment infrastructure and sensitive financial workflows.

Agents MUST follow this document strictly.

---

# Core Principles

The application must always prioritize:

1. Stability
2. Security
3. Maintainability
4. Scalability
5. Type safety
6. User experience
7. Performance
8. Accessibility
9. Production readiness
10. Predictability

Never prioritize "quick implementation" over clean architecture.

---

# Non-Negotiable Rules

## NEVER

Agents MUST NEVER:

- Use `any` in TypeScript
- Store sensitive data in AsyncStorage/MMKV
- Bypass type safety
- Duplicate business logic
- Hardcode API responses
- Hardcode colors/spacings repeatedly
- Create massive components
- Mix UI logic with API logic
- Put API calls directly inside screens
- Use inline styles excessively
- Ignore loading/error states
- Ignore accessibility
- Modify BillDesk core payment logic
- Break existing payment calculation logic
- Introduce unnecessary dependencies
- Use deprecated React Native APIs
- Use class components
- Ignore cleanup for listeners/timers
- Ignore memory leak risks
- Ignore offline states
- Ignore edge cases
- Commit secrets or keys
- Disable TypeScript strict mode

---

# ALWAYS

Agents MUST ALWAYS:

- Use strict TypeScript
- Create reusable components
- Use feature-based architecture
- Use centralized theme tokens
- Use React Query for server state
- Use Zustand for global state
- Use React Hook Form + Zod for forms
- Use repository/service patterns
- Add proper loading states
- Add proper empty states
- Add proper error states
- Add accessibility labels
- Add cleanup for side effects
- Optimize renders
- Write maintainable code
- Use consistent naming
- Add comments ONLY where necessary
- Think production-first
- Handle edge cases
- Keep components small and focused

---

# Project Architecture

The project uses clean scalable architecture.

## Folder Structure

src/
  api/
  services/
  repositories/
  hooks/
  store/
  components/
  features/
  screens/
  navigation/
  theme/
  constants/
  types/
  validation/
  localization/
  utils/

---

# Layer Responsibilities

## API Layer

Responsible ONLY for:
- Axios configuration
- Base HTTP requests
- Interceptors
- Retry logic
- Token injection

No business logic here.

---

## Services Layer

Responsible for:
- Raw API endpoint functions
- Request/response handling

No UI logic here.

---

## Repository Layer

Responsible for:
- Business data transformation
- Mapping API responses
- Domain-level abstractions

Repositories are the bridge between services and hooks.

---

## Hooks Layer

Responsible for:
- React Query hooks
- State composition
- Shared reusable logic

No direct UI rendering.

---

## Components Layer

Reusable UI building blocks only.

Examples:
- Buttons
- Inputs
- Cards
- Loaders
- Empty states
- Modals

Components must remain generic.

---

## Features Layer

Feature-specific modules.

Examples:
- auth/
- loans/
- payments/
- profile/

Feature modules may contain:
- components
- hooks
- types
- utils

---

# Navigation Rules

Use Expo Router v5.

Structure:

app/
  (auth)/
  (tabs)/
  loans/
  payments/
  profile/
  modal/

Rules:
- Use route groups properly
- Keep layouts centralized
- Avoid deeply nested routing
- Use typed navigation
- Handle auth guards cleanly

---

# TypeScript Standards

## Rules

- Strict mode enabled
- No implicit any
- Prefer interfaces for objects
- Prefer type aliases for unions
- Avoid type assertions unless necessary
- Never use `@ts-ignore` without explanation

---

## Naming Conventions

### Types

Use:
- `Loan`
- `PaymentHistory`
- `UserProfile`

Avoid:
- `LoanType`
- `DataType`

---

## Interfaces

Prefix props interfaces:

Example:
- `LoanCardProps`
- `ButtonProps`

---

## Enums

Use const objects or unions instead of enums where possible.

---

# Styling Rules

Use:
- NativeWind v4
- Tailwind utility classes
- Theme tokens

Avoid:
- Large inline style objects
- Hardcoded values

---

# Theme Rules

All colors/spacings/radii/shadows MUST come from theme tokens.

Never hardcode:
- hex colors
- spacing values
- font sizes
- border radius

---

# Component Standards

## Components MUST:

- Be reusable
- Be composable
- Support loading states where appropriate
- Support accessibility
- Support disabled states where appropriate
- Avoid unnecessary re-renders

---

## Component File Structure

ComponentName/
  index.tsx
  styles.ts
  types.ts

Optional:
- hooks.ts
- constants.ts

---

# Screen Standards

Screens should:
- Compose components
- Use hooks
- Avoid business logic
- Avoid direct API calls

Maximum responsibilities:
- Layout
- Orchestration
- Navigation

---

# State Management Rules

## React Query

Use for:
- Server state
- API caching
- Background refresh
- Pagination

---

## Zustand

Use for:
- Auth state
- App settings
- Temporary global UI state

Do NOT use Zustand for server data.

---

# React Query Standards

Every query MUST:
- Have proper query keys
- Handle loading
- Handle error
- Handle empty state
- Support retries where appropriate

Use:
- staleTime
- gcTime
- optimistic updates carefully

---

# Forms Standards

All forms MUST use:
- React Hook Form
- Zod validation

Validation MUST:
- Be centralized
- Be reusable
- Be translated

---

# Security Rules

## Sensitive Storage

Sensitive data ONLY in:
- Expo SecureStore

Never in:
- AsyncStorage
- MMKV
- Zustand persistence

---

## Authentication

Must support:
- Refresh tokens
- Token expiration handling
- Secure logout
- Biometric authentication
- PIN lock

---

# BillDesk Payment Rules (CRITICAL)

THIS IS THE MOST SENSITIVE PART OF THE APP.

Agents MUST NOT:
- Change payment flow logic
- Change required BillDesk params
- Modify callback structure
- Remove navigation monitoring
- Break return handling

Agents MUST:
- Preserve payment integrity
- Handle pending states
- Handle duplicate prevention
- Handle app backgrounding
- Handle Android back navigation
- Handle timeout recovery
- Handle interrupted payments safely

---

# Payment Calculation Rules (CRITICAL)

Existing business logic MUST remain IDENTICAL.

Includes:
- Interest calculations
- Minimum interest days
- Rounding rules
- Deduction rules
- Maximum payment limits
- Auction validations

Never "optimize" or simplify these calculations.

---

# Accessibility Standards

Every interactive element MUST:
- Have accessibility labels
- Have sufficient touch area
- Support screen readers

Text MUST:
- Support dynamic font scaling
- Maintain contrast compliance

---

# Performance Standards

Agents MUST optimize:
- Re-renders
- FlatLists
- Image loading
- Expensive calculations

Use:
- FlashList
- memoization
- lazy loading
- code splitting

Avoid:
- anonymous functions in render
- unnecessary state
- deeply nested trees

---

# Offline Support Rules

The app must gracefully support:
- No internet
- Slow internet
- Reconnection
- Cached data states

Never crash due to network loss.

---

# Error Handling Standards

Every async flow MUST handle:
- loading
- success
- failure
- retry

Never expose raw backend errors to users.

Use:
- user-friendly messages
- centralized error mapping

---

# Logging Rules

Development:
- Verbose logging allowed

Production:
- No sensitive logs
- No token logging
- No PII logging

---

# Dependency Rules

Before adding a dependency:
1. Check Expo compatibility
2. Check maintenance status
3. Check bundle size impact
4. Check community adoption
5. Check TypeScript support

Avoid unnecessary libraries.

---

# Code Quality Standards

Use:
- ESLint
- Prettier
- Husky
- lint-staged

Code MUST:
- Pass lint
- Pass type checks
- Build successfully

---

# Testing Standards

Critical flows MUST be tested.

Includes:
- Authentication
- Payments
- Loan calculations
- API handling

Preferred stack:
- Jest
- React Native Testing Library

Optional:
- Detox

---

# Documentation Standards

Every major module should include:
- Purpose
- Architecture notes
- Usage examples if needed

README must stay updated.

---

# Git Standards

Commit messages should follow:

type(scope): message

Examples:
- feat(auth): add biometric login
- fix(payments): resolve duplicate transaction issue
- refactor(loans): simplify query handling

---

# Implementation Workflow

Before implementing ANY feature:

1. Analyze requirements
2. Define types
3. Create API service
4. Create repository
5. Create React Query hooks
6. Create reusable components
7. Implement screen
8. Add loading/error states
9. Add accessibility
10. Optimize performance
11. Add tests
12. Verify edge cases

---

# UI/UX Expectations

The app should feel:
- Premium
- Fast
- Modern
- Clean
- Trustworthy
- Fintech-grade

Animations should be:
- Subtle
- Smooth
- Purposeful

Avoid:
- Excessive animations
- Flashy UI
- Clutter

---

# Fintech UX Expectations

The app handles financial operations.

Therefore:
- Users must NEVER feel uncertain
- Payment status must ALWAYS be clear
- Errors must ALWAYS explain next steps
- Sensitive actions must require confirmation
- Loading states must feel reliable

---

# Environment Rules

Use:
- development
- staging
- production

Configuration via:
- app.config.ts

Never hardcode:
- API URLs
- keys
- secrets

---

# AI Agent Behavioral Expectations

Agents MUST:
- Think step-by-step
- Think production-first
- Think long-term maintainability
- Avoid shortcuts
- Avoid assumptions
- Verify imports
- Verify Expo compatibility
- Verify TypeScript correctness
- Verify navigation correctness

Agents should prefer:
- clarity over cleverness
- maintainability over brevity
- predictability over abstraction

---

# Definition of Done

A task is NOT complete unless:

- Type-safe
- Lint-clean
- Tested
- Responsive
- Accessible
- Error-handled
- Loading states implemented
- Edge cases handled
- Performance reviewed
- Production-safe

---

# Final Rule

This is a real fintech production application.

Every implementation decision must prioritize:
- reliability
- trust
- safety
- maintainability
- scalability

over speed of implementation.