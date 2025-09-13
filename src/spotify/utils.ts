import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type { StatusFunc, TrackInfo } from "./types";

export const SPOTIFY_TRACK_LIMIT = Number(import.meta.env.VITE_SPOTIFY_TRACK_LIMIT)

export const sdk = SpotifyApi.withUserAuthorization(
    import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    [
        "playlist-read-private", "playlist-read-collaborative",
        "playlist-modify-private", "playlist-modify-public"
    ]
)

export function createForkInfo(originalPlaylistId: string) {
    return `FORK#${originalPlaylistId}#${Date.now().toString(36)}`;
}

export function extractForkInfo(description: string) {
    const match = description.match(/FORK#([0-9A-Za-z]+)#([0-9a-z]+)/);

    if (!match) return null;

    return {
        originalPlaylistId: match[1],
        lastSyncDate: parseInt(match[2], 36)
    };
}

export async function getAllPlaylistTracks(playlistId: string, status: StatusFunc) {
    const allTracks: TrackInfo[] = [];
    let offset = 0;

    while (true) {
        status(`Fetching playlist tracks (${allTracks.length} fetched)`);
        const tracks = await sdk.playlists.getPlaylistItems(
            playlistId,
            undefined,
            "items(added_at,track(uri))",
            import.meta.env.VITE_SPOTIFY_TRACK_LIMIT,
            offset
        );

        // No more tracks to process
        if (tracks.items.length === 0)
            return allTracks;

        offset += tracks.items.length;

        allTracks.push(
            ...tracks.items
                .filter(item => item.added_at && item.track && item.track.uri)
                .map(item => ({
                    uri: item.track.uri,
                    addedAt: new Date(item.added_at).getTime()
                }))
        );
    }
}

export async function appendPlaylistTracks(playlistId: string, tracks: TrackInfo[], status: StatusFunc) {
    const uris = tracks.map(track => track.uri);
    let offset = 0;

    while (offset < uris.length) {
        status(`Saving tracks to playlist (${offset} added)`);
        await sdk.playlists.addItemsToPlaylist(
            playlistId,
            uris.slice(offset, offset + SPOTIFY_TRACK_LIMIT)
        );

        offset += SPOTIFY_TRACK_LIMIT;
    }
}
