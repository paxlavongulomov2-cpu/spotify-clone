"use client";

import { useRef, useState, useEffect } from "react";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3];

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const songs = [
    { title: "Song 1", src: "/song1.mp3" },
    { title: "Song 2", src: "/song2.mp3" },
    { title: "Song 3", src: "/song3.mp3" },
  ];

  const [screen, setScreen] = useState("library");
  const [currentSong, setCurrentSong] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [speed, setSpeed] = useState(1);

  // Fake stems (UI only)
  const [stems, setStems] = useState({
    vocals: 1,
    drums: 1,
    bass: 1,
    melody: 1,
  });

  // PLAY / PAUSE
  const togglePlay = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(!playing);
  };

  // SELECT SONG
  const openSong = (index: number) => {
    setCurrentSong(index);
    setScreen("now");
    setPlaying(true);
  };

  // PROGRESS
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const update = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener("timeupdate", update);
    return () => audio.removeEventListener("timeupdate", update);
  }, []);

  // AUTO PLAY
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.playbackRate = speed;
      if (playing) audioRef.current.play();
    }
  }, [currentSong, speed]);

  // SEEK
  const seek = (e: any) => {
    if (!audioRef.current) return;
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * audioRef.current.duration;
  };

  // SPEED SNAP
  const changeSpeed = (val: number) => {
    let closest = SPEEDS.reduce((prev, curr) =>
      Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
    );
    setSpeed(closest);
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">

      {/* LIBRARY */}
      {screen === "library" && (
        <div className="p-6 flex-1">
          <h1 className="text-lg mb-4">Library</h1>

          {songs.map((song, i) => (
            <div
              key={i}
              className="flex justify-between p-3 bg-zinc-800 mb-2 rounded cursor-pointer hover:bg-zinc-700"
              onClick={() => openSong(i)}
            >
              {song.title}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLiked((prev) =>
                    prev.includes(i)
                      ? prev.filter((x) => x !== i)
                      : [...prev, i]
                  );
                }}
              >
                {liked.includes(i) ? "❤️" : "🤍"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* NOW PLAYING */}
      {screen === "now" && (
        <div className="flex-1 flex flex-col items-center justify-center">

          {/* Back */}
          <button
            className="absolute top-4 left-4"
            onClick={() => setScreen("library")}
          >
            ←
          </button>

          {/* Mixer */}
          <button
            className="absolute top-4 right-4"
            onClick={() => setScreen("mixer")}
          >
            Mixer
          </button>

          {/* Album Animation */}
          <div className="text-6xl animate-bounce mb-6">🎵</div>

          <h2>{songs[currentSong].title}</h2>

          {/* Progress */}
          <div
            className="w-64 h-2 bg-gray-600 mt-4 cursor-pointer"
            onClick={seek}
          >
            <div
              className="bg-purple-500 h-2"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="mt-4 flex gap-4">
            <button onClick={() => setCurrentSong((prev) => (prev - 1 + songs.length) % songs.length)}>⏮</button>
            <button onClick={togglePlay}>{playing ? "⏸" : "▶"}</button>
            <button onClick={() => setCurrentSong((prev) => (prev + 1) % songs.length)}>⏭</button>
          </div>

          {/* Speed */}
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.01"
            onChange={(e) => changeSpeed(parseFloat(e.target.value))}
            className="mt-4"
          />
          <div>{speed}x</div>

          {/* Quick stems */}
          <div className="flex gap-2 mt-4">
            {Object.keys(stems).map((key) => (
              <button
                key={key}
                onClick={() =>
                  setStems({ ...stems, [key]: stems[key] ? 0 : 1 })
                }
                className="bg-zinc-700 px-2 py-1 rounded"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MIXER */}
      {screen === "mixer" && (
        <div className="p-6 flex-1">

          <button onClick={() => setScreen("now")}>← Back</button>

          <h2 className="mb-4">Mixer</h2>

          {Object.entries(stems).map(([key, val]) => (
            <div key={key} className="mb-4">

              <div className="flex justify-between">
                <span>{key}</span>

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setStems({ ...stems, [key]: 0 })
                    }
                  >
                    Mute
                  </button>

                  <button
                    onClick={() =>
                      setStems(
                        Object.fromEntries(
                          Object.keys(stems).map((k) => [
                            k,
                            k === key ? 1 : 0,
                          ])
                        )
                      )
                    }
                  >
                    SOLO
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={val}
                onChange={(e) =>
                  setStems({
                    ...stems,
                    [key]: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* MINI PLAYER */}
      <div className="bg-zinc-900 p-3 flex justify-between items-center">
        <span>{songs[currentSong].title}</span>
        <button onClick={togglePlay}>
          {playing ? "Pause" : "Play"}
        </button>
      </div>

      {/* AUDIO */}
      <audio ref={audioRef} src={songs[currentSong].src} />
    </div>
  );
}