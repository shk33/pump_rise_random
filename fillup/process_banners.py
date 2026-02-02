import os
import re
import shutil
import csv
import sys

csv_file_path = 'fillup/songs.csv'
source_base_path = "" # This will be updated by the user
png_files_list_path = 'fillup/png_files.txt'

# Define possible destination folders
DESTINATION_FOLDERS = {
    'legacy': 'assets/songs/legacy',
    'fie': 'assets/songs/fie',
    'fex': 'assets/songs/fex', # Assuming a separate folder for FIESTA EX if needed
    'fie2': 'assets/songs/fie2', # Assuming a separate folder for FIESTA 2 if needed
    'pri': 'assets/songs/pri', # New folder for user's request
    'pri2': 'assets/songs/pri2', # New folder for user's request
    'xx': 'assets/songs/xx', # New folder for user's request
    'var': 'assets/songs/var', # New folder for user's request
    # Add other categories as needed
}

# Helper function for consistent string cleaning (more refined)
def clean_string_for_match(text: str) -> str:
    print(f"DEBUG_CLEAN: Initial text: '{text}'")
    # Convert to lowercase
    cleaned = text.lower()
    print(f"DEBUG_CLEAN: Lowercased: '{cleaned}'")
    # Remove text in parentheses (e.g., "Song Title (Mix)")
    cleaned = re.sub(r'\s*\(.*\)\s*', ' ', cleaned)
    print(f"DEBUG_CLEAN: After removing parentheses: '{cleaned}'")
    # Remove text in brackets (e.g., "[Remix]")
    cleaned = re.sub(r'\s*\[.*?\]\s*', ' ', cleaned)
    print(f"DEBUG_CLEAN: After removing brackets: '{cleaned}'")
    # Remove common extra words that don't help identification (e.g., "mix", "version")
    cleaned = re.sub(r'\b(mix|version|ver|edit|remix)\b', '', cleaned)
    print(f"DEBUG_CLEAN: After removing common words: '{cleaned}'")
    # Remove any non-alphanumeric characters, but keep spaces
    cleaned = re.sub(r'[^a-z0-9\s]', '', cleaned)
    print(f"DEBUG_CLEAN: After removing non-alphanumeric: '{cleaned}'")
    # Replace multiple spaces with a single space and strip leading/trailing spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    print(f"DEBUG_CLEAN: Final cleaned: '{cleaned}'")
    return cleaned

# Function to generate PNG file list (integrated from generate_png_list.py)
def _generate_png_list(source_directory: str, output_file: str):
    """
    Finds all PNG files in the specified source_directory and its subdirectories,
    and writes their absolute paths to the output_file.
    """
    if not os.path.isdir(source_directory):
        print(f"Error: Source directory '{source_directory}' not found. Please check the path and try again.")
        sys.exit(1)

    with open(output_file, 'w') as f:
        for root, _, files in os.walk(source_directory):
            for file in files:
                if file.lower().endswith('.png'):
                    f.write(os.path.join(root, file) + '\n')
    print(f"Successfully generated list of PNG files in '{output_file}' from '{source_directory}'.")


