# Accessibility

*Brief item: "Accessibility: Implement features to make your application more accessible."*

The app is designed so it can be used with a **keyboard only**, with a **screen reader**, and by people with **low vision or colour blindness**. The goal is to follow [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/) principles. It hasn't been formally audited, so it isn't claimed as compliant (see "Known gaps" below).

## Page structure and navigation

| Feature | Why it helps | Where |
|---|---|---|
| **"Skip to main content" link**, the first thing reached by Tab | Keyboard and screen-reader users can jump past the header | `App.jsx`, `.skip-link` |
| **Landmarks**: `header`, `nav`, `main`, `aside` (city panel) and `footer`, plus a labelled region around the map | Screen-reader users can jump straight to a section | `App.jsx`, `Sidebar.jsx`, `MapView.jsx` |
| **Clear heading order** (h1 → h2 → h3) | Screen readers can list and jump between headings | All components |
| **The current tab is announced** (`aria-current="page"`) | Users know which section they're in | `App.jsx` |
| **Focus moves to the content when switching tabs** | Keyboard users don't have to Tab back through the header | `App.jsx` (`changeTab`) |
| **Page language set** (`lang="en"`) | Screen readers use the right pronunciation | `index.html` |

## Map

Interactive maps are one of the hardest things to make accessible, so the map is never the *only* way to get to the information.

| Feature | Why it helps |
|---|---|
| **City list under the map**: one button per city with its count, doing exactly the same as clicking a marker. The selected city is announced as "pressed" (`aria-pressed`) | Leaflet markers can't be reached with Tab, so keyboard and screen-reader users use the list instead |
| **Meaning never relies on colour alone**: marker *size* also shows the count, the exact number is in the tooltip and on the city button, and cities with no matches are grey | Helps people with colour blindness |
| **The legend has a text description** for screen readers ("colour runs from yellow for the fewest sightings to red for the most…") | The visual gradient bar is hidden from screen readers and replaced by this text |
| **The map region is labelled** and points keyboard users to the city list | Screen-reader users know what the map is and where the alternative is |
| **Scroll-wheel zoom is turned off** | Scrolling the page no longer gets "trapped" by the map (zoom with the +/− buttons, double-click or pinch) |

## City sidebar and chart

| Feature | Why it helps |
|---|---|
| The sidebar's content is **announced when it changes** (`aria-live="polite"`) | Screen-reader users hear the new city's details after picking one |
| **The close button has a descriptive label** ("Close London details") | It isn't just announced as "×" |
| **The trend chart has a text summary**: `role="img"` with a description such as "Bar chart of London sightings per year. Peak: 2021 with 10." The peak is also shown as visible text | Charts can't be read by screen readers on their own |
| **The chart's By year / Last 24 months toggle buttons announce which is selected** (`aria-pressed`) | Users know which view they're on |
| **The species breakdown always shows the number**, not just the bar | The bars are decorative and hidden from screen readers |

## Report form

| Feature | Why it helps |
|---|---|
| **Every input has a visible `<label>`**, with required fields marked * | Clear for everyone, and screen readers read the label |
| **Errors are tied to their field**: `aria-invalid` and `aria-describedby` link each field to its message, which starts with a ✕ symbol and is shown in bold | Screen readers announce the error with the field, and it isn't shown by red alone |
| **Error summary**: after a failed submit, focus moves to a summary at the top that is announced straight away (`role="alert"`) and links to each faulty field | Keyboard users don't have to hunt for what went wrong |
| **Success and server errors are announced** in the same live region | Screen-reader users hear the outcome |
| **Warnings don't block submission** (e.g. "No time given") | Gives guidance without getting in the way |
| **The character counter is announced** as you type notes | Screen-reader users know how close they are to the limit |
| **A "Not sure / unknown species" option** with a plain-English hint | Removes a difficult step: people don't need to know tick species to report one |
| **Dropdowns for city and species** instead of free text | Fewer typing errors and no guessing at the exact names |

## Map filters

| Feature | Why it helps |
|---|---|
| **Labelled From, To and Species inputs** inside a labelled search area (`role="search"`) | Screen readers can find and use the filters |
| An **invalid date range is announced** (`role="alert"`) and linked to the date fields, and the last valid filters stay applied | The map doesn't silently go blank |
| **The "Showing N sightings" summary is announced** whenever the results change | Screen-reader users hear the effect of a filter without looking at the map |

## Visual design

- **Visible focus outline** (3px teal) on everything you can click or type into, using `:focus-visible`.
- **Strong text contrast:** dark text on light backgrounds throughout, and alerts use dark text on pale coloured backgrounds rather than coloured text alone.
- **Reduced motion:** animations are turned off when the user's system asks for reduced motion (`prefers-reduced-motion`).
- **Responsive layout:** works at phone width (375px) with no sideways scrolling, and the side panel moves below the map on narrow screens.
- **Readable sizing:** text uses relative sizes, so browser zoom and larger default font sizes work.

## How it was checked

- Tested in the browser: the form's error, warning and success flows, the filters' invalid-range error, and the city list as an alternative to the markers.
- Checked that the accessibility attributes are actually present in the page (`lang`, landmarks, `aria-current`, the skip link).
- **Not yet done:** a full keyboard-only walkthrough (Tab order, skip link, focus on tab switch). That's worth doing before the demo.
- Checked the layout at a mobile size (375×812) for sideways scrolling.

## Known gaps / next steps

- **Not tested with a real screen reader** (VoiceOver, NVDA). That's the most important next step.
- **No automated audit** yet: add [axe-core](https://github.com/dequelabs/axe-core) checks to the frontend tests and run Lighthouse.
- **Map markers can't be reached with Tab.** The city list covers this today, but the planned searchable city picker (see [ARCHITECTURE.md](ARCHITECTURE.md#what-i-would-improve-with-more-time)) must stay fully keyboard-accessible.
- **Yellow markers on the light map tiles** have weaker contrast. Size, tooltips and the city list make up for it, but a darker outline would help.
- **The chart can't be explored point by point** with a keyboard. A "view as table" option would give the full data.
