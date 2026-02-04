# Plan for Search Functionality

This document outlines the plan to implement a search functionality in the "Pump Rise: Random" application.

## 1. Add Search Entry Point

-   A new search icon will be added to the right side of the header on the `HomeScreen`.
-   Tapping this icon will navigate the user to the new Search screen.

## 2. Search Screen UI

-   Create a new screen component named `SearchScreen.tsx`.
-   This screen will feature a search bar at the top, allowing users to input song titles.
-   As the user types, a list of matching songs will be displayed below the search bar.
-   Each item in the list will show the song's title and artist, similar to the reference `search2.jpeg`.

## 3. Search Logic

-   The search functionality will filter the master `songs` array from `data/data.ts`.
-   The filtering will be based on the song's `title` property, matching it against the user's input in the search bar. The search should be case-insensitive.

## 4. Song Detail View

-   When a user taps on a song from the search results, they will be navigated to a new detail view for that song.
-   This view will display the following information, as referenced in `search3.jpeg`:
    -   **Header**: Song Title and Artist.
    -   **Channel**: Displayed as "Channel: {channel name}". No image will be shown next to the channel.
    -   **Singles**: A list of all available single charts/levels for the song.
    -   **Doubles**: A list of all available double charts/levels for the song.
-   There will be no "Active" text in this view.

## 5. Implementation Steps

1.  **Create `SearchScreen.tsx`**: Build the basic UI with a search input and a list view.
2.  **Implement Search Logic**: Add state management for the search query and the filtered results.
3.  **Create `SongDetailScreen.tsx`**: Build the UI to display the details of a selected song.
4.  **Add Navigation**:
    -   Update the navigation to include the `SearchScreen` and `SongDetailScreen`.
    -   Add a search icon to the `HomeScreen` header that navigates to the `SearchScreen`.
    -   Implement navigation from the search results list to the `SongDetailScreen`.