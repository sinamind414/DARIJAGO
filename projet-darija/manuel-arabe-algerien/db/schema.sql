-- Manuel d'arabe algérien moderne (Norbert Tapiéro) — base séparée du dictionnaire 1910.
-- Principe : OCR brut jamais publié ; chaque objet porte provenance + statut de validation.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sources (
  source_id TEXT PRIMARY KEY,
  book TEXT NOT NULL,
  part TEXT NOT NULL,
  title TEXT,
  author TEXT,
  publisher TEXT,
  edition TEXT,
  isbn TEXT,
  filename TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  bytes INTEGER,
  pdf_pages INTEGER,
  dialect TEXT NOT NULL DEFAULT 'arq',
  register TEXT NOT NULL,
  rights_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(book, part),
  UNIQUE(sha256)
);

CREATE TABLE IF NOT EXISTS pages (
  page_id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  pdf_page INTEGER NOT NULL,
  printed_page INTEGER,
  side TEXT CHECK(side IN ('L','R','full')),
  ocr_file TEXT,
  ocr_langs TEXT,
  ocr_psm INTEGER,
  ocr_chars INTEGER,
  quality TEXT NOT NULL DEFAULT 'ocr_raw' CHECK(quality IN ('ocr_raw','ocr_columns','curated','blank')),
  UNIQUE(source_id, pdf_page, side)
);

CREATE TABLE IF NOT EXISTS lessons (
  lesson_id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  lesson_no INTEGER NOT NULL,
  title_fr TEXT,
  topics TEXT, -- JSON array
  start_pdf_page INTEGER,
  start_printed_page INTEGER,
  end_pdf_page INTEGER,
  end_printed_page INTEGER,
  completeness TEXT NOT NULL DEFAULT 'complete' CHECK(completeness IN ('complete','partial','toc_only')),
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready')),
  UNIQUE(source_id, lesson_no)
);

