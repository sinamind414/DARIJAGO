# -*- coding: utf-8 -*-
"""Transcrit un audio en retirant le kwarg metadata_errors (compat PyAV 19)."""
import sys
import av
import av.container.core as _core

_orig_open = _core.open


def _patched_open(*args, **kwargs):
    kwargs.pop("metadata_errors", None)
    return _orig_open(*args, **kwargs)


_core.open = _patched_open
av.open = _patched_open

from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

audio = sys.argv[1]
modele = sys.argv[2] if len(sys.argv) > 2 else "small"

m = WhisperModel(modele, device="cpu", compute_type="int8")
segments, info = m.transcribe(audio, language="ar", vad_filter=False, beam_size=5)
print(f"langue={info.language} proba={info.language_probability:.2f} duree={info.duration:.2f}s")
print("--- TRANSCRIPTION ---")
for seg in segments:
    print(f"[{seg.start:6.2f}s -> {seg.end:6.2f}s] {seg.text.strip()}")