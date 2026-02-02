import re
import csv
import os

def extract_songs_from_data_ts(data_ts_path: str, category_prefix: str) -> list:
    """
    Extracts song data from data.ts for a specific category prefix.
    """
    songs = []
    try:
        with open(data_ts_path, 'r', encoding='utf-8') as f:
            content = f.read()

        song_block_match = re.search(r'export const songs: Song\[\] = \[(.*?)\n\];', content, re.DOTALL)
        if not song_block_match:
            print(f"WARNING: Could not find 'export const songs: Song[] = []' block in {data_ts_path}")
            return []
        
        songs_array_content = song_block_match.group(1)

        song_pattern = re.compile(r'\{\s*id:\s*"(?P<id>[^"]*)",\s*title:\s*"(?P<title>[^"]*)",\s*artist:\s*"(?P<artist>[^"]*)",\s*category:\s*"(?P<category>[^"]*)",.*?\}', re.DOTALL)
        
        for match in song_pattern.finditer(songs_array_content):
            song_id = match.group('id')
            if song_id.startswith(category_prefix): # Only extract if it starts with the specified prefix
                songs.append({
                    'id': song_id,
                    'title': match.group('title'),
                    'artist': match.group('artist'),
                    'category': match.group('category'),
                    'has_banner': 'false' # Default to false for new entries
                })
    except FileNotFoundError:
        print(f"Error: {data_ts_path} not found.")
    return songs

def overwrite_songs_csv(songs_to_write: list, songs_csv_path: str):
    """
    Overwrites the songs.csv with the provided list of songs.
    """
    updated_songs_list = []
    for song_data in songs_to_write:
        updated_songs_list.append({
            'ID': song_data['id'],
            'Song Title': song_data['title'],
            'Has Banner': 'false' # Always set to false when overwriting with new list
        })
    
    updated_songs_list.sort(key=lambda x: x['ID'])

    with open(songs_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['ID', 'Song Title', 'Has Banner']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames) # Corrected from DictReader to DictWriter
        writer.writeheader()
        writer.writerows(updated_songs_list)
    
    print(f"Successfully overwrote '{songs_csv_path}' with {len(songs_to_write)} songs.")

if __name__ == "__main__":
    DATA_TS_PATH = 'data/data.ts'
    SONGS_CSV_PATH = 'fillup/songs.csv'
    
    # Extract ONLY "fie2-" songs
    fie2_songs = extract_songs_from_data_ts(DATA_TS_PATH, 'fie2-')
    
    # Overwrite songs.csv with these songs
    overwrite_songs_csv(fie2_songs, SONGS_CSV_PATH)