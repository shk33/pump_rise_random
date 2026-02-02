import os
import re
import shutil
import csv
import sys

csv_file_path = 'fillup/legacy.csv'
destination_folder = 'assets/songs/legacy'
source_base_path = "/media/eduardo/9A4C73E34C73B919/Users/Eduardo/Games/PumpSanity/Songs/05.EXTRA~PREX 3" # This will be updated by generate_png_list

# Ensure destination folder exists
os.makedirs(destination_folder, exist_ok=True)

# Helper function for consistent string cleaning (more refined)
def clean_string_for_match(text: str) -> str:
    # Convert to lowercase
    cleaned = text.lower()
    # Remove text in parentheses (e.g., "Song Title (Mix)")
    cleaned = re.sub(r'\s*\(.*?\)\s*', ' ', cleaned)
    # Remove text in brackets (e.g., "[Remix]")
    cleaned = re.sub(r'\s*\[.*?\]\s*', ' ', cleaned)
    # Remove common extra words that don't help identification (e.g., "mix", "version")
    cleaned = re.sub(r'\b(mix|version|ver|edit|remix)\b', '', cleaned)
    # Remove any non-alphanumeric characters, but keep spaces
    cleaned = re.sub(r'[^a-z0-9\s]', '', cleaned)
    # Replace multiple spaces with a single space and strip leading/trailing spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

# Function to calculate word overlap score (simple fuzzy match)
def calculate_word_overlap_score(str1: str, str2: str) -> float:
    words1 = set(word for word in str1.split() if len(word) > 1)
    words2 = set(word for word in str2.split() if len(word) > 1)
    
    if not words1 or not words2:
        return 0.0
    
    intersection = len(words1.intersection(words2))
    union = len(words1.union(words2))
    
    return (intersection / union) * 100 # Jaccard Index as percentage


# 1. Parse legacy songs data from CSV
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
    exit(1)

print(f"DEBUG: songs_data loaded: {len(songs_data)} songs.")


# 2. Build a list of available PNGs from the source directory
available_pngs_list = []
try:
    with open('fillup/png_files.txt', 'r') as f:
        png_paths = f.read().splitlines()
except FileNotFoundError:
    print(f"Error: fillup/png_files.txt not found. Please run 'generate_png_list.py' first.")
    exit(1)

print(f"DEBUG: png_paths loaded: {len(png_paths)} paths.")




for png_path in png_paths:
    if not png_path.startswith(source_base_path):
        continue

    # Extract folder name using os.path.dirname
    folder_full_path = os.path.dirname(png_path)
    folder_name = os.path.basename(folder_full_path) # e.g., "(1) 304 - With my Lover" or "(1) C01 - Beat of the War 2"

    # Regex to extract "Song Title" from folder_name
    # This regex is now more flexible to handle both numeric and alphanumeric song IDs
    match = re.search(r'\(\d+\)\s+([A-Z0-9]+)\s+-\s*(.*)', folder_name)
    if match:
        folder_title = match.group(2).strip() # Capture group 2 for the song title part
        
        # Check if the PNG file is likely a main banner
        base_png_name = os.path.basename(png_path)
        folder_song_id_match = re.search(r'\(\d+\)\s+([A-Z0-9]+)\s+-', folder_name) # Group 1 for song ID (e.g., C01)
        
        is_valid_banner = False
        if folder_song_id_match:
            song_number_in_folder = folder_song_id_match.group(1)
            # Check if the png filename starts with the song number and is not a specific excluded type
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
                'cleaned_title': clean_string_for_match(folder_title)
            })

print(f"DEBUG: available_pngs_list populated: {len(available_pngs_list)} entries.")


found_songs_count = 0
skip_all_mode = False

print("\n--- Matching Results ---")
# 3. Iterate through legacy songs, find matches, copy, and print status
for song in songs_data:
    if skip_all_mode:
        print(f"SKIPPED ALL: Skipping '{song['title']}' as 'skip all' was selected.")
        continue

    if song['has_banner']:
        print(f"SKIPPED (HAS BANNER): Banner for '{song['title']}' (ID: {song['id']}) already marked as 'has_banner'.")
        continue

    destination_filename = f"{song['id']}.png"
    destination_path = os.path.join(destination_folder, destination_filename)

    if os.path.exists(destination_path):
        print(f"SKIPPED (EXISTS): Banner for '{song['title']}' (ID: {song['id']}) already exists at '{destination_path}'.")
        continue

    potential_matches = []
    
    # Calculate scores for all potential banners
    for png_info in available_pngs_list:
        score = calculate_word_overlap_score(song['cleaned_title'], png_info['cleaned_title'])
        if score > 0: # Only consider matches with some overlap
            potential_matches.append({'png_info': png_info, 'score': score})
    
    # Sort by score in descending order
    potential_matches.sort(key=lambda x: x['score'], reverse=True)

    selected_match_info = None

    if not potential_matches or potential_matches[0]['score'] < 50: # No good matches or best match is too low
        print(f"NO MATCH: No strong banner found for legacy song: '{song['title']}' (Cleaned: '{song['cleaned_title']}')")
    elif len(potential_matches) == 1 or potential_matches[0]['score'] >= 90: # Only one strong match or very high confidence
        selected_match_info = potential_matches[0]['png_info']
        print(f"AUTO-MATCHED: Song='{song['title']}' (ID: {song['id']}) automatically matched to "
              f"Folder='{selected_match_info['folder_title_raw']}' (Score: {potential_matches[0]['score']})")
    else: # Multiple potential matches, prompt user
        print(f"\nMULTIPLE MATCHES for Song='{song['title']}' (ID: {song['id']}):")
        for i, match in enumerate(potential_matches):
            print(f"  {i+1}. Folder='{match['png_info']['folder_title_raw']}' (Score: {match['score']:.2f})")
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
                    selected_match_info = potential_matches[idx]['png_info']
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
print(f"Attempted to find banners for {len(songs_data)} legacy songs.")
print(f"Copied {found_songs_count} banners to '{destination_folder}'.")

# Do NOT write updated CSV back to fillup/legacy.csv as per user's request.
# The user will manually verify and update the CSV.