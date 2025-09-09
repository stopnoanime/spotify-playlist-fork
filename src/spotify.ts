import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export type Playlist = {
    id: string;
    name: string;
    imageUrl: string | null;
    forkInfo: ForkInfo | null;
}

export type ForkInfo = {
    originalPlaylistId: string;
    lastSyncDate: number;
}

export type TrackInfo = {
    uri: string;
    addedAt: number;
}

const sdk = SpotifyApi.withUserAuthorization(
    import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    [
        "playlist-read-private", "playlist-read-collaborative",
        "playlist-modify-private", "playlist-modify-public"
    ]
)

export async function getUserPlaylists(): Promise<Playlist[]> {
    const playlists = await sdk.currentUser.playlists.playlists();

    if (!playlists) return [];

    return playlists.items.map(p => {
        const imageUrl = p.images && p.images.length > 0 ? p.images[0].url : null;

        return {
            id: p.id,
            name: p.name,
            imageUrl: imageUrl,
            forkInfo: extractForkInfo(p.description)
        }
    })
}

export async function forkPlaylist(playlistId: string, playlistName: string) {
    const userId = (await sdk.currentUser.profile()).id;

    const tracks = await getAllPlaylistTracks(playlistId);

    const newPlaylist = await sdk.playlists.createPlaylist(userId, {
        name: `${playlistName} - Forked`,
        description: createForkInfo(playlistId),
        public: false
    });

    await appendPlaylistTracks(newPlaylist.id, tracks);
}

export async function syncPlaylist(playlistId: string, forkInfo: ForkInfo) {
    const allTracks = await getAllPlaylistTracks(forkInfo.originalPlaylistId);
    const newTracks = allTracks.filter(t => t.addedAt > forkInfo.lastSyncDate);

    await appendPlaylistTracks(playlistId, newTracks);
}

function createForkInfo(originalPlaylistId: string) {
    return `FORK#${originalPlaylistId}#${Date.now().toString(36)}`
}

function extractForkInfo(description: string) {
    const match = description.match(/FORK#([0-9A-Za-z]+)#([0-9a-z]+)/);

    if (!match) return null;

    return {
        originalPlaylistId: match[1],
        lastSyncDate: parseInt(match[2], 36)
    }
}

async function getAllPlaylistTracks(playlistId: string) {
    const allTracks: TrackInfo[] = [];
    let offset = 0;

    while (true) {
        const tracks = await sdk.playlists.getPlaylistItems(
            playlistId,
            undefined,
            "items(added_at,track(uri))",
            import.meta.env.VITE_SPOTIFY_TRACK_LIMIT,
            offset
        )

        // No more tracks to process
        if (tracks.items.length === 0)
            return allTracks;

        offset += tracks.items.length;

        allTracks.push(
            ...tracks.items
                .filter(item => item.track && item.track.uri)
                .map(item => ({
                    uri: item.track.uri,
                    addedAt: new Date(item.added_at).getTime()
                }))
        );
    }
}

async function appendPlaylistTracks(playlistId: string, tracks: TrackInfo[]) {
    const uris = tracks.map(track => track.uri);
    let offset = 0;

    while (offset < uris.length) {
        await sdk.playlists.addItemsToPlaylist(
            playlistId,
            uris.slice(offset, offset + import.meta.env.VITE_SPOTIFY_TRACK_LIMIT)
        );

        offset += import.meta.env.VITE_SPOTIFY_TRACK_LIMIT;
    }
}