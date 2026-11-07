# Out of Scope

What was deliberately left out of the MVP, and why. Each item is a candidate for future work. More technical detail on the engineering items is in [additional-requirements/ARCHITECTURE.md](additional-requirements/ARCHITECTURE.md#what-i-would-improve-with-more-time).

## From the brief (not built)

The brief asks for at least 2 items from each frontend area. These are the remaining options we didn't pick:

- **Image upload with reports**, especially for sightings reported as **unknown species**. The photo would let a professional (e.g. a vet or parasitologist reviewing reports) or the ML identifier below work out the species, and the report would then be updated.
- **Directions / Share buttons** in the city panel.
- **Seasonal chart** of tick activity by month of the year for a location.
- **UI/UX wireframes** (one of the brief's optional extras).

## Future feature ideas

- **Photos in the species guide**: a real photo of the exact species on each tick profile card.
  - Freely licensed photos (Wikimedia Commons) exist for only 2 of the 5 species (*Ixodes canisuga*, *Ixodes frontalis*). Generic stand-in photos were rejected as misleading for an identification guide.
  - This would need properly licensed photos for all 5 (e.g. from Elanco or a parasitology partner), shown with photographer credits as the licence requires.
- **ML tick identifier**: users upload a photo of a tick, and a trained image-recognition model suggests the likely species, with a confidence score and that species' risk to pets and people (from the species guide). It would build on image upload above. Rough approach:
  - Adapt an existing pre-trained image model (e.g. a small CNN or vision transformer) by training it further on labelled tick photos. The main challenge is a good labelled dataset, ideally verified by experts or vets.
  - Serve it from the Python backend (e.g. `POST /api/identify`) so it fits the existing stack.
  - Show results as a *suggestion* with a confidence score, filling in the report form's species field. Low-confidence results say "unsure - ask your vet". It is never presented as a diagnosis.
  - Confirmed reports could become new training data over time (with consent and moderation).
- **Searchable city picker**: replace the row of city buttons under the map with a "Choose a city" button that opens a list with a search box, so the screen stays tidy once every UK city is covered. It must stay keyboard and screen-reader accessible.

## Needed before going to production

- **Authentication and moderation** of user reports, and abuse protection (rate limiting, CAPTCHA).
- **Deployment and hosting** (production server, CI, containers).
- **Exact locations** for sightings: the source data is city-level only, so markers sit at city centres.
