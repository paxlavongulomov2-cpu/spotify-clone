"use client";

import { useRef, useState, useEffect } from "react";

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3];

type StemKey = "vocals" | "drums" | "bass" | "melody";
type Stems = Record<StemKey, number>;

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔥 NEW: filename-based songs
  const files = [
    "TheWeeknd_BlindingLights.mp3",
    "Drake_GodsPlan.mp3",
    "TravisScott_Goosebumps.mp3",
  ];

  const songs = files.map((file) => {
    const [artist, title] = file.replace(".mp3", "").split("_");
    return {
      title: `${artist} - ${title}`,
      src: `/music/${file}`,
    };
  });

  const [screen, setScreen] = useState("library");
  const [currentSong, setCurrentSong] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [speed, setSpeed] = useState(1);
  const [light, setLight] = useState(false);

  const [stems, setStems] = useState<Stems>({
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

  // 🔥 FIXED SPEED + AUTOPLAY
  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.load();

    // force correct speed
    audioRef.current.playbackRate = speed;

    if (playing) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentSong, speed, playing]);

  // SEEK
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime =
      percent * audioRef.current.duration;
  };

  // 🔥 SPEED FIX (no weird snapping bug)
  const changeSpeed = (val: number) => {
    setSpeed(val);
    if (audioRef.current) {
      audioRef.current.playbackRate = val;
    }
  };

  return (
    <div
      className={`h-screen flex flex-col ${
        light ? "bg-white text-black" : "bg-black text-white"
      }`}
    >
      {/* 🌙 LIGHT MODE */}
      <button
        className="absolute top-4 right-4"
        onClick={() => setLight(!light)}
      >
        🌙/☀️
      </button>

      {/* LIBRARY */}
      {screen === "library" && (
        <div className="p-6 flex-1">

          {songs.map((song, i) => (
            <div
              key={i}
              className={`flex justify-between p-3 mb-2 rounded cursor-pointer ${
                light
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }`}
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

          <button
            className="absolute top-4 left-4"
            onClick={() => setScreen("library")}
          >
            ←
          </button>

          <button
            className="absolute top-4 right-16"
            onClick={() => setScreen("mixer")}
          >
            Mixer
          </button>

          <div className="text-6xl animate-bounce mb-6">🎵</div>

          <h2>{songs[currentSong].title}</h2>

          {/* PROGRESS */}
          <div
            className={`w-64 h-2 mt-4 cursor-pointer ${
              light ? "bg-gray-300" : "bg-gray-600"
            }`}
            onClick={seek}
          >
            <div
              className="bg-purple-500 h-2"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* CONTROLS */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={() =>
                setCurrentSong(
                  (prev) => (prev - 1 + songs.length) % songs.length
                )
              }
            >
              ⏮
            </button>

            <button onClick={togglePlay}>
              {playing ? "⏸" : "▶"}
            </button>

            <button
              onClick={() =>
                setCurrentSong((prev) => (prev + 1) % songs.length)
              }
            >
              ⏭
            </button>
          </div>

          {/* SPEED */}
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.01"
            value={speed}
            onChange={(e) => changeSpeed(parseFloat(e.target.value))}
            className="mt-4"
          />

          <div>{speed.toFixed(2)}x</div>

          {/* STEMS */}
          <div className="flex gap-2 mt-4">
            {(Object.keys(stems) as StemKey[]).map((key) => (
              <button
                key={key}
                onClick={() =>
                  setStems({
                    ...stems,
                    [key]: stems[key] ? 0 : 1,
                  })
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

          {(Object.entries(stems) as [StemKey, number][]).map(
            ([key, val]) => (
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
                            (Object.keys(stems) as StemKey[]).map(
                              (k) => [k, k === key ? 1 : 0]
                            )
                          ) as Stems
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
            )
          )}
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