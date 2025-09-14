import type { Playlist, ForkInfo, StatusFunc } from "./types";
import { extractForkInfo, getAllPlaylistTracks, formatForkInfo, appendPlaylistTracks, sdk, deleteStartPlaylistTracks } from ".//utils";

export async function getUserPlaylists(status: StatusFunc): Promise<Playlist[]> {
    status("Fetching user playlists");
    const playlists = await sdk.currentUser.playlists.playlists();

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

export async function forkPlaylist(playlistId: string, playlistName: string, status: StatusFunc) {
    const tracks = await getAllPlaylistTracks(playlistId, status);

    status("Creating new playlist");
    const userId = (await sdk.currentUser.profile()).id;
    const newPlaylist = await sdk.playlists.createPlaylist(userId, {
        name: `${playlistName} - Forked`,
        description: formatForkInfo({ originalPlaylistId: playlistId, lastSyncDate: Date.now() }),
        public: false
    });

    await appendPlaylistTracks(newPlaylist.id, tracks, status);

    status("Playlist forked successfully");
}

export async function syncPlaylist(playlistId: string, forkInfo: ForkInfo, status: StatusFunc) {
    const allTracks = await getAllPlaylistTracks(forkInfo.originalPlaylistId, status);
    const newTracks = allTracks.filter(t => t.addedAt > forkInfo.lastSyncDate);

    await appendPlaylistTracks(playlistId, newTracks, status);

    status("Updating sync information");
    forkInfo.lastSyncDate = Date.now();
    await sdk.playlists.changePlaylistDetails(playlistId, {description: formatForkInfo(forkInfo)});

    status("Playlist synced successfully");
}

export async function shufflePlaylist(playlistId: string, status: StatusFunc) {
    const allTracks = await getAllPlaylistTracks(playlistId, status);

    // Shuffle using Fisher-Yates algorithm
    for (let i = allTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allTracks[i], allTracks[j]] = [allTracks[j], allTracks[i]];
    }

    // Add the shuffled tracks to the end of the playlist
    await appendPlaylistTracks(playlistId, allTracks, status);

    // Remove old tracks from the start of the playlist
    await deleteStartPlaylistTracks(playlistId, allTracks.length, status);

    status("Playlist shuffled successfully");
}