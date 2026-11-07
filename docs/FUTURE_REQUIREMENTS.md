# Future Requirements

What we deliberately left out of this first version, and ideas for what to add next.

## From the brief (not built yet)

The brief asks for at least 2 features from each area; we built those (and a third for the map). These are the remaining options:

- **Photo upload with reports.** This would help most with sightings reported as **unknown species**: a professional, such as a vet reviewing reports, or the tick identifier below, could look at the photo, work out the species, and update the report.
- **"Get directions" and "Share" buttons** in the city panel.
- **A seasonal chart** showing which months of the year ticks are most active in a place.
- **UI/UX wireframes:** simple sketches of each screen (one of the brief's optional extras).

## New feature ideas

- **Photos in the species guide:** a real photo of each tick species on its card.
  - Free-to-use photos (from Wikimedia Commons) only exist for 2 of the 5 species. We decided not to use photos of a different, common tick as stand-ins, because that would be misleading in an identification guide.
  - We'd need properly licensed photos of all 5, for example from Elanco or tick experts, credited to the photographer.
- **Machine-learning tick identifier:** you take a photo of a tick, and the app suggests which species it probably is, how sure it is, and how risky that species is for pets and people.
  - **How:** start from an existing image-recognition model and train it further on lots of tick photos labelled by experts. Getting enough correctly labelled photos is the hardest part.
  - It would run on our Python backend, so it fits what we've already built.
  - The result would fill in the species on the report form as a *suggestion*. If it's unsure, it says "unsure – ask your vet". It would never claim to be a diagnosis.
  - Over time, reports confirmed by experts could be used to train it further (with permission, and checked by a person).
- **Searchable city picker:** the row of city buttons under the map works for 14 cities, but would get messy with every UK town. It would become one "Choose a city" button that opens a list with a search box. It must still work with a keyboard and screen reader, because it's the alternative to clicking the map.
- **Heat map instead of circles:** with 14 cities, circles work well. Once more towns and cities are added, they would overlap and crowd the map. A heat map would blend nearby sightings into smooth coloured areas (yellow → red, matching the current key), so busy regions stand out without the clutter.
  - It would look best once sightings have exact locations instead of city centres.
  - A heat map can't be clicked city by city or used with a keyboard, so it should be an option alongside the circles (a "Circles / Heat map" toggle), with the searchable city picker as the way to open a city's details.

## Needed before real public use

- **Logins and checking of reports** by a person before they go public, plus protection against spam (limiting how often someone can submit, and "I'm not a robot" checks).
- **Putting it online** (hosting), with tests running automatically on every change.
- **Exact locations** for sightings. Elanco's data only gives a city, so every sighting currently sits at the city centre.

More technical improvements, such as a bigger database and automatic data refreshes, are in [ARCHITECTURE.md](additional-requirements/ARCHITECTURE.md#what-i-would-improve-with-more-time).
