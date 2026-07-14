# WebWorks Folder Stack Correction

## Interaction model
- Scroll-driven sticky stack.
- Every project renders exactly one tab: its own.
- Project 01 contributes the cyan tab, Project 02 contributes the black tab, and Project 03 contributes the pink tab.
- The three tabs appear together only because the sticky folders overlap; tabs from earlier projects must not be duplicated inside later projects.

## Corrected behavior
- There is no white vertical gap between consecutive project folders.
- All three projects share the same desktop sticky endpoint (`top: 110px`).
- The final pink project must fully reach that endpoint before the section releases.
- Existing cumulative tab positions and project dimensions remain unchanged.

## Responsive behavior
- Desktop and mobile both use zero inter-project margin.
- The existing desktop and mobile sticky offsets remain unchanged.
