# Tenant Onboarding Feature

## Overview
A comprehensive, full-screen onboarding experience for new tenants to complete their profile requirements before accessing the main dashboard.

## Features

### 1. Emirates ID Verification
- Collects Emirates ID number and expiry date
- Allows file upload for Emirates ID document
- Validates if Emirates ID is missing or expired
- Updates tenant profile via PUT /tenants/self API

### 2. Emergency Contacts
- Collects at least one emergency contact
- Fields: Name, Relationship, Mobile, Email
- Submits via POST /tenants/emergency-contacts API

### 3. Household Members
- Adds co-occupants if lease allows multiple occupants
- Ensures household size matches lease occupancy requirements
- Collects: Name, Email, Phone, Relationship, Emirates ID, Nationality, Joining Date
- Submits via POST /tenants/household-members API
- Includes "Skip for Now" option for flexibility

## Files Created

### Context & State Management
- `lib/onboarding-context.tsx` - Manages onboarding state, steps, and progress

### Components
- `components/onboarding/emirates-id-step.tsx` - Emirates ID collection form
- `components/onboarding/emergency-contacts-step.tsx` - Emergency contact form
- `components/onboarding/household-members-step.tsx` - Household member form
- `components/onboarding/onboarding-complete.tsx` - Completion screen

### Pages
- `app/onboarding/page.tsx` - Main onboarding page with step navigation

## User Flow

1. User logs in
2. Dashboard layout checks if onboarding is needed:
   - Emirates ID missing or expired?
   - Emergency contacts missing?
   - Household members less than lease occupants?
3. If needed, user is redirected to `/onboarding`
4. User completes required steps in sequence:
   - Progress bar shows completion percentage
   - Step indicators show current position
   - Each step validates and submits data
5. Upon completion, user is redirected to dashboard
6. Onboarding flag stored in localStorage to prevent re-showing

## UI/UX Features

- **Full-screen experience** - No sidebar or navigation during onboarding
- **Beautiful gradient background** - Modern aesthetic
- **Progress tracking** - Visual progress bar and step indicators
- **Responsive design** - Works on mobile and desktop
- **Form validation** - Real-time validation with helpful error messages
- **Loading states** - Clear feedback during file uploads and submissions
- **Toast notifications** - Success/error feedback using Sonner
- **Smooth transitions** - Professional animations between steps

## Integration Points

### Dashboard Layout Updates
The `app/dashboard/layout.tsx` now includes:
- Onboarding requirement check
- Automatic redirect to `/onboarding` if incomplete
- localStorage flag to track completion

### API Endpoints Used
- `PUT /tenants/self` - Update tenant profile (Emirates ID)
- `POST /tenants/emergency-contacts` - Add emergency contact
- `POST /tenants/household-members` - Add household member
- `POST /files/upload` - Upload Emirates ID document
- `GET /tenants/my-details` - Fetch tenant data

## Customization

To modify onboarding requirements, edit the `determineRequiredSteps` function in `lib/onboarding-context.tsx`.

To add new steps:
1. Create a new step component in `components/onboarding/`
2. Add step logic to `determineRequiredSteps`
3. Add case to `renderStep` in `app/onboarding/page.tsx`

## Dependencies
- `date-fns` - Date formatting
- `sonner` - Toast notifications
- `lucide-react` - Icons
- All other dependencies are from shadcn/ui components
