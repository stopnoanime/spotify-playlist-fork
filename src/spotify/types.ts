export type Playlist = {
    id: string;
    name: string;
    imageUrl: string | null;
    forkInfo: ForkInfo | null;
};

export type ForkInfo = {
    originalPlaylistId: string;
    lastSyncDate: number;
};

export type TrackInfo = {
    uri: string;
    addedAt: number;
};

export type StatusFunc = (message: string) => void;