CREATE TABLE IF NOT EXISTS lesson_sections (
  section_id INTEGER PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(lesson_id),
  kind TEXT NOT NULL CHECK(kind IN ('pronunciation','reading','text','version','vocabulary','grammar','exercise','theme','translation','front_matter')),
  paragraph_ref TEXT, -- ex: 17, 20bis, 45bis
  title TEXT,
  pdf_page INTEGER,
  printed_page INTEGER,
  side TEXT,
  content_latin TEXT,
  content_ar TEXT,
  content_fr TEXT,
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready')),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS vocabulary (
  vocab_id INTEGER PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(lesson_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  entry_uid TEXT NOT NULL UNIQUE,
  form_latin TEXT NOT NULL,
  form_ar TEXT,
  pos TEXT,
  gender TEXT,
  plural TEXT,
  root TEXT,
  gloss_fr TEXT NOT NULL,
  example_latin TEXT,
  example_fr TEXT,
  pdf_page INTEGER,
  printed_page INTEGER,
  side TEXT,
  paragraph_ref TEXT,
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready')),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS grammar_rules (
  rule_id INTEGER PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(lesson_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  rule_uid TEXT NOT NULL UNIQUE,
  paragraph_ref TEXT,
  title TEXT NOT NULL,
  summary_fr TEXT NOT NULL,
  examples_json TEXT, -- JSON array of {latin, fr, ar?}
  pdf_page INTEGER,
  printed_page INTEGER,
  side TEXT,
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready')),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS exercises (
  exercise_id INTEGER PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(lesson_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  exercise_uid TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK(kind IN ('version','theme','questions','conjugation','reading','translation')),
  paragraph_ref TEXT,
  prompt_fr TEXT,
  items_json TEXT,
  pdf_page INTEGER,
  printed_page INTEGER,
  side TEXT,
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready'))
);

CREATE TABLE IF NOT EXISTS study_texts (
  text_id INTEGER PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(lesson_id),
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  text_uid TEXT NOT NULL UNIQUE,
  paragraph_ref TEXT,
  title_latin TEXT,
  latin_text TEXT,
  ar_text TEXT,
  fr_translation TEXT,
  pdf_page INTEGER,
  printed_page INTEGER,
  side TEXT,
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready')),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS review_tasks (
  task_id INTEGER PRIMARY KEY,
  object_type TEXT NOT NULL,
  object_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','done','rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS processing_runs (
  run_id INTEGER PRIMARY KEY,
  part TEXT NOT NULL,
  step TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  details_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_pages_source ON pages(source_id, pdf_page);
CREATE INDEX IF NOT EXISTS idx_lessons_source ON lessons(source_id, lesson_no);
CREATE INDEX IF NOT EXISTS idx_sections_lesson ON lesson_sections(lesson_id, kind);
CREATE INDEX IF NOT EXISTS idx_vocab_lesson ON vocabulary(lesson_id, status);
CREATE INDEX IF NOT EXISTS idx_vocab_form ON vocabulary(form_latin);
CREATE INDEX IF NOT EXISTS idx_rules_lesson ON grammar_rules(lesson_id, status);
CREATE INDEX IF NOT EXISTS idx_ex_lesson ON exercises(lesson_id, kind);
CREATE INDEX IF NOT EXISTS idx_texts_lesson ON study_texts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_review_status ON review_tasks(status, object_type);

CREATE TABLE IF NOT EXISTS dialogues (
  dialogue_id INTEGER PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  dialogue_uid TEXT NOT NULL UNIQUE,
  numeral TEXT NOT NULL,
  title_fr TEXT,
  pdf_page_ar INTEGER,
  printed_page_ar INTEGER,
  pdf_page_fr INTEGER,
  printed_page_fr INTEGER,
  ar_text TEXT,
  latin_text TEXT,
  fr_translation TEXT,
  completeness TEXT NOT NULL DEFAULT 'complete' CHECK(completeness IN ('complete','partial')),
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready')),
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_dialogues_source ON dialogues(source_id, numeral);

-- Passe fusion glossaires (staging + lookup, jamais app_ready sans validation native)
CREATE TABLE IF NOT EXISTS glossary_ar_fr (
  entry_id INTEGER PRIMARY KEY,
  entry_uid TEXT NOT NULL UNIQUE,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  printed_page INTEGER NOT NULL,
  pdf_page INTEGER,
  side TEXT,
  col INTEGER,
  headword TEXT,
  headword_norm TEXT,
  gender TEXT,
  plural TEXT,
  gloss_fr TEXT,
  raw_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready'))
);
CREATE INDEX IF NOT EXISTS idx_gl_ar_fr_norm ON glossary_ar_fr(headword_norm);
CREATE INDEX IF NOT EXISTS idx_gl_ar_fr_page ON glossary_ar_fr(printed_page);

CREATE TABLE IF NOT EXISTS glossary_fr_ar (
  entry_id INTEGER PRIMARY KEY,
  entry_uid TEXT NOT NULL UNIQUE,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  printed_page INTEGER NOT NULL,
  pdf_page INTEGER,
  side TEXT,
  col INTEGER,
  fr_headword TEXT,
  fr_norm TEXT,
  dz_raw TEXT,
  raw_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready'))
);
CREATE INDEX IF NOT EXISTS idx_gl_fr_ar_norm ON glossary_fr_ar(fr_norm);
CREATE INDEX IF NOT EXISTS idx_gl_fr_ar_page ON glossary_fr_ar(printed_page);

CREATE TABLE IF NOT EXISTS vocab_glossary_links (
  link_id INTEGER PRIMARY KEY,
  vocab_id INTEGER NOT NULL REFERENCES vocabulary(vocab_id),
  entry_id INTEGER NOT NULL REFERENCES glossary_ar_fr(entry_id),
  match_type TEXT NOT NULL CHECK(match_type IN ('exact','variant','fuzzy')),
  sense_compatible INTEGER NOT NULL DEFAULT 0,
  proposed_gender TEXT,
  proposed_plural TEXT,
  proposed_gloss TEXT,
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready')),
  UNIQUE(vocab_id, entry_id)
);
CREATE INDEX IF NOT EXISTS idx_vgl_vocab ON vocab_glossary_links(vocab_id);

CREATE TABLE IF NOT EXISTS fr_dz_lookup (
  lookup_id INTEGER PRIMARY KEY,
  fr_norm TEXT NOT NULL,
  fr_display TEXT NOT NULL,
  dz_form TEXT NOT NULL,
  dz_norm TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK(source_type IN ('vocab','glossary')),
  source_id TEXT NOT NULL,
  vocab_id INTEGER REFERENCES vocabulary(vocab_id),
  glossary_entry_id INTEGER REFERENCES glossary_fr_ar(entry_id),
  printed_page INTEGER,
  status TEXT NOT NULL DEFAULT 'needs_review' CHECK(status IN ('needs_review','corrected','native_validated','app_ready'))
);
CREATE INDEX IF NOT EXISTS idx_lookup_fr ON fr_dz_lookup(fr_norm);
CREATE INDEX IF NOT EXISTS idx_lookup_dz ON fr_dz_lookup(dz_norm);
