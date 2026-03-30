"use client";

import { useRef, useState, useEffect } from "react";

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const songs = [
    { title: "Song 1", src: "/song1.mp3" },
    { title: "Song 2", src: "/song2.mp3" },
    { title: "Song 3", src: "/song3.mp3" },
  ];

  const [currentSong, setCurrentSong] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(true);

  const playSong = (index: number) => {
    setCurrentSong(index);
    setPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setPlaying(!playing);
  };

  // Update progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const percent = (audio.currentTime / audio.duration) * 100;
      setProgress(percent || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  // Auto play on song change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (playing) {
        audioRef.current.play();
      }
    }
  }, [currentSong]);

  return (
    <div
      className={`h-screen flex flex-col transition-colors duration-300 ${
        darkMode
          ? "bg-[#0a0a0a] text-white"
          : "bg-[#f5f9ff] text-black"
      }`}
    >
      {/* Toggle Theme */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-4 right-4 px-3 py-1 rounded bg-gray-300 text-black text-sm"
      >
        {darkMode ? "Light" : "Dark"}
      </button>

      {/* Main */}
      <div className="flex flex-1">

        {/* Sidebar */}
        <div
          className={`w-56 p-5 ${
            darkMode ? "bg-[#1a1a2e]" : "bg-white shadow"
          }`}
        >
          <h1 className="text-lg font-medium">Library</h1>
        </div>

        {/* Playlist */}
        <div className="flex-1 p-6">
          <h2 className="text-lg font-medium mb-4">Playlist</h2>

          <div className="space-y-2">
            {songs.map((song, index) => (
              <div
                key={index}
                onClick={() => playSong(index)}
                className={`p-3 rounded cursor-pointer transition-all duration-200 ${
                  currentSong === index
                    ? darkMode
                      ? "bg-purple-600"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-zinc-800 hover:bg-zinc-700"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {song.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player */}
      <div
        className={`p-4 ${
          darkMode
            ? "bg-[#111122] border-t border-zinc-800"
            : "bg-white border-t"
        }`}
      >
        {/* Progress Bar */}
        <div className="w-full bg-gray-400 h-1 mb-3 rounded">
          <div
            className={`h-1 rounded ${
              darkMode ? "bg-purple-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <span className="text-sm">
            {songs[currentSong].title}
          </span>

          <button
            onClick={togglePlay}
            className={`px-4 py-1 rounded text-white transition ${
              darkMode
                ? "bg-purple-600 hover:bg-purple-500"
                : "bg-blue-500 hover:bg-blue-400"
            }`}
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>
      </div>

      {/* Audio */}
      <audio ref={audioRef} src={songs[currentSong].src} />
    </div>
  );
}