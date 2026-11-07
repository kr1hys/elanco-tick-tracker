# Additional Requirements (Optional)

This folder covers the brief's **"Additional Requirements (Optional)"** section. Each item is listed below with where to find it.

| Brief item | Status | Where |
|---|---|---|
| **Documentation**: "a short document explaining your architecture decisions, how your system consumes and presents data, and things you would improve with more time" | ✅ Done | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Accessibility**: "implement features to make your application more accessible" | ✅ Done | Built into the app and explained in [ACCESSIBILITY.md](ACCESSIBILITY.md) |
| **UI/UX wireframes**: "simple wireframes to show your design and user experience thought process" | ❌ Not included | Not chosen for this MVP |

## What's in each document

- **[ARCHITECTURE.md](ARCHITECTURE.md)**
  - A system overview diagram.
  - How data is brought in from the Elanco API, including handling large datasets, duplicates, incomplete records and API failures.
  - Storage and API design, and error handling.
  - Frontend design choices and testing.
  - The full list of **future improvements**: image upload for unknown species, a machine-learning tick identifier, species photos, a searchable city picker, and more.
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)**
  - Every accessibility feature, grouped by area (page structure, map, sidebar and chart, report form, filters, visual design), with why each one helps.
  - How it was checked, and the known gaps.

The core requirements and scope decisions are in [../REQUIREMENTS.md](../REQUIREMENTS.md).
