import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const sdk = SpotifyApi.withUserAuthorization(
    import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    [
        "playlist-read-private", "playlist-read-collaborative", 
        "playlist-modify-private", "playlist-modify-public"
    ]
)

export async function run() {
    const userId = (await sdk.currentUser.profile()).id;
    console.log("User ID:", userId);

    forkPlaylist(userId, "playlist_id", "Test playlist");
}

function getEncodedTime() {
    return Date.now().toString(36);
}

export async function forkPlaylist(userId: string, playlistId: string, forkName: string) {
    // Create a new playlist
    const newPlaylist = await sdk.playlists.createPlaylist(userId, {
        name: forkName,
        description: `FORK#${playlistId}#${getEncodedTime()}`,
        public: false
    });

    // Copy tracks from the original playlist to the new playlist
    let offset = 0;
    while (true) {
        const tracks = await sdk.playlists.getPlaylistItems(
            playlistId, 
            undefined,
            "items(track(uri))",
            import.meta.env.VITE_SPOTIFY_TRACK_LIMIT,
            offset
        )

        // No more tracks to process
        if(tracks.items.length === 0) break;

        offset += tracks.items.length;

        await sdk.playlists.addItemsToPlaylist(newPlaylist.id, 
            tracks.items.filter(i => i.track).map(i => i.track.uri)
        );
    }
}