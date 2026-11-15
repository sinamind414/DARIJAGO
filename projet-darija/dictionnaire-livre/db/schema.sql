-- Schema généré après intégration des 10 parties.

-- table: entries
CREATE TABLE entries(
      id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT, page_start INTEGER, page_end INTEGER,
      headword_fr TEXT, headword_norm TEXT, pos_guess TEXT, raw_block TEXT,
      arabic_char_count INTEGER, status TEXT, confidence TEXT, headword_qualifier TEXT, printed_page_start INTEGER, printed_page_end INTEGER, parser_version TEXT, extraction_flags TEXT, entry_uid TEXT, register TEXT DEFAULT 'algerien_1910', in_algerian_corpus INTEGER DEFAULT 1, parent_headword TEXT, section TEXT DEFAULT 'dictionnaire',
      UNIQUE(source_id, page_start, headword_norm, raw_block)
    );

-- table: entries_fts
CREATE VIRTUAL TABLE entries_fts USING fts5(
      headword_fr, raw_block, content='entries', content_rowid='id',
      tokenize='unicode61 remove_diacritics 2'
    );

-- table: entries_fts_config
CREATE TABLE 'entries_fts_config'(k PRIMARY KEY, v) WITHOUT ROWID;

-- table: entries_fts_data
CREATE TABLE 'entries_fts_data'(id INTEGER PRIMARY KEY, block BLOB);

-- table: entries_fts_docsize
CREATE TABLE 'entries_fts_docsize'(id INTEGER PRIMARY KEY, sz BLOB);

-- table: entries_fts_idx
CREATE TABLE 'entries_fts_idx'(segid, term, pgno, PRIMARY KEY(segid, term)) WITHOUT ROWID;

-- table: entry_forms
CREATE TABLE entry_forms(
      id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER, form_type TEXT,
      ar_script TEXT, translit_historical TEXT, translit_modern TEXT,
      audio_path TEXT, validated INTEGER DEFAULT 0, notes TEXT
    );

-- table: pages
CREATE TABLE pages(
      id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT, page_number INTEGER,
      section TEXT, ocr_text TEXT, image_path TEXT, ocr_quality TEXT, printed_page_number INTEGER, ocr_engine TEXT, ocr_langs TEXT, ocr_psm TEXT,
      UNIQUE(source_id, page_number)
    );

-- table: processing_runs
CREATE TABLE processing_runs(
      id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT, sha256 TEXT,
      started_at TEXT, finished_at TEXT, parser_version TEXT,
      pages INTEGER, candidates INTEGER, inserted INTEGER, skipped INTEGER,
      warnings TEXT, status TEXT
    );

-- table: review_tasks
CREATE TABLE review_tasks(
      id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER, issue TEXT,
      priority TEXT, status TEXT DEFAULT 'open'
    );

-- table: senses
CREATE TABLE senses(
      id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER, sense_order INTEGER,
      fr_gloss TEXT, register TEXT, domain TEXT, example_fr TEXT, example_ar TEXT,
      example_lat TEXT, validated INTEGER DEFAULT 0
    );

-- table: skill_rules
CREATE TABLE skill_rules(
      id INTEGER PRIMARY KEY AUTOINCREMENT, topic TEXT, rule_text TEXT,
      source_pages TEXT, examples_json TEXT, validated INTEGER DEFAULT 0,
      register_warning TEXT
    , source_id TEXT, status TEXT DEFAULT 'needs_review');

-- table: sources
CREATE TABLE sources(
      id TEXT PRIMARY KEY, filename TEXT, sha256 TEXT, title TEXT, year INTEGER,
      language_pair TEXT, status TEXT, notes TEXT
    );

-- index: idx_entries_corpus
CREATE INDEX idx_entries_corpus ON entries(in_algerian_corpus);

-- index: idx_entries_headword_norm
CREATE INDEX idx_entries_headword_norm ON entries(headword_norm);

-- index: idx_entries_page
CREATE INDEX idx_entries_page ON entries(source_id,page_start);

-- index: idx_entries_register
CREATE INDEX idx_entries_register ON entries(register);

-- index: idx_entries_source
CREATE INDEX idx_entries_source ON entries(source_id);

-- index: idx_entries_uid
CREATE UNIQUE INDEX idx_entries_uid ON entries(entry_uid) WHERE entry_uid IS NOT NULL;

-- index: idx_review_status
CREATE INDEX idx_review_status ON review_tasks(status);

-- index: idx_sources_sha
CREATE INDEX idx_sources_sha ON sources(sha256);

-- view: v_entries_algerien
CREATE VIEW v_entries_algerien AS
      SELECT e.*, s.filename FROM entries e JOIN sources s ON s.id=e.source_id
      WHERE e.status != 'false_positive' AND e.in_algerian_corpus=1;

-- view: v_entries_review
CREATE VIEW v_entries_review AS
      SELECT e.*, s.filename FROM entries e JOIN sources s ON s.id=e.source_id
      WHERE e.status != 'false_positive';

-- trigger: entries_ad
CREATE TRIGGER entries_ad AFTER DELETE ON entries BEGIN
      INSERT INTO entries_fts(entries_fts,rowid,headword_fr,raw_block) VALUES('delete',old.id,old.headword_fr,old.raw_block);
    END;

-- trigger: entries_ai
CREATE TRIGGER entries_ai AFTER INSERT ON entries BEGIN
      INSERT INTO entries_fts(rowid,headword_fr,raw_block) VALUES(new.id,new.headword_fr,new.raw_block);
    END;

-- trigger: entries_au
CREATE TRIGGER entries_au AFTER UPDATE ON entries BEGIN
      INSERT INTO entries_fts(entries_fts,rowid,headword_fr,raw_block) VALUES('delete',old.id,old.headword_fr,old.raw_block);
      INSERT INTO entries_fts(rowid,headword_fr,raw_block) VALUES(new.id,new.headword_fr,new.raw_block);
    END;
