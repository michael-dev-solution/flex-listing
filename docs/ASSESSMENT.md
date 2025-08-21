# Flex Living - Developer Assessment Notes

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript (for types in API and UI)
- Tailwind CSS for rapid UI

## Key Decisions
- Normalize Hostaway reviews server-side in `GET /api/reviews/hostaway`.
- Persist manager approval in local JSON (in-memory for this assessment) with optimistic UI.
- Filters: rating, category, channel, date range, status (approved/hidden).

## API
- `GET /api/reviews/hostaway` → Fetches Hostaway (mocked) and returns normalized structure:
```json
{
  "status": "success",
  "listings": [
    {
      "listingId": "...",
      "listingName": "...",
      "channels": ["airbnb", "booking", "direct"],
      "stats": { "avgRating": 4.72, "count": 23 },
      "reviews": [
        {
          "id": "hostaway:7453",
          "source": "hostaway",
          "type": "host-to-guest",
          "status": "published",
          "rating": 4.8,
          "categories": [{"category":"cleanliness","rating":10}],
          "submittedAt": "2020-08-21T22:45:14Z",
          "guestName": "...",
          "listingName": "...",
          "channel": "airbnb",
          "approved": false
        }
      ]
    }
  ]
}
```
- `POST /api/reviews/approve` → Body `{ reviewId: string, approved: boolean }`

## Google Reviews
- Exploration via Places API Place Details fields `review` requires business to have reviews and API access enabled.
- For assessment: include `.env.local` placeholders and a thin client using `place_id` if provided.
- If not feasible, dashboard surfaces a note; code demonstrates how to plug in.

## UI
- Dashboard at `/dashboard`: per-listing cards with filters, sortable table, approve toggle.
- Property page at `/listing/[id]`: replicates Flex Living layout with approved reviews section.

## Local Setup
- Create `.env.local` with:
```
HOSTAWAY_ACCOUNT_ID=61148
HOSTAWAY_API_KEY=f94377ebbbb479490bb3ec364649168dc443dda2e4830facaf5de2e74ccc9152
GOOGLE_MAPS_API_KEY=your_key_here
```
- `npm install && npm run dev`

## Mock Data
- Located in `data/hostaway-reviews.json`. Used when sandbox returns empty.

## Notes
- In-memory approval store resets on restart; replace with DB in production. 