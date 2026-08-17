# Validation Sprint 3: Silent Observation Protocol

## Objective
To determine if real hospital staff (Receptionists and Doctors) can complete their daily workflows in the Haspataal MVP with **zero formal training** and **minimal assistance**.

## Core KPI
**Staff should ask for help ≤ 1 time per workflow.**

## Phase 1: Silent Observation (Primary)

### Setup
1. Use an isolated UAT database environment. Ensure the database is clean but has basic master data seeded (e.g., Doctors, Pricing).
2. Seat the participant at a terminal. Provide them with their login credentials and a printed Task Sheet.
3. Observers should have a printed **Heatmap Template** to record metrics.

### Rules of Engagement
- **Say Only:** "Please complete these tasks as you normally would."
- **Do Not Explain:** Do not explain the UI, the workflow, or the architecture.
- **Do Not Point:** Do not point to buttons or menus.
- **Do Not Intervene:** Only intervene if the participant is completely blocked and cannot proceed after 2-3 minutes of trying, or if they explicitly give up.

### What to Record
- **Time to Complete:** Start a timer for each task.
- **Hesitations:** Note when a user pauses to search the screen for >5 seconds.
- **Wrong Clicks / Dead Ends:** Note when a user navigates to the wrong screen or clicks a button that does not do what they expected.
- **Help Requests:** Count the number of times the user explicitly asks "How do I do this?" or "Where is the button?"

## Phase 2: Think-Aloud Testing (Secondary)

If Phase 1 is completed quickly or a second session is available:
- Ask the participant to repeat a workflow but narrate their thoughts.
- Prompt: "Tell me what you're thinking as you look at this screen."
- Record their assumptions (e.g., "I expected the billing button to be green and at the bottom").

## Phase 3: Accessibility Review (Post-Observation)

After live sessions are complete, the technical team will perform a static audit of the UI focusing on:
- Keyboard-only navigation (Tab order).
- Focus visibility.
- Screen zoom (125-150%) for low-vision monitors.
- Form validation error clarity.

## Deliverables Checklist
After completing the sessions, compile the findings into the following deliverables:
- [ ] **Usability Report** (Completion rates, friction points, average times)
- [ ] **Training Report** (Areas needing onboarding, quick-reference guide suggestions)
- [ ] **UI Improvement Backlog** (Categorized by P1, P2, P3)
- [ ] **Pilot Recommendation** (Ready / Ready with minor tweaks / Needs redesign)
