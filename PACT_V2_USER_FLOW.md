# PACT V2 — User Flow (new features only)

Existing core flows (join, constraints, vote, brief) are unchanged and already tested. This covers only the 5 new items.

---

## Flow 1: Larger Circles (up to 20)

1. Organizer creates a circle, enters member count up to 20
2. If >5, organizer pass required (same single flat pass, no new tiers)
3. Invite sharing, constraints, voting all work identically — no new UI needed beyond removing the old "10" cap messaging

## Flow 2: In-Circle Chat

1. From Circle Hub, a new "Chat" tab/icon opens the circle's shared conversation
2. Any member can send a text message; all members see it in real time (Supabase Realtime, same pattern as existing consensus sync)
3. Chat is visible to the whole circle — this is intentionally NOT private like preferences/votes
4. When the organizer finalizes the trip (Trip Brief created), the full chat log is automatically archived into that circle's Memory Library as a read-only "Trip Chat Log" entry
5. Chat remains accessible from the circle's Memory Library after the trip, even if the circle is later archived

## Flow 3: Real Place/Hotel/Restaurant Recommendations

1. On the Ranked Matrix screen, each destination option gets a new "Explore this place" expandable section
2. Tapping it calls the Edge Function, which queries Google Places API for that destination (top-rated hotels, restaurants, attractions) and passes results to Gemini for a short narrated summary
3. Results show: place name, category, real rating, approximate price level, and a 1-2 sentence AI summary
4. Results are cached (per destination) in Supabase so repeat views don't re-call the API unnecessarily

## Flow 4: AI Storytelling for Unfamiliar Places

1. On the same "Explore this place" section, or on a Vault/Memories location tag, a "Tell me about this place" button appears
2. Tapping it sends a request to the existing AI Advisor Edge Function with a storytelling-specific prompt
3. Response streams into a chat-style bubble in a conversational, narrative tone (not a bullet list) — history, cultural context, what makes it worth visiting

## Flow 5: Review-Derived Safety/Practicality Notes

1. Folded into Flow 3's place cards — alongside the AI summary, a small "Good to know" line surfaces a real, review-sourced practical note (e.g. weather caveat, safety tip, booking advice)
2. This is generated from actual Google Places review text passed to Gemini for summarization — never an invented statistic
3. If no relevant review content exists for a place, this line is omitted entirely rather than showing a generic/fake note