# Main script execution
if __name__ == "__main__":
    # --- USER INPUT SECTION ---
    # Get source_base_path from user
    while True:
        source_base_path = input("Enter the FULL path to the source folder (e.g., /media/../09.FIESTA EX): ").strip()
        if os.path.isdir(source_base_path):
            break
        else:
            print(f"Error: Directory '{source_base_path}' not found. Please enter a valid path.")

    # Get destination short name from user
    while True:
        dest_short_name = input(f"Enter the SHORT name of the destination folder ({', '.join(DESTINATION_FOLDERS.keys())}): ").lower().strip()
        if dest_short_name in DESTINATION_FOLDERS:
            current_destination_folder = DESTINATION_FOLDERS[dest_short_name]
            break
        else:
            print(f"Error: Invalid destination folder short name. Please choose from: {', '.join(DESTINATION_FOLDERS.keys())}")

    # Ensure the destination folder exists
    os.makedirs(current_destination_folder, exist_ok=True)

    # Reset and populate png_files_list_path
    _generate_png_list(source_base_path, png_files_list_path)

    # 1. Parse songs data from CSV
    songs_data = []
    headers = []
    try:
        with open(csv_file_path, 'r', newline='') as csvfile:
            csv_reader = csv.reader(csvfile)
            headers = next(csv_reader) # Read and store header row
            for row in csv_reader:
                if len(row) == 3: # Ensure row has expected number of columns
                    song_id, song_title, has_banner = row
                    songs_data.append({
                        'id': song_id,
                        'title': song_title.strip(), # Keep original title for display
                        'cleaned_title': clean_string_for_match(song_title), # Store cleaned title for matching
                        'has_banner': has_banner == 'true'
                    })
                else:
                    print(f"Skipping malformed CSV row: {row}")
    except FileNotFoundError:
        print(f"Error: {csv_file_path} not found. Please ensure it exists.")
        sys.exit(1)

    print(f"DEBUG: songs_data loaded: {len(songs_data)} songs.")


    # 2. Build a list of available PNGs from the source directory
    available_pngs_list = []
    try:
        with open(png_files_list_path, 'r') as f:
            png_paths = f.read().splitlines()
    except FileNotFoundError:
        print(f"Error: {png_files_list_path} not found. This should have been generated. Exiting.")
        sys.exit(1)

    print(f"DEBUG: png_paths loaded: {len(png_paths)} paths.")


    for png_path in png_paths:
        if not png_path.startswith(source_base_path):
            continue

        # Extract folder name using os.path.dirname
        folder_full_path = os.path.dirname(png_path)
        folder_name = os.path.basename(folder_full_path) # e.g., "(1) C01 - Beat of the War 2" or "1001 - X-Tree"

        # Simpler extraction of song ID from folder name (first alphanumeric sequence)
        song_id_match = re.search(r'([A-Z0-9]+)', folder_name)
        song_number_in_folder = song_id_match.group(1) if song_id_match else None

        if song_number_in_folder:
            folder_title = folder_name # Use full folder name as title for cleaning
            
            base_png_name = os.path.basename(png_path)
            
            is_valid_banner = False
            if base_png_name.startswith(song_number_in_folder) and base_png_name.lower().endswith('.png') and \
               "arrow" not in base_png_name.lower() and \
               "back" not in base_png_name.lower() and \
               "wide" not in base_png_name.lower() and \
               not re.search(r'\d+_b\.png$', base_png_name.lower()):
                is_valid_banner = True
            
            if is_valid_banner:
                available_pngs_list.append({
                    'full_path': png_path,
                    'folder_title_raw': folder_title,
                    'cleaned_title': clean_string_for_match(folder_title),
                    'song_number_in_folder': song_number_in_folder # Add this line
                })

    print(f"DEBUG: available_pngs_list populated: {len(available_pngs_list)} entries.")


    found_songs_count = 0
    skip_all_mode = False

    print("\n--- Matching Results ---")
    # 3. Iterate through songs, find matches, copy, and print status
    for song in songs_data:
        if skip_all_mode:
            print(f"SKIPPED ALL: Skipping '{song['title']}' as 'skip all' was selected.")
            continue

        destination_filename = f"{song['id']}.png"
        destination_path = os.path.join(current_destination_folder, destination_filename)

        if song['has_banner']:
            print(f"SKIPPED (HAS BANNER): Banner for '{song['title']}' (ID: {song['id']}) already marked as 'has_banner'.")
            continue

        if os.path.exists(destination_path):
            print(f"SKIPPED (EXISTS): Banner for '{song['title']}' (ID: {song['id']}) already exists at '{destination_path}'.")
            continue

        potential_matches = []
        
        # Prepare song_match_id (numerical part of the song ID if prefixed by dest_short_name)
        song_match_id_numeric = None
        if song['id'].startswith(dest_short_name + '-'):
            song_match_id_numeric = song['id'][len(dest_short_name) + 1:]

        # Get the longest word from the song's cleaned title
        song_longest_word = max(song['cleaned_title'].split(), key=len, default='')
        print(f"DEBUG_MATCH:   Calculated song_longest_word: '{song_longest_word}'")
        if not song_longest_word: # Skip if no words
            print(f"NO MATCH: No processable words in song title: '{song['title']}' (Cleaned: '{song['cleaned_title']}')")
            continue

        print(f"\nDEBUG_MATCH: Processing song: ID='{song['id']}', Title='{song['title']}', Cleaned='{song['cleaned_title']}', LongestWord='{song_longest_word}'")
        print(f"DEBUG_MATCH: song_match_id_numeric='{song_match_id_numeric}'")


        # Find all available PNGs whose cleaned title contains the song's longest word OR whose numerical ID matches
        for png_info in available_pngs_list:
            match_by_longest_word = (song_longest_word in png_info['cleaned_title'])
            print(f"DEBUG_REPR:   repr(song_longest_word): {repr(song_longest_word)}")
            print(f"DEBUG_REPR:   repr(png_info['cleaned_title']): {repr(png_info['cleaned_title'])}")
            match_by_numeric_id = (song_match_id_numeric and song_match_id_numeric == png_info['song_number_in_folder'])
            
            print(f"DEBUG_MATCH:   Checking PNG: Folder='{png_info['folder_title_raw']}', Cleaned='{png_info['cleaned_title']}', NumericID='{png_info['song_number_in_folder']}'")
            print(f"DEBUG_MATCH:     Condition: (LongestWord in CleanedTitle) {match_by_longest_word} || (NumericID match) {match_by_numeric_id}")

            if match_by_longest_word or match_by_numeric_id:
                potential_matches.append(png_info)
        
        selected_match_info = None

        if not potential_matches: # No matches found
            print(f"NO MATCH: No banner found for song: '{song['title']}' (Cleaned: '{song['cleaned_title']}', Longest Word: '{song_longest_word}')")
        elif len(potential_matches) == 1: # Only one match, auto-select
            selected_match_info = potential_matches[0]
            print(f"AUTO-MATCHED: Song='{song['title']}' (ID: {song['id']}) automatically matched to "
                  f"Folder='{selected_match_info['folder_title_raw']}' (Longest Word: '{song_longest_word}')")
        else: # Multiple potential matches, prompt user
            print(f"\nMULTIPLE MATCHES for Song='{song['title']}' (ID: {song['id']}', Longest Word: '{song_longest_word}'):")
            for i, match in enumerate(potential_matches):
                print(f"  {i+1}. Folder='{match['folder_title_raw']}' (Path: {match['full_path']})")
            print("  s. Skip this song")
            print("  a. Skip all remaining songs")
            
            while True:
                choice = input("Enter your choice (number, 's', or 'a'): ").lower().strip()
                if choice == 's':
                    print(f"SKIPPED: Song='{song['title']}' skipped by user.")
                    break
                elif choice == 'a':
                    skip_all_mode = True
                    print(f"SKIPPED ALL: All remaining songs will be skipped.")
                    break
                elif choice.isdigit():
                    idx = int(choice) - 1
                    if 0 <= idx < len(potential_matches):
                        selected_match_info = potential_matches[idx]
                        print(f"SELECTED: Song='{song['title']}' matched to "
                              f"Folder='{selected_match_info['folder_title_raw']}' by user.")
                        break
                    else:
                        print("Invalid number. Please try again.")
                else:
                    print("Invalid choice. Please enter a number, 's', or 'a'.")

        if selected_match_info:
            source_file_to_copy = selected_match_info['full_path']

            if os.path.exists(source_file_to_copy):
                shutil.copyfile(source_file_to_copy, destination_path)
                found_songs_count += 1
                print(f"COPIED: '{song['title']}' (ID: {song['id']}) -> "
                      f"'{selected_match_info['folder_title_raw']}' (Path: {source_file_to_copy})" 
                      f" copied to {destination_path}")
            else:
                print(f"WARNING: Source file not found for '{song['title']}' at {source_file_to_copy}")
        
    print(f"\n--- Summary ---")
    print(f"Attempted to find banners for {len(songs_data)} songs.")
    print(f"Copied {found_songs_count} banners to their respective folders.")

    # Do NOT write updated CSV back to fillup/songs.csv as per user's request.
    # The user will manually verify and update the CSV.