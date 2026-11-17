import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_PHRASES, CURRICULUM_MODULES } from '../data/curriculum';
import {
  buildListenGuessDeck,
  computeListenGuessAccuracy,
  evaluateListenGuessChoice,
} from './listenGuessLogic';

test('buildListenGuessDeck generates deterministic rounds with 4 unique options per round', () => {
  const deckA = buildListenGuessDeck(ALL_PHRASES, {
    mode: 'mixed',
    moduleFilter: 'all',
    seed: 5,
    language: 'fr',
    roundCount: 8,
    optionCount: 4,
  });
  const deckB = buildListenGuessDeck(ALL_PHRASES, {
    mode: 'mixed',
    moduleFilter: 'all',
    seed: 5,
    language: 'fr',
    roundCount: 8,
    optionCount: 4,
  });

  assert.equal(deckA.length, 8);
  assert.deepEqual(
    deckA.map((r) => r.target.id),
    deckB.map((r) => r.target.id)
  );

  let hasWord = false;
  let hasPhrase = false;
  for (const round of deckA) {
    if (round.target.kind === 'word') hasWord = true;
    if (round.target.kind === 'phrase') hasPhrase = true;
    assert.equal(round.options.length, 4);
    assert.equal(
      round.options.filter((opt) => opt.isCorrect).length,
      1
    );
    const optionIds = new Set(round.options.map((opt) => opt.id));
    assert.equal(optionIds.size, 4);
  }
  assert.equal(hasWord, true);
  assert.equal(hasPhrase, true);
});

test('buildListenGuessDeck respects words and phrases modes and unit scoping', () => {
  const firstModId = CURRICULUM_MODULES[0].id;
  const secondModId = CURRICULUM_MODULES[1].id;

  const wordsDeck = buildListenGuessDeck(ALL_PHRASES, {
    mode: 'words',
    moduleFilter: firstModId,
    seed: 2,
    language: 'en',
    roundCount: 6,
  });
  assert.equal(wordsDeck.length, 6);
  for (const round of wordsDeck) {
    assert.equal(round.target.kind, 'word');
    assert.equal(round.target.moduleId, firstModId);
    assert.equal(round.options.length, 4);
  }

  const phrasesDeck = buildListenGuessDeck(ALL_PHRASES, {
    mode: 'phrases',
    moduleFilter: secondModId,
    seed: 3,
    language: 'fr',
    roundCount: 6,
  });
  assert.equal(phrasesDeck.length, 6);
  for (const round of phrasesDeck) {
    assert.equal(round.target.kind, 'phrase');
    assert.equal(round.target.moduleId, secondModId);
    assert.equal(round.options.length, 4);
  }
});

test('evaluateListenGuessChoice identifies right and wrong selections and computes accuracy', () => {
  const deck = buildListenGuessDeck(ALL_PHRASES, {
    mode: 'phrases',
    seed: 1,
    language: 'fr',
    roundCount: 4,
  });
  const round = deck[0];
  const rightOpt = round.options.find((o) => o.isCorrect)!;
  const wrongOpt = round.options.find((o) => !o.isCorrect)!;

  const rightEval = evaluateListenGuessChoice(round, rightOpt.id);
  assert.equal(rightEval.isCorrect, true);
  assert.equal(rightEval.correctOption.id, rightOpt.id);

  const wrongEval = evaluateListenGuessChoice(round, wrongOpt.id);
  assert.equal(wrongEval.isCorrect, false);
  assert.equal(wrongEval.correctOption.id, rightOpt.id);
  assert.equal(wrongEval.selectedOption?.id, wrongOpt.id);

  assert.equal(computeListenGuessAccuracy(6, 8), 75);
  assert.equal(computeListenGuessAccuracy(0, 0), 0);
});
