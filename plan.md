# Plan for "Pump It Up Random" App Redesign

This plan outlines the steps to redesign the "Pump It Up Random" app to match the provided visual specifications.

## TODO Checklist

- [x] **Analyze the request and the screenshots:** Carefully read the user's request and look at the provided images to understand the desired UI/UX.
- [x] **Install `styled-components`:** Install `styled-components` and its peer dependencies.
- [x] **Home Screen:**
    - [x] Update the existing `HomeScreen.tsx` component.
    - [x] Style the components using `styled-components` to match the screenshots.
- [x] **League Selection Modal:**
    - [x] Update the existing `LeagueSelectionModal.tsx` component.
    - [x] Style the components using `styled-components`, including the gradients for the buttons.
- [x] **Implement League Selection Logic:**
    - [x] When a league is selected in the `LeagueSelectionModal`, close the modal and open the `ResultsModal` with the selected league's songs.
- [x] **Adapt `utils/generator.ts` to new `Song` structure:**
    - [x] Update `Song` interface import from `data/data.ts`.
    - [x] Modify `pickSongs` to iterate through `song.levels.single` or `song.levels.double` and return augmented song objects with the specific picked level and type.
    - [x] Update `generateFullSession` to correctly call `pickSongs` for 'Single' and 'Double' types and populate results with augmented song objects.
    - [x] Adjust `groupedByLevel` to handle augmented song objects (song + selected level + type).
- [x] **Results Modal & List Item:**
    - [x] Update the existing `ResultsModal.tsx` component.
    - [x] Update the `ListItem` component to match the new design.
    - [x] Style the components using `styled-components`, paying close attention to the flexbox layout and text styles.
    - [x] Implement a custom divider between single and double sections.
- [x] **App Icon:**
    - [x] Update the `app.json` file to point to the new `icon.png` file.
- [x] **Navigation:**
    - [x] Update the navigation to show the new `HomeScreen` as the initial screen.
- [x] **Update `plan.md`:** Update the plan to reflect the changes.
- [x] **Create `fillup/legacy.md` with banner status:**
    - [x] Create `fillup` folder.
    - [x] Create `legacy.md` file.
    - [x] Populate `legacy.md` with table of legacy songs, marking all as `has banner = false`.
    - [x] Find legacy song banners, copy to `assets/songs/legacy/`, rename to Song ID, and update `fillup/legacy.md` to `has banner = true`.
- [ ] **Implement Song Banners in UI:**
    - [ ] Update `ResultsModal.tsx` and `ListItem` to display actual banner images and category icons instead of placeholders (using local assets for legacy songs).
    - [ ] For "Rise" and "Remix" categories, use appropriate placeholders if actual images are not provided.
