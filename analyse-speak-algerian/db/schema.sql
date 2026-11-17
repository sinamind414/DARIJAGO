-- Corpus audio @speakalgerian — segments Whisper pour la base DARIJAGO.
-- Mêmes conventions que manuel.sqlite : provenance partout, statut de validation,
-- rien d'app_ready sans relecture par un locuteur natif.
-- Autorisation : usage éducatif (voir AUTORISATION.md, 16/11/2026).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sources (
  source_id TEXT PRIMARY KEY,            -- ex: 'speakalgerian_vid_001'
  creator TEXT NOT NULL,                 -- 'speakalgerian'
  media_type TEXT NOT NULL CHECK(media_type IN ('video','audio')),
  title TEXT,
  url TEXT,
  filename TEXT NOT NULL,                -- fichier local transcrit
  sha256 TEXT NOT NULL UNIQUE,           -- empreinte du fichier transcrit
  duration_s REAL,
  language_detected TEXT,
  whisper_model TEXT,
  rights_note TEXT NOT NULL,             -- référence à AUTORISATION.md + date
  authorization_status TEXT NOT NULL DEFAULT 'declared'
      CHECK(authorization_status IN ('declared','written_confirmed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audio_segments (
  segment_id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  segment_no INTEGER NOT NULL,           -- numéro de segment dans la transcription
  start_ms INTEGER NOT NULL,
  end_ms INTEGER NOT NULL,
  start_time TEXT NOT NULL,              -- 'HH:MM:SS,mmm' lisible
  end_time TEXT NOT NULL,
  -- Transcription automatique (jamais modifiée : trace du brouillon Whisper)
  text_raw TEXT NOT NULL,
  -- Couches à remplir lors de la relecture
  text_corrected TEXT,                   -- relecture locuteur natif
  text_latin TEXT,                       -- phonétique arabizi (3, 7, 9)
  text_ar TEXT,                          -- écriture arabe validée
  french TEXT,                           -- traduction
  -- Exploitation app
  expression_type TEXT CHECK(expression_type IN
      ('phrase','dialogue','vocabulary','grammar_tip','culture','other')),
  is_extractable INTEGER NOT NULL DEFAULT 0, -- 1 = expression réutilisable en leçon
  linked_vocab_uid TEXT,                 -- lien optionnel vers vocabulary(vocab_id) du manuel
  status TEXT NOT NULL DEFAULT 'needs_review'
      CHECK(status IN ('needs_review','corrected','native_validated','app_ready','excluded')),
  notes TEXT,
  UNIQUE(source_id, segment_no)
);

CREATE TABLE IF NOT EXISTS review_tasks (
  task_id INTEGER PRIMARY KEY,
  object_type TEXT NOT NULL,             -- 'audio_segment' | 'source'
  object_id INTEGER NOT NULL,
  reason TEXT NOT NULL,                  -- ex: 'darija auto peu fiable'
  priority INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'open'
      CHECK(status IN ('open','in_progress','done','rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS processing_runs (
  run_id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  step TEXT NOT NULL,                    -- 'transcribe' | 'import' | 'review_pass'
  whisper_model TEXT,
  segments_count INTEGER,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  details_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_segments_source ON audio_segments(source_id, segment_no);
CREATE INDEX IF NOT EXISTS idx_segments_status ON audio_segments(status);
CREATE INDEX IF NOT EXISTS idx_segments_extractable ON audio_segments(is_extractable, status);
CREATE INDEX IF NOT EXISTS idx_segments_time ON audio_segments(source_id, start_ms);
CREATE INDEX IF NOT EXISTS idx_review_status ON review_tasks(status, object_type);
