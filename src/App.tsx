import { useEffect, useState } from 'react'
import './App.css'
import { forkPlaylist, getUserPlaylists, shufflePlaylist, syncPlaylist, type Playlist } from './spotify'

function App() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserPlaylists().then(res => {
      setPlaylists(res)
      setLoading(false)
    })
  }, [])

  const sync = async (playlist: Playlist) => {
    setLoading(true);
    await syncPlaylist(playlist.id, playlist.forkInfo!);
    setLoading(false);
  }

  const fork = async (playlist: Playlist) => {
    setLoading(true);
    await forkPlaylist(playlist.id, playlist.name);
    location.reload();
  }

  const shuffle = async (playlist: Playlist) => {
    setLoading(true);
    await shufflePlaylist(playlist.id);
    setLoading(false);
  }

  return (
    <>
      <h1>Spotify Playlists</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map(playlist => (
              <tr key={playlist.id}>
                <td>
                  {playlist.imageUrl ? (
                    <img
                      src={playlist.imageUrl}
                      style={{ width: 50, height: 50, objectFit: 'cover' }}
                    />
                  ) : (
                    <span>No image</span>
                  )}
                </td>
                <td>{playlist.name}</td>
                <td>
                  {playlist.forkInfo && (
                    <button onClick={() => sync(playlist)}>Sync</button>
                  )}
                  <button onClick={() => fork(playlist)}>Fork</button>
                  <button onClick={() => shuffle(playlist)}>Shuffle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}

export default App
