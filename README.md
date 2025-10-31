# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## External API Requirements

This application uses real-time data for travel bookings, which requires subscriptions to several external APIs through the RapidAPI platform. You will need to use your RapidAPI account to subscribe to a plan (the free/basic tiers are sufficient) for each of the following APIs. Your single `RAPIDAPI_KEY` from your `.env` file will then grant access to all of them.

### Required APIs on RapidAPI:

1.  **Flight Data API**:
    *   **Purpose**: Provides real-time flight search functionality.
    *   **API Host**: `flight-data.p.rapidapi.com`

2.  **IRCTC One API**:
    *   **Purpose**: Used for Indian Railway train searches and finding station codes.
    *   **API Host**: `irctc1.p.rapidapi.com`

3.  **Booking.com API**:
    *   **Purpose**: Powers the hotel search and suggestion features.
    *   **API Host**: `booking-com.p.rapidapi.com`

Ensure you have subscribed to at least the free tier for each of these APIs on the RapidAPI marketplace for the application's travel planning features to function correctly.
