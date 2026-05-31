const next = () => {
  const nextIdx = (trackIdx + 1) % TRACKS.length;
  setTrackIdx(nextIdx);
  const audio = audioRef.current;
  if (audio) {
    audio.src = TRACKS[nextIdx].url;
    audio.load();
    audio.play().catch(() => setPlaying(false));
    setPlaying(true);
  }
};
