import { useEffect, useState } from 'react'
import './App.css'
import { forkPlaylist, getUserPlaylists, shufflePlaylist, syncPlaylist } from './spotify/api'
import { type Playlist } from "./spotify/types"

function App() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  const [error, setError] = useState<string>("");
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
    }).catch(() => {
      setError("Failed to load user playlists");
    });
  }

  useEffect(loadUserPlaylists, [])

  const sync = async (playlist: Playlist) => {
    try {
      await syncPlaylist(playlist.id, playlist.forkInfo!, setLoadingStatus);
      stopLoading();
    } catch {
      setError("Failed to sync playlist");
    }
  }

  const fork = async (playlist: Playlist) => {
    try {
      await forkPlaylist(playlist.id, playlist.name, setLoadingStatus);
      loadUserPlaylists();
    } catch {
      setError("Failed to fork playlist");
    }
  }

  const shuffle = async (playlist: Playlist) => {
    try {
      await shufflePlaylist(playlist.id, setLoadingStatus);
      stopLoading();
    } catch {
      setError("Failed to shuffle playlist");
    }
  }

  return (
    <>
      <div className={`overlay ${(loading || error) ? 'visible' : ''}`}>
        {error && 
          <div className='popup'>
            <span className='error-status'>{error}</span>
            <p>Try reloading the page or checking your internet connection</p>
          </div>
        }
        {!error && 
          <div className='popup'>
            <div className='spinner'></div>
            <span className='loading-status'>{loadingStatus}</span>
          </div>
        }
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
