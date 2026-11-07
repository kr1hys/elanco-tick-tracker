# Accessibility

*Brief item: "Implement features to make your application more accessible."*

Accessibility means everyone can use the app, including people who:
- only use a **keyboard** (no mouse)
- use a **screen reader**, software that reads the page out loud for blind and partially sighted people
- have **low vision or colour blindness**
- find **complicated forms** hard

We followed the main ideas of WCAG 2.1 AA, the standard accessibility guidelines for websites. The app hasn't been formally tested against them, so we don't claim it fully meets them (see "What's still missing" below). The technical name for each feature is in brackets for anyone who wants it.

## Getting around the page

| What we did | Why it helps |
|---|---|
| A **"Skip to main content" link**, the first thing you reach when pressing Tab | Keyboard users can jump past the header |
| The page is split into **labelled sections**: header, navigation, main content, city panel, footer and the map (landmarks) | Screen-reader users can jump straight to the part they want |
| **Headings in a sensible order** | Screen readers can list the headings and jump between them |
| **The open tab is announced** (`aria-current`) | Screen-reader users know which page they're on |
| **Switching tabs moves you to the new content** | Keyboard users don't have to Tab back through the header |
| **The page's language is set to English** (`lang="en"`) | Screen readers pronounce the words correctly |

## The map

Maps are one of the hardest things to make accessible, so the map is **never the only way** to get the information.

| What we did | Why it helps |
|---|---|
| **A list of city buttons under the map** does exactly the same as clicking a circle, and says which city is selected | The map circles can't be reached with Tab, so keyboard and screen-reader users use the list instead |
| **Nothing relies on colour alone:** circle *size* shows the count too, the number appears on hover and on each city button, and cities with nothing are grey | Helps people with colour blindness |
| **The colour key is described in words** for screen readers | The colour bar itself can't be "read", so the words replace it |
| **The map has a label** that points keyboard users to the city list | Screen-reader users know what the map is and where the alternative is |
| **Scrolling doesn't zoom the map** | Scrolling the page doesn't get stuck on the map |

## The city panel and chart

| What we did | Why it helps |
|---|---|
| **New city details are read out** when you pick a city (`aria-live`) | Screen-reader users hear the update without hunting for it |
| **The close button is labelled** "Close London details" | It isn't just read out as "×" |
| **The chart has a written summary**, e.g. "Bar chart of London sightings per year. Peak: 2021 with 10." The peak is also shown on screen | Screen readers can't read a chart's bars |
| **The By year / Last 24 months buttons say which one is selected** | Users know which view they're on |
| **The species breakdown always shows the number**, not just a bar | The bars are only decoration |

## The report form

| What we did | Why it helps |
|---|---|
| **Every field has a visible label**, and required ones are marked * | Clear for everyone; screen readers read the label |
| **Each error is linked to its field** and starts with ✕ in bold (`aria-invalid`, `aria-describedby`) | Screen readers read the error with the field, and the error doesn't rely on red alone |
| **A summary of errors** appears at the top after a failed submit, is read out straight away, and links to each problem field | Keyboard users don't have to search for what went wrong |
| **"Saved" and server error messages are read out** | Screen-reader users hear the result |
| **Warnings don't stop you submitting** (e.g. "No time given") | Helpful hints without getting in the way |
| **The notes character counter is read out** | Users know how close they are to the limit |
| **A "Not sure / unknown species" option**, with a plain-English hint | You don't need to know tick species to report one |
| **Dropdowns for city and species** instead of typing | No spelling mistakes or guessing names |

## The map filters

| What we did | Why it helps |
|---|---|
| **Labelled From, To and Species fields** in a labelled search area | Screen readers can find and use them |
| **A date range that doesn't make sense is read out as an error**, and the previous filters stay | The map never goes blank without explanation |
| **The "Showing N sightings" line is read out** whenever it changes | Screen-reader users hear the effect of a filter |

## How it looks

- **A clear outline** shows where you are when using the keyboard.
- **Strong contrast:** dark text on light backgrounds, and messages use dark text on pale coloured boxes, not coloured text alone.
- **Less movement** for people who've asked their device to reduce motion.
- **Works on phones:** fits a phone screen (375px wide) with no sideways scrolling, and the city panel moves under the map.
- **Text can be enlarged** with the browser's zoom or bigger font settings.

## How it was checked

- Tested in the browser: the form's errors, warnings and success message, the filters' date error, and the city list as an alternative to the map.
- Checked that the accessibility features are really present in the page (language, sections, current tab, skip link).
- Checked the phone layout for sideways scrolling.
- **Not done yet:** a full run-through using only the keyboard.

## What's still missing

- **Not tested with a real screen reader** (such as VoiceOver on Mac or NVDA on Windows). This is the most important next step.
- **No automatic accessibility checker** yet (tools such as axe or Lighthouse).
- **The map circles can't be reached with Tab.** The city list covers this for now, and the planned searchable city picker (see [FUTURE_REQUIREMENTS.md](../FUTURE_REQUIREMENTS.md)) must also work with a keyboard.
- **Yellow circles on the light map** are harder to see. Size, numbers and the city list help, but a darker outline would be better.
- **The chart's bars can't be explored one by one** with a keyboard. A "view as table" option would fix this.
