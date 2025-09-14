import { useEffect, useState } from 'react'
import './App.css'
import { forkPlaylist, getUserPlaylists, shufflePlaylist, syncPlaylist } from './spotify/api'
import { type Playlist } from "./spotify/types"

function App() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const [loadingStatus, _setLoadingStatus] = useState("Loading")
  const [loading, setLoading] = useState(true);
  const setLoadingStatus = (status: string) => {
    _setLoadingStatus(status);
    setLoading(true);
  }

  // The delay makes it possible to read the final loading status
  const stopLoading = () => setTimeout(() => setLoading(false), 300);

  const loadUserPlaylists = () => {
    getUserPlaylists(setLoadingStatus).then(res => {
      setPlaylists(res)
      stopLoading();
    })
  }

  useEffect(loadUserPlaylists, [])

  const sync = async (playlist: Playlist) => {
    await syncPlaylist(playlist.id, playlist.forkInfo!, setLoadingStatus);
    stopLoading();
  }

  const fork = async (playlist: Playlist) => {
    await forkPlaylist(playlist.id, playlist.name, setLoadingStatus);
    loadUserPlaylists();
  }

  const shuffle = async (playlist: Playlist) => {
    await shufflePlaylist(playlist.id, setLoadingStatus);
    stopLoading();
  }

  return (
    <>
      <div className={`overlay ${loading ? 'visible' : ''}`}>
        <div className='popup'>
          <div className='spinner'></div>
          <span className='loading-status'>{loadingStatus}</span>
        </div>
      </div>
      <h1>Spotify Playlists Fork</h1>
      <p>
        A simple tool to fork and sync your Spotify playlists
      </p>
      {playlists.length != 0 ? (
        <table>
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>NAME</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map(playlist => (
              <tr key={playlist.id}>
                <td>
                  {playlist.imageUrl ? (
                    <img
                      src={playlist.imageUrl}
                      className="cover-image"
                    />
                  ) : (
                    <div className="cover-image no-image">No Image</div>
                  )}
                </td>
                <td className='cell-name'>{playlist.name}</td>
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
      ) : !loading && (
        <p>No playlists found in your account.</p>
      )}
    </>
  )
}

export default App
