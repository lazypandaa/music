import React, { useState, useEffect, useRef } from 'react';

// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
    :root {
      --background-color: #000000;
      --surface-color: #121212;
      --primary-text-color: #ffffff;
      --secondary-text-color: #b3b3b3;
      --accent-color: #1DB954;
      --hover-color: #282828;
      --scrollbar-thumb-color: #5a5a5a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'CircularSp', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--background-color);
      color: var(--primary-text-color);
      overflow: hidden;
    }
    ::-webkit-scrollbar { width: 12px; }
    ::-webkit-scrollbar-track { background: var(--surface-color); }
    ::-webkit-scrollbar-thumb {
      background-color: var(--scrollbar-thumb-color);
      border-radius: 20px;
      border: 3px solid var(--surface-color);
    }
    .music-player-app {
      display: grid;
      grid-template-columns: 250px 1fr;
      grid-template-rows: 1fr auto;
      grid-template-areas: "sidebar main-content" "player player";
      height: 100vh;
      width: 100vw;
    }
    .sidebar {
      grid-area: sidebar;
      background-color: #000;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .logo {
      color: var(--primary-text-color);
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .sidebar .nav-group, .sidebar .playlist-group { list-style: none; display: flex; flex-direction: column; gap: 15px; }
    .sidebar .nav-item {
      color: var(--secondary-text-color);
      font-weight: bold; cursor: pointer;
      transition: color 0.2s ease-in-out;
      display: flex; align-items: center; gap: 15px; font-size: 0.9rem;
    }
    .sidebar .nav-item:hover, .sidebar .nav-item.active { color: var(--primary-text-color); }
    .sidebar .nav-item.active { color: var(--accent-color); }
    .sidebar hr { border: none; height: 1px; background-color: var(--hover-color); margin: 10px 0; }
    .playlist-list {
        overflow-y: auto; flex-grow: 1; list-style: none; display: flex;
        flex-direction: column; gap: 10px; color: var(--secondary-text-color); font-size: 0.9rem; cursor: pointer;
    }
    .playlist-list li:hover { color: var(--primary-text-color); }
    .main-content { grid-area: main-content; overflow-y: auto; background: linear-gradient(to bottom, #222, #121212); }
    .header {
      padding: 16px 32px; background-color: rgba(0,0,0,0.5); position: sticky;
      top: 0; z-index: 5; display: flex; justify-content: space-between; align-items: center;
    }
    .search-form { display: flex; gap: 10px; flex-grow: 1; max-width: 400px; }
    .search-form input {
      width: 100%; padding: 12px 16px; border: none; border-radius: 50px;
      background-color: var(--hover-color); color: var(--primary-text-color); font-size: 0.9rem;
    }
    .search-form input:focus { outline: 2px solid var(--accent-color); }
    .user-profile {
        background-color: #333; color: white; padding: 8px 16px; border-radius: 20px;
        display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.9rem;
    }
    .loader { text-align: center; padding: 50px; font-size: 1.2rem; color: var(--secondary-text-color); }
    .view-title { font-size: 2rem; font-weight: bold; padding: 24px 32px; }
    .track-list-container { padding: 0 32px; }
    .track-list { list-style: none; }
    .track-header, .track-item {
      display: grid; grid-template-columns: 40px 4fr 3fr 2fr 100px; gap: 16px;
      align-items: center; padding: 12px; border-radius: 4px; transition: background-color 0.2s ease-in-out;
    }
    .track-header { color: var(--secondary-text-color); font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 8px; }
    .track-item:hover { background-color: var(--hover-color); }
    .track-item .track-number .index { display: block; }
    .track-item .track-number .play-button { display: none; }
    .track-item:hover .track-number .index { display: none; }
    .track-item:hover .track-number .play-button { display: block; }
    .track-number { position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; color: var(--secondary-text-color); cursor: pointer; }
    .track-number .play-button { background: none; border: none; color: white; cursor: pointer; }
    .track-number .play-button svg { fill: currentColor; }
    .track-info { display: flex; align-items: center; gap: 16px; }
    .track-album-art { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
    .track-title { font-weight: 500; }
    .track-artist, .track-album, .track-duration { font-size: 0.9rem; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track-actions { display: flex; align-items: center; justify-content: space-between; color: var(--secondary-text-color); }
    .favorite-btn { background: none; border: none; color: inherit; cursor: pointer; }
    .favorite-btn.favorited { color: var(--accent-color); }
    .favorite-btn:hover { color: white; }
    .track-item.playing .track-title { color: var(--accent-color); }
    .track-item.playing .track-number .index { display: none; }
    .track-item.playing .track-number .play-button { display: block; color: var(--accent-color); }
    .player-bar {
      grid-area: player; background-color: var(--surface-color); border-top: 1px solid #282828;
      height: 90px; display: grid; grid-template-columns: 1fr 2fr 1fr;
      align-items: center; padding: 0 16px; z-index: 10;
    }
    .player-track-info { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .player-track-info img { width: 56px; height: 56px; border-radius: 4px; }
    .player-track-title { font-weight: 500; font-size: 0.9rem; }
    .player-track-artist { font-size: 0.75rem; color: var(--secondary-text-color); }
    .player-controls { display: flex; justify-content: center; align-items: center; gap: 16px; }
    .control-button { background: none; border: none; color: var(--secondary-text-color); cursor: pointer; transition: all 0.2s ease; position: relative; }
    .control-button.active { color: var(--accent-color); }
    .control-button:hover { color: var(--primary-text-color); }
    .control-button.play { background-color: var(--primary-text-color); color: #000; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .control-button.play:hover { transform: scale(1.05); background-color: white; }
    .control-button svg { fill: currentColor; }
    .control-button.play svg { height: 20px; width: 20px; }
    /* New Player View Styles */
    .player-view-container { padding: 24px 32px; }
    .player-view-header { display: flex; gap: 24px; align-items: flex-end; margin-bottom: 24px; }
    .player-view-album-art { width: 232px; height: 232px; min-width: 232px; border-radius: 8px; box-shadow: 0 4px 60px rgba(0,0,0,.5); }
    .player-view-details { display: flex; flex-direction: column; justify-content: flex-end; }
    .player-view-details .type-label { font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
    .player-view-details .track-title-main { font-size: 4rem; font-weight: 900; line-height: 1.1; margin: 0.08em 0; }
    .player-view-details .artist-album-info { color: var(--secondary-text-color); }
    .player-view-controls-bar { display: flex; align-items: center; gap: 24px; padding: 24px 0; }
    .player-view-controls-bar .play-button-main { background-color: var(--accent-color); border: none; border-radius: 50%; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; }
    .player-view-controls-bar .play-button-main:hover { transform: scale(1.05); }
    .player-view-controls-bar .play-button-main svg { width: 24px; height: 24px; }
    .player-view-controls-bar .favorite-btn { color: var(--secondary-text-color); }
    .player-view-controls-bar .favorite-btn:hover { color: white; }
    .player-view-progress-container { width: 100%; max-width: 500px; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--secondary-text-color); margin-top: -10px; }
    .player-view-progress-wrapper { flex-grow: 1; height: 4px; background: rgba(255,255,255,0.3); border-radius: 2px; cursor: pointer; }
    .player-view-progress-bar { height: 100%; background: white; border-radius: 2px; width: 0%; }

    /* Auth Modal Styles */
    .auth-modal-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex; align-items: center; justify-content: center; z-index: 200;
    }
    .auth-modal {
        background-color: var(--surface-color); padding: 40px; border-radius: 8px;
        width: 90%; max-width: 400px; text-align: center;
    }
    .auth-modal h2 { margin-bottom: 20px; }
    .auth-form { display: flex; flex-direction: column; gap: 15px; }
    .auth-form input {
        padding: 12px; border: 1px solid #555; border-radius: 4px;
        background-color: var(--hover-color); color: white;
    }
    .auth-form button {
        padding: 12px; border: none; border-radius: 50px; background-color: var(--accent-color);
        color: white; font-weight: bold; cursor: pointer; transition: transform 0.2s;
    }
    .auth-form button:hover { transform: scale(1.03); }
    .auth-modal .switch-auth {
        margin-top: 20px; color: var(--secondary-text-color);
        font-size: 0.9rem;
    }
    .auth-modal .switch-auth span { color: white; cursor: pointer; text-decoration: underline; }
    .auth-error { color: #ff4d4d; margin-top: 15px; font-size: 0.9rem; }
  `}</style>
);
// --- SVG Icons ---
const PlayIcon = () => (<svg role="img" height="24" width="24" viewBox="0 0 24 24"><path d="M7.05 3.606l13.49 7.788a.7.7 0 010 1.212L7.05 20.394A.7.7 0 016 19.788V4.212a.7.7 0 011.05-.606z"></path></svg>);
const PauseIcon = () => (<svg role="img" height="24" width="24" viewBox="0 0 24 24"><path d="M5.7 3a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7H5.7zm10 0a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7h-2.6z"></path></svg>);
const NextIcon = () => (<svg role="img" height="16" width="16" viewBox="0 0 16 16"><path d="M11 3v4.119L3 2.5v11l8-4.619V13h2V3z"></path></svg>);
const PrevIcon = () => (<svg role="img" height="16" width="16" viewBox="0 0 16 16"><path d="M13 2.5L5 7.119V3H3v10h2V8.881l8 4.619z"></path></svg>);
const HomeIcon = () => <svg role="img" height="24" width="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9.277a2 2 0 0 1 1-1.732l7.5-4.33z"></path></svg>;
const SearchIcon = () => <svg role="img" height="24" width="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>;
const LibraryIcon = () => <svg role="img" height="24" width="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"></path></svg>;
const PlusIcon = () => <svg role="img" height="24" width="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>;
const HeartIcon = ({ filled, size = 16 }) => filled ? <svg role="img" height={size} width={size} viewBox="0 0 24 24"><path fill="currentColor" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> : <svg role="img" height={size} width={size} viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>;
const UserIcon = () => <svg role="img" height="16" width="16" viewBox="0 0 16 16"><path fill="currentColor" d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>;
const LogoIcon = () => <svg role="img" height="40" width="40" viewBox="0 0 1134 1134"><path fill="#1ED760" d="M567 1134C253.86 1134 0 880.14 0 567S253.86 0 567 0s567 253.86 567 567-253.86 567-567 567zm254.5-317.9a26.73 26.73 0 0 1-38.16 2.08c-148.8-91.32-334.32-111.96-553.68-61.2a26.73 26.73 0 0 1-30.24-34.68c5.4-23.76 29.16-32.4 34.68-30.24 233.76 54 433.8-22.32 597.24-121.32a26.73 26.73 0 0 1 28.08 36.36zm55.8-150.3a33.42 33.42 0 0 1-47.52 2.64C720.66 601.86 493.5 577.8 290.1 631.5a33.42 33.42 0 0 1-37.8-42.36c6-26.52 36.36-35.4 42.36-37.8 219-58.8 466.56-31.08 658.92 84.48a33.42 33.42 0 0 1 2.52 47.64zm8.28-157.5c-204.6-69.24-540.36-61.92-758.28 22.44a39.33 39.33 0 1 1-28.92-70.56c245.16-91.8 610.92-80.28 849.36 1.8a39.33 39.33 0 0 1-31.32 68.64z"></path></svg>;

// --- Helper Components ---
const AuthModal = ({ onClose, onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const API_URL = 'http://localhost:3001';

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
        try {
            const response = await fetch(API_URL + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Something went wrong');

            if (isLogin) {
                onAuthSuccess(data);
            } else {
                alert('Sign up successful! Please sign in.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal">
                <button onClick={onClose} style={{position: 'absolute', top: 15, right: 15, background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor:'pointer' }}>&times;</button>
                <h2>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input type="text" name="username" placeholder="Username" required onChange={handleChange} />
                    <input type="password" name="password" placeholder="Password" required onChange={handleChange} />
                    <button type="submit">{isLogin ? 'Sign In' : 'Sign Up'}</button>
                </form>
                {error && <p className="auth-error">{error}</p>}
                <p className="switch-auth">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Sign In'}</span>
                </p>
            </div>
        </div>
    );
};

const PlayerView = ({ track, albumTracks, isPlaying, progress, duration, onPlayPause, onSelectTrack, isFavorited, toggleFavorite, formatDuration }) => {
    const albumArt = track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '600x600') : '';
    const releaseYear = new Date(track.releaseDate).getFullYear();

    const formatTime = (secs) => {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="player-view-container">
            <div className="player-view-header">
                <img src={albumArt} alt={track.collectionName} className="player-view-album-art" />
                <div className="player-view-details">
                    <span className="type-label">Song</span>
                    <h1 className="track-title-main">{track.trackName}</h1>
                    <div className="artist-album-info">
                        <span>{track.artistName} • {track.collectionName} • {releaseYear}</span>
                    </div>
                </div>
            </div>
             <div className="player-view-controls-bar">
                <button className="play-button-main" onClick={onPlayPause}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button className={`favorite-btn ${isFavorited ? 'favorited' : ''}`} onClick={() => toggleFavorite(track)}>
                    <HeartIcon filled={isFavorited} size={32} />
                </button>
            </div>
            <div className="player-view-progress-container">
                <span>{formatTime(progress)}</span>
                <div className="player-view-progress-wrapper">
                    <div className="player-view-progress-bar" style={{ width: `${(progress / duration) * 100 || 0}%` }}></div>
                </div>
                <span>{formatTime(duration)}</span>
            </div>
            <div className="track-list-container" style={{padding: '24px 0'}}>
                <ul className="track-list">
                    <li className="track-header" style={{gridTemplateColumns: '40px 1fr 100px'}}>
                        <div>#</div>
                        <div>Title</div>
                        <div style={{textAlign: 'right'}}>Time</div>
                    </li>
                    {albumTracks.map((albumTrack, index) => {
                         const isCurrent = track && track.trackId === albumTrack.trackId;
                         return (
                            <li key={albumTrack.trackId} className={`track-item ${isCurrent && isPlaying ? 'playing' : ''}`} style={{gridTemplateColumns: '40px 1fr 100px'}} onClick={() => onSelectTrack(albumTrack)}>
                                <div className="track-number">
                                    <span className="index">{index + 1}</span>
                                    <button className="play-button">{isCurrent && isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
                                </div>
                                <div className="track-info">
                                    <img src={albumTrack.artworkUrl100} alt={albumTrack.trackName} className="track-album-art" />
                                    <div>
                                        <div className="track-title">{albumTrack.trackName}</div>
                                        <div className="track-artist">{albumTrack.artistName}</div>
                                    </div>
                                </div>
                                <div className="track-duration" style={{textAlign: 'right'}}>{formatDuration(albumTrack.trackTimeMillis)}</div>
                            </li>
                         )
                    })}
                </ul>
            </div>
        </div>
    )
}


// --- Main App Component ---
function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("Top Hits");
  const [tracks, setTracks] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [view, setView] = useState('search'); // 'search', 'favorites', 'player'
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentAlbumTracks, setCurrentAlbumTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInput, setUserInput] = useState("Top Hits");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);
  const API_URL = 'http://localhost:3001';

  const handleAuthSuccess = (data) => {
    localStorage.setItem('profile', JSON.stringify(data));
    setUser(data);
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('profile');
    setUser(null);
    setFavorites({});
  };

  const apiFetch = async (url, options = {}) => {
    const profile = JSON.parse(localStorage.getItem('profile'));
    const token = profile?.token;
    const headers = { ...options.headers, 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      handleSignOut();
      throw new Error('Session expired. Please sign in again.');
    }
    return response;
  };

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
        try {
            const response = await apiFetch(`${API_URL}/api/favorites`);
            const favoriteTracks = await response.json();
            const favoritesMap = favoriteTracks.reduce((acc, track) => {
                acc[track.trackId] = track;
                return acc;
            }, {});
            setFavorites(favoritesMap);
        } catch (error) { console.error("Failed to fetch favorites:", error); }
    };
    fetchFavorites();
  }, [user]);

  useEffect(() => {
    const fetchInitialTracks = async () => {
      if (!searchTerm) return; 
      setIsLoading(true);
      try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=50`);
        const data = await response.json();
        setTracks(data.results.filter(track => track.previewUrl));
      } catch (error) { console.error("Error fetching from iTunes API:", error); setTracks([]); } 
      finally { setIsLoading(false); }
    };
    fetchInitialTracks();
  }, [searchTerm]);

  const fetchAlbumTracks = async (collectionId) => {
      try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${collectionId}&entity=song`);
        const data = await response.json();
        setCurrentAlbumTracks(data.results.slice(1).filter(t => t.previewUrl)); // API returns album info as first result
      } catch (error) {
          console.error("Failed to fetch album tracks:", error);
          setCurrentAlbumTracks([]);
      }
  }

  const handlePlayPause = (track) => {
    if (currentTrack && currentTrack.trackId === track.trackId) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const newAudio = new Audio(track.previewUrl);
      setCurrentTrack(track);
      if (track.collectionId) {
        fetchAlbumTracks(track.collectionId);
      } else {
        setCurrentAlbumTracks([]);
      }
      setView('player');
      audioRef.current = newAudio;
      newAudio.play().catch(e => console.error("Error playing audio:", e));
      setIsPlaying(true);
      
      newAudio.onloadedmetadata = () => setDuration(newAudio.duration);
      newAudio.ontimeupdate = () => setProgress(newAudio.currentTime);
      newAudio.onended = () => setIsPlaying(false); // Simple stop on end for now
    }
  };

  const handlePlayerPlayPause = () => {
    if (!currentTrack) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };
 
  const toggleFavorite = async (track) => {
    if (!user) { setShowAuthModal(true); return; }
    const isFavorited = !!favorites[track.trackId];
    const newFavorites = { ...favorites };
    const method = isFavorited ? 'DELETE' : 'POST';
    const endpoint = isFavorited ? `${API_URL}/api/favorites/${track.trackId}` : `${API_URL}/api/favorites`;

    if (isFavorited) { delete newFavorites[track.trackId]; } 
    else { newFavorites[track.trackId] = track; }
    setFavorites(newFavorites);
    
    try {
        await apiFetch(endpoint, {
            method,
            body: isFavorited ? null : JSON.stringify({ track })
        });
    } catch (error) {
        console.error(`Failed to ${isFavorited ? 'remove' : 'add'} favorite:`, error);
        setFavorites(favorites);
    }
  };
  
  const handleSearchSubmit = (e) => { 
    e.preventDefault(); 
    setView('search'); 
    setSearchTerm(userInput || "Top Hits");
    // Re-trigger fetch by changing searchTerm
    const fetchSearchedTracks = async () => {
      if (!userInput) return; 
      setIsLoading(true);
      try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(userInput)}&entity=song&limit=50`);
        const data = await response.json();
        setTracks(data.results.filter(track => track.previewUrl));
      } catch (error) { console.error("Error fetching from iTunes API:", error); setTracks([]); } 
      finally { setIsLoading(false); }
    };
    fetchSearchedTracks();
  };

  const formatDuration = (millis) => { 
      const minutes = Math.floor(millis / 60000); 
      const seconds = ((millis % 60000) / 1000).toFixed(0); 
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; 
  };

  const displayedTracks = view === 'favorites' ? Object.values(favorites) : tracks;
  
  if (!user) {
    return (
        <>
            <GlobalStyles/>
            <AuthModal onClose={() => {}} onAuthSuccess={handleAuthSuccess} />
        </>
    );
  }

  return (
    <>
      <GlobalStyles />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />}
      <div className="music-player-app">
        <aside className="sidebar">
          <div>
              <h1 className="logo"><LogoIcon /> iPlay</h1>
              <ul className="nav-group">
                  <li className={`nav-item ${view === 'search' ? 'active' : ''}`} onClick={() => setView('search')}><HomeIcon /> Home</li>
                  <li className="nav-item"><SearchIcon /> Search</li>
                  <li className="nav-item"><LibraryIcon /> Your Library</li>
              </ul>
          </div>
          <div>
             <ul className="nav-group">
                 <li className="nav-item"><PlusIcon /> Create Playlist</li>
                 <li className={`nav-item ${view === 'favorites' ? 'active' : ''}`} onClick={() => setView('favorites')}><HeartIcon filled={true} /> Liked Songs</li>
             </ul>
             <hr />
             <ul className="playlist-list"><li>Chill Mix</li><li>Workout</li><li>Indie Hits</li><li>Deep Focus</li></ul>
          </div>
        </aside>

        <main className="main-content">
          <header className="header">
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <input type="text" placeholder="Search for Artists, Songs..." value={userInput} onChange={e => setUserInput(e.target.value)}/>
            </form>
            <div className="user-profile" onClick={handleSignOut}>Sign Out ({user.result.username})</div>
          </header>
          
          {view === 'player' && currentTrack ? (
            <PlayerView 
                track={currentTrack}
                albumTracks={currentAlbumTracks}
                isPlaying={isPlaying}
                progress={progress}
                duration={duration}
                onPlayPause={handlePlayerPlayPause}
                onSelectTrack={handlePlayPause}
                isFavorited={!!favorites[currentTrack.trackId]}
                toggleFavorite={toggleFavorite}
                formatDuration={formatDuration}
            />
          ) : (
            <>
                <h2 className="view-title">{view === 'search' ? `Results for "${searchTerm}"` : 'Liked Songs'}</h2>
                <div className="track-list-container">
                    {isLoading ? (
                    <div className="loader">Loading...</div>
                    ) : (
                    <ul className="track-list">
                        <li className="track-header"><div>#</div><div>Title</div><div>Album</div><div>Genre</div><div>Time</div></li>
                        {displayedTracks.map((track, index) => {
                        const isCurrent = currentTrack && currentTrack.trackId === track.trackId;
                        const albumArt = track.artworkUrl100 ? track.artworkUrl100.replace('100x100', '200x200') : 'https://placehold.co/64x64/1DB954/ffffff?text=Art';
                        const isFavorited = !!favorites[track.trackId];
                        return (
                            <li key={`${track.trackId}-${index}`} className={`track-item ${isCurrent && isPlaying ? 'playing' : ''}`}>
                            <div className="track-number" onClick={() => handlePlayPause(track)}>
                                <span className="index">{index + 1}</span>
                                <button className="play-button">{isCurrent && isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
                            </div>
                            <div className="track-info">
                                <img src={albumArt} alt={track.collectionName} className="track-album-art" />
                                <div>
                                <div className="track-title">{track.trackName}</div>
                                <div className="track-artist">{track.artistName}</div>
                                </div>
                            </div>
                            <div className="track-album">{track.collectionName}</div>
                            <div className="track-album">{track.primaryGenreName}</div>
                            <div className="track-actions">
                                <button className={`favorite-btn ${isFavorited ? 'favorited' : ''}`} onClick={(e) => {e.stopPropagation(); toggleFavorite(track);}}>
                                    <HeartIcon filled={isFavorited} />
                                </button>
                                <span className="track-duration">{formatDuration(track.trackTimeMillis)}</span>
                            </div>
                            </li>
                        );
                        })}
                    </ul>
                    )}
                </div>
            </>
          )}
        </main>

        {currentTrack && (
          <footer className="player-bar">
            <div className="player-track-info" onClick={() => setView('player')}>
              <img src={currentTrack.artworkUrl100} alt={currentTrack.collectionName} />
              <div>
                <div className="player-track-title">{currentTrack.trackName}</div>
                <div className="player-track-artist">{currentTrack.artistName}</div>
              </div>
            </div>
            <div className="player-controls">
                {/* Simplified footer controls for now */}
              <button className="control-button play" onClick={handlePlayerPlayPause}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
            </div>
            <div className="player-extra"></div>
          </footer>
        )}
      </div>
    </>
  );
}

export default App;

