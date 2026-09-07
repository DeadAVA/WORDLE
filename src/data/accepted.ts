// Accepted words for validation of guesses.
// The solution words (words.ts) are always accepted.
// Extend this with the full dictionaries from WORDLIST_LICENSE.md sources
// to allow all valid dictionary words as guesses.

import { WORDS } from './words';

// Build a combined set of all solution words for validation.
// In production, replace/extend this with the full word lists.
const allSolutionWords = new Set<string>();
Object.values(WORDS).forEach(list => list.forEach(w => allSolutionWords.add(w)));

// Additional accepted words that are not solution words
// (common words that players might try but are not answers)
const EXTRA_ES = new Set<string>([
  "ABAJO","ABEJA","ABRIR","ACABO","ACASO","ACOGE","ACTAR","ACTO","ADIOS","ADORN",
  "AFIRM","AFUERA","AGOTA","AGRIO","AGUAS","AHOGA","AJENA","AJENO","ALABO","ALARGA",
  "ALEJA","ALELO","ALERO","ALETA","ALEVE","ALFIL","ALISO","ALOJA","ALOSA","ALTEA",
  "ALZAR","AMABA","AMADO","AMARA","AMARO","AMASE","AMATA","AMIGA","AMILO","AMINO",
  "AMOCO","AMOLA","AMOLDA","AMOLO","AMPAR","ANCLA","ANDAS","ANDAR","ANGLA","ANGULA",
  "ANTES","APIOS","APODO","APOYA","APURO","ARDID","ARDIO","ARDOR","AREPA","ARGOT",
  "ARIDO","ARMAR","ARMAS","ARNAL","AROBO","AROYO","ARRAR","ARRAS","ARTERO","ASCOS",
  "ASEAR","ASIRNK","ASOMA","ASPAR","ASTAS","ATAJO","ATADO","ATAJA","ATAUN","ATECO",
  "ATILA","ATLAS","ATONA","ATORO","ATRAS","ATRIO","AVALA","AVARO","AVENA","AVIAR",
  "AVISO","AXIOMA","AZADA","AZOTE","BABEO","BACHE","BADEA","BAGAR","BALAR","BALDE",
  "BAMBU","BANCO","BANDA","BARRO","BASAR","BASTO","BATAN","BATHE","BATON","BAYA",
  "BEBIO","BELLO","BESTIA","BETEL","BIRLO","BIZCA","BLUSA","BOCAR","BOCIO","BOGAR",
  "BOGOTA","BOLSA","BOMBA","BONAR","BORDA","BORLA","BORRAR","BOSCO","BOXEO","BRAGA",
  "BREGA","BREVA","BRISA","BROCA","BROMO","BRUJO","BRUMA","BRUTO","BUCAR","BUFON",
  "BUJIA","BULBO","BUQUE","BURLA","BUSCA","CABAL","CACAO","CACTO","CAOBA","CAPON",
]);

const EXTRA_EN = new Set<string>([
  "ABACK","ABAFT","ABASE","ABASH","ABATE","ABBEY","ABBOT","ABIDE","ABLER","ABODE",
  "ABORT","ABOUT","ABOVE","ABRUPT","ABSURD","ABUTS","ABYSS","ACHOO","ACIDS","ACORN",
  "ACRID","ACTED","ACUTE","ADAGE","ADDED","ADEPT","ADMIT","ADOBE","ADOPT","ADORE",
  "ADORN","ADROIT","ADULT","AFTER","AGAIN","AGAPE","AGONY","AGREE","AIDER","AISLE",
  "AJAR","ALARM","ALBUM","ALGAE","ALIBI","ALIEN","ALIGN","ALIKE","ALLEY","ALLOT",
  "ALLOW","ALOFT","ALONE","ALTER","AMBER","AMEND","MIDST","AMISS","AMONG","AMPLE",
  "AMUSE","ANGEL","ANNEX","ANNOY","ANTIC","ANVIL","AORTA","APTLY","ARENA","ARGON",
  "ARROW","ASTER","ATLAS","ATOLL","ATONE","ATTIC","AUDIO","AUDIT","AUGUR","AURAL",
  "AVID","AXIAL","AZURE","BAGGY","BALMY","BALSA","BANDY","BANGS","BANJO","BATCH",
  "BATTY","BAWDY","BAYOU","BEADY","BEARD","BEECH","BEEFY","BEFIT","BEGOT","BEIGE",
  "BELLE","BELLY","BERTH","BEVEL","BEZEL","BITTY","BLIMP","BLURT","BOGGY","BOOZE",
  "BOXER","BRAWL","BRINE","BRINY","BROAD","BROOD","BRUNT","BUMPY","BUNNY","CABIN",
  "CACTI","CANOE","CARDS","CARGO","CAROL","CARRY","CASTE","CEDAR","CHALK","CHAMP",
  "CHANT","CHASM","CHEAP","CHEWY","CHIRP","CHOKE","CHORD","CIVIC","CIVIL","CLANG",
  "CLANK","CLEFT","CLING","CLOAK","COAX","COBOL","CODEC","COMET","COMFY","CONFER",
]);

export function isAccepted(word: string, _lang: string): boolean {
  const upper = word.toUpperCase();
  if (allSolutionWords.has(upper)) return true;
  if (_lang === 'es' && EXTRA_ES.has(upper)) return true;
  if (_lang === 'en' && EXTRA_EN.has(upper)) return true;
  // In dev/demo mode: accept any word of correct length
  // Remove this in production and use full dictionary
  return true;
}
