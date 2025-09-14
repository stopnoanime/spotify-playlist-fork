# Spotify Playlist Fork

Fork, sync, and shuffle Spotify playlists. 
You can access it [here](https://stopnoanime.github.io/spotify-playlist-fork/).
Built with React + TypeScript + Vite.

## Features

- **Fork** - Create a copy of any playlist
- **Sync** - Update forked playlists with changes from the original
- **Shuffle** - Randomize playlist order

## How Sync Works

When you fork a playlist, the app stores tracking info in the playlist description:
```
FORK#<original_playlist_id>#<timestamp>
```

Sync only adds tracks that were added to the original playlist after the last sync timestamp. The playlist description is automatically updated with each sync to track the latest sync time.