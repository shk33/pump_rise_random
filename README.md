# Pump Rise: Random

"Pump Rise: Random" is a mobile application designed for players of the arcade dance game "Pump It Up Rise". The app's primary function is to generate random song lists for training sessions, tailored to specific skill levels or "leagues". This helps players practice a wide variety of song charts without having to manually select them, ensuring a diverse and challenging gameplay experience.

The application features a clean, intuitive interface that allows users to quickly select a league and view a generated list of songs for both single and double charts, categorized by their difficulty level.

## Features

- **Random Song Generation:** The core feature of the app is its ability to generate a random set of songs for a training session based on pre-defined league rules.
- **League System:** The app includes a league system (from SSS to D) that represents different skill levels. Each league has its own set of rules for song generation, ensuring that the generated list is appropriate for the player's skill level.
- **Single and Double Charts:** The app generates song lists for both single and double charts, providing a comprehensive training tool for all types of players.
- **Detailed Song Information:** The generated list includes the song title, artist, category, and selected level, giving the player all the necessary information at a glance.
- **Song Search**: Users can search for songs by title.
- **YouTube Integration**: Tap on a song's level to search for it on YouTube.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- Expo CLI

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd pump_rise_random
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the App

-   To start the development server:
    ```bash
    npm start
    ```
-   To run on Android:
    ```bash
    npm run android
    ```
-   To run on iOS:
    ```bash
    npm run ios
    ```

## Building for Android

To trigger a new build for Android production using EAS, without releasing it:

```bash
eas build --platform android --profile production --no-submit
```

## Technical Overview

### Technologies Used

-   **React Native:** A popular framework for building cross-platform mobile applications using JavaScript and React.
-   **Expo:** A framework and platform for universal React applications, used to streamline the development and build process.
-   **TypeScript:** A statically typed superset of JavaScript that adds type safety to the codebase.
-   **Expo Router:** A file-based router for React Native and web applications, used for navigation.
-   **Styled Components:** A CSS-in-JS library for styling React and React Native components.
-   **React Native Paper:** A cross-platform UI component library for React Native, following Google's Material Design guidelines.

### Project Structure

-   `app/`: Contains all the screens and navigation setup for the app, following the Expo Router file-based routing convention.
-   `assets/`: Holds all static assets like images, fonts, and icons.
-   `components/`: Contains reusable React components used across different screens.
-   `data/`: Includes the core data of the application, such as the song list.
-   `utils/`: Contains utility functions, such as the random session generator and image loader.

### Import Aliases

This project utilizes import aliases to simplify module imports and maintain a cleaner codebase. The `@` symbol is configured as an alias for the project's root directory. This means that instead of using relative paths like `../data/data`, you can use absolute paths like `@/data/data`. This convention helps in avoiding broken imports when files are moved and improves readability.
