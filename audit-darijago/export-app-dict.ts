import { BEN_SEDIRA_DICTIONARY } from './source/src/data/benSediraDictionary';
import { writeFileSync } from 'node:fs';
writeFileSync('../tests/app-dict.json', JSON.stringify(BEN_SEDIRA_DICTIONARY));
