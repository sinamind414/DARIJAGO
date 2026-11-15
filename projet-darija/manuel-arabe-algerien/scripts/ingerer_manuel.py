#!/usr/bin/env python3
"""Ingestion structurée du Manuel d'arabe algérien moderne — partie 01.

Base séparée du dictionnaire 1910. Les données ci-dessous sont une curation
manuelle assistée par OCR colonnes ; elles restent `needs_review` tant qu'un
locuteur natif n'a pas validé les formes. L'OCR brut n'est pas exporté.
"""
from __future__ import annotations
import csv, json, re, sqlite3, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / 'db' / 'manuel.sqlite'
SOURCE_ID = 'tapiero-manuel-partie-01'
PART = 'partie-01'


def slug(s: str) -> str:
    s = s.lower()
    s = s.replace('’', "'")
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:60] or 'x'


def j(x):
    return json.dumps(x, ensure_ascii=False)


LESSONS = [
    # no, title, start_pdf, start_printed, end_pdf, end_printed, completeness, topics
    (1, 'Prononciation et lecture. L’article.', 6, 1, 8, 5, 'complete', ['prononciation', 'article', 'adjectif']),
    (2, 'Prononciation et lecture (fin). L’article (fin).', 8, 5, 10, 8, 'complete', ['gutturales', 'structure des mots', 'article', 'annexion']),
    (3, 'Récapitulation des sons. Le démonstratif.', 10, 9, 11, 10, 'complete', ['récapitulation', 'démonstratif']),
    (4, 'L’interrogation. Manière de rendre « être » au présent.', 11, 11, 13, 14, 'complete', ['interrogation', 'être présent', 'salutations']),
    (5, 'Les pronoms personnels suffixes. Manière de rendre « avoir » au présent : la possession.', 13, 15, 15, 18, 'complete', ['pronoms suffixes', 'possession', 'maison']),
    (6, 'Récapitulation. Le verbe « avoir » (suite).', 15, 19, 17, 22, 'complete', ['possession', 'mtâe/dyâl', 'invité', 'récapitulation']),
    (7, 'Le verbe : accompli. Négation.', 17, 23, 18, 25, 'complete', ['accompli', 'négation', 'école']),
    (8, 'Les pronoms personnels isolés. La numération de 1 à 5.', 19, 27, 20, 29, 'complete', ['pronoms isolés', 'nombres 1-5', 'école']),
    (9, 'Le verbe : inaccompli. La numération de 6 à 10.', 21, 31, 23, 34, 'complete', ['inaccompli', 'nombres 6-10', 'jours', 'marché']),
    (10, 'Le verbe « être » arabe (kân, ikûn). Les participes.', 23, 35, 25, 38, 'complete', ['kân/ikûn', 'participes', 'école coranique']),
    (11, 'Récapitulation. L’impératif.', 25, 39, 25, 39, 'partial', ['impératif', 'récit']),
]

# vocab: lesson, form_latin, gloss_fr, pos, gender, plural, root, pdf, printed, side, par, notes
V = []
def v(lesson, form, gloss, pos='nom', gender=None, plural=None, root=None, pdf=None, printed=None, side=None, par=None, notes=None, ex=None, exfr=None):
    V.append(dict(lesson=lesson, form=form, gloss=gloss, pos=pos, gender=gender, plural=plural, root=root,
                  pdf=pdf, printed=printed, side=side, par=par, notes=notes, ex=ex, exfr=exfr))

# Leçon 1 — mots de lecture §5
v(1,'ktâb','livre','nom',None,'ktüb','ktb',7,3,'R','5')
v(1,'weld','garçon','nom',None,'ulâd',None,7,3,'R','5')
v(1,'bent','fille','nom','f',None,None,7,3,'R','5')
v(1,'râjel','homme','nom',None,None,None,7,3,'R','5')
v(1,'mré','femme','nom','f',None,None,7,3,'R','5')
v(1,'madrasa','école','nom','f',None,None,7,3,'R','5')
v(1,'trêg','route, chemin','nom','f',None,None,7,3,'R','5')
v(1,'šems','soleil','nom','f',None,None,7,3,'R','5')
v(1,'allâh','Dieu','nom',None,None,None,7,3,'R','5')
v(1,'kbir','grand, âgé','adj',None,None,None,7,3,'R','5')
v(1,'sgêr','petit, jeune','adj',None,None,None,7,3,'R','5')
v(1,'sâken','habitant, domicilié','participe',None,'sâknîn','skn',7,3,'R','5')
v(1,'fi','dans (sans mouvement)','préposition',None,None,None,7,3,'R','5')
v(1,'sukna','logis','nom',None,None,None,7,3,'R','5')
v(1,'el-jazâir','l’Algérie','nom propre',None,None,None,7,3,'R','5')
# Leçon 2 — mots de lecture
v(2,'mea','avec (qn)','préposition',None,None,None,9,7,'R','10')
v(2,'Qaddûr','Kaddour','nom propre',None,None,None,9,7,'R','10')
v(2,'cali','Ali','nom propre',None,None,None,9,7,'R','10')
v(2,'el-âséma','la capitale','nom','f',None,None,9,7,'R','10')
v(2,'eabd-allâh','Abdallah','nom propre',None,None,None,9,7,'R','10')
v(2,'Fâtéma','Fatma','nom propre','f',None,None,9,7,'R','10')
v(2,'gedra','marmite','nom','f',None,None,9,7,'R','10')
v(2,'hodra','légumes verts','nom collectif',None,None,None,9,7,'R','10')
v(2,'lham','viande','nom',None,None,None,9,7,'R','10')
v(2,'haws','cour','nom',None,None,None,9,7,'R','10')
# Leçon 3 — vocabulaire §13bis
v(3,'šarr','mal','nom',None,None,None,10,9,'R','13bis')
v(3,'akbar','(le) plus grand','adj',None,None,None,10,9,'R','13bis')
v(3,'jamâl','beauté','nom',None,None,None,10,9,'R','13bis')
v(3,'bâb','porte','nom',None,None,None,10,9,'R','13bis')
v(3,'râs','tête','nom',None,None,None,10,9,'R','13bis')
v(3,'jmil','joli, beau','adj',None,None,None,10,9,'R','13bis')
v(3,'gâsed','assis','participe',None,'gâedîn','gced',10,9,'R','13bis',notes='féminin gâeda')
v(3,'hayma','tente','nom','f',None,None,10,9,'R','13bis')
v(3,'tabbâh','cuisinier, restaurateur','nom',None,None,None,10,9,'R','13')
v(3,'fellâh','cultivateur','nom',None,None,None,10,9,'R','13')
# Leçon 4 — vocabulaire
v(4,'dâr','maison','nom','f','dûr',None,12,12,'L','17bis')
v(4,'hâl','état, situation, temps','nom',None,None,None,12,12,'L','17bis')
v(4,'mréd','malade','adj',None,None,None,12,12,'L','17bis')
v(4,'sayyed','monsieur','nom',None,None,None,12,12,'L','17bis')
v(4,'sôg','marché, rue marchande','nom',None,None,None,12,12,'L','17bis')
v(4,'duwâr','douar, groupe de tentes','nom',None,None,None,12,12,'L','17bis')
v(4,'yâ','ô… (vocatif)','particule',None,None,None,12,12,'L','17bis')
v(4,'lâ-bâs','pas mal, bien','expression',None,None,None,12,12,'L','17bis')
v(4,'šuya','un peu','adverbe',None,None,None,12,12,'L','17bis')
v(4,'b-es-sahh','mais, cependant','expression',None,None,None,12,12,'L','17bis')
v(4,'mea-na','avec nous','expression',None,None,None,12,12,'L','17bis')
v(4,'l-','à (avec mouvement)','préposition',None,None,None,12,12,'L','17bis')
v(4,'b-','avec (qch.), moyen de','préposition',None,None,None,12,12,'L','17bis')
v(4,'ela','sur','préposition',None,None,None,12,12,'L','17bis')
v(4,'b-hér','bien','expression',None,None,None,11,11,'R','17',ex='râni b-hér',exfr='je vais bien')
v(4,'el-hamdu-llâh','Dieu soit loué','expression',None,None,None,11,11,'R','17')
v(4,'tbârak-allâh','Dieu soit béni','expression',None,None,None,11,11,'R','17')
v(4,'u-ela-hér','parfaitement bien','expression',None,None,None,11,11,'R','17')
v(4,'ja','il est venu','verbe',None,None,'ja',11,11,'R','17',notes='accompli 3e m. sg.')
v(4,'aškûn','qui ? qui est-ce ?','interrogatif',None,None,None,12,13,'R','18')
v(4,'wâš','quoi ? que ? est-ce que ?','interrogatif',None,None,None,12,13,'R','18')
v(4,'kéf','comment ?','interrogatif',None,None,None,12,13,'R','18')
v(4,'wén','où ?','interrogatif',None,None,None,12,13,'R','18')
v(4,'weqtaš','quand ?','interrogatif',None,None,None,12,13,'R','18')
v(4,'elaš','pourquoi ?','interrogatif',None,None,None,12,13,'R','18')
v(4,'šhâl','combien ?','interrogatif',None,None,None,12,13,'R','18')
v(4,'mnayn','d’où ?','interrogatif',None,None,None,12,13,'R','18')
# Leçon 5 — vocabulaire
v(5,'wast','centre, milieu','nom',None,None,None,14,16,'L','22')
v(5,'blâd','ville, village, terre, pays','nom',None,None,None,14,16,'L','22')
v(5,'earbi','arabe','adj',None,None,None,14,16,'L','22')
v(5,'hârej','banlieue, périphérie','nom',None,None,None,14,16,'L','22')
v(5,'zayy','style, mode, type','nom',None,None,None,14,16,'L','22')
v(5,'kâmel','entier, total','participe/adj',None,None,None,14,16,'L','22')
v(5,'kânûn','fourneau en terre cuite','nom',None,None,None,14,16,'L','22')
v(5,'fransâwi','français','adj',None,None,None,14,16,'L','22')
v(5,'mâ','eau','nom','m',None,None,14,16,'L','22')
v(5,'keškâs','passoire d’alfa','nom',None,None,None,14,16,'L','22')
v(5,'teâm meftûl','couscous roulé','nom',None,None,None,14,16,'L','22')
v(5,'zerbîya','tapis','nom','f',None,None,14,16,'L','22')
v(5,'halfa','alfa','nom',None,None,None,14,16,'L','22')
v(5,'gâeda','assise (f.)','participe/adj','f',None,None,14,16,'L','22')
v(5,'bît','chambre, pièce','nom',None,'byât',None,14,16,'L','22')
v(5,'sôf','laine','nom',None,None,None,14,16,'L','22')
v(5,'hsêra','natte','nom','f',None,None,14,16,'L','22')
v(5,'hzâna','armoire, bahut','nom','f',None,None,14,16,'L','22')
v(5,'ma-ši','non pas (négation)','négation',None,None,None,14,16,'L','22')
v(5,'guddâm','devant','préposition',None,None,None,14,16,'L','22')
v(5,'mtâe','à/de (possession) ; en/de (matière)','préposition',None,None,None,14,16,'L','22')
v(5,'dyâl','à/de (possession) ; en/de (matière)','préposition',None,None,None,14,16,'L','22')
v(5,'eand','chez, à ; avoir (possession)','préposition',None,None,None,14,17,'R','26',ex='eand-i dâr',exfr='j’ai une maison')
v(5,'bû','père','nom',None,None,None,13,15,'R','22',notes='bû-ya = mon père')
v(5,'yemm','mère','nom','f',None,None,13,15,'R','22',notes='yemm-à / imm-à = ma mère')
v(5,'hô','frère','nom',None,None,None,13,15,'R','22',notes='hô-ya = mon frère')
v(5,'qaÿš','affaires, objets divers','nom',None,None,None,13,15,'R','22')
# Leçon 6 — vocabulaire
v(6,'dêf','invité','nom',None,'dyûf',None,16,20,'L','28')
v(6,'yôm','jour','nom',None,'ayyâm',None,16,20,'L','28')
v(6,'camm','oncle paternel','nom',None,None,None,16,20,'L','28')
v(6,'mdina','ville, village, bourg','nom','f',None,None,16,20,'L','28',notes='mdinat- en annexion')
v(6,'sayyâra','automobile','nom','f',None,None,16,20,'L','28')
v(6,'sbâh','matin, matinée','nom',None,None,None,16,20,'L','28')
v(6,'la-crab','les Arabes','nom collectif',None,None,None,16,20,'L','28')
v(6,'mlêh','bon, brave','adj',None,None,None,16,20,'L','28')
v(6,'galb','cœur','nom',None,None,None,16,20,'L','28')
v(6,'krim','généreux','adj',None,None,None,16,20,'L','28')
v(6,'fâkya','fruits','nom collectif',None,None,None,16,20,'L','28')
v(6,'kebš','mouton','nom',None,None,None,16,20,'L','28')
v(6,'mešwi','grillé ; mouton en broche','adj/nom',None,None,None,16,20,'L','28')
v(6,'farhân','content, heureux','adj',None,None,None,16,20,'L','28')
v(6,'usal','il est arrivé','verbe',None,None,None,16,20,'L','28')
v(6,'hrej','il est sorti','verbe',None,None,None,16,20,'L','28')
v(6,'dbah','il a égorgé','verbe',None,None,None,16,20,'L','28')
v(6,'sleh','il a dépecé','verbe',None,None,None,16,20,'L','28')
v(6,'snaz','il a fait cuire','verbe',None,None,None,16,20,'L','28')
v(6,'tâni','aussi, également','adverbe',None,None,None,16,20,'L','28')
v(6,'yâser','beaucoup','adverbe',None,None,None,16,20,'L','28')
v(6,'ela-hâtar','parce que','expression',None,None,None,16,20,'L','28')
v(6,'jâb','il a apporté','verbe',None,None,None,15,19,'R','28',notes='ja + b')
# Leçon 7 — vocabulaire
v(7,'awwel','premier','adj ordinal',None,None,None,17,23,'R','32')
v(7,'šhar','mois','nom',None,'šhûr',None,17,23,'R','32')
v(7,'wejh','figure, visage','nom',None,None,None,17,23,'R','32')
v(7,'sâbûn','savon','nom',None,None,None,17,23,'R','32',notes='emprunt français, entre crochets dans le livre')
v(7,'gahwa','café','nom','f',None,None,17,23,'R','32')
v(7,'ktâba','écriture','nom','f',None,None,17,23,'R','32')
v(7,'kurrâs','cahier, registre','nom',None,None,None,17,23,'R','32',notes='emprunt français, entre crochets dans le livre')
v(7,'cotla','vacances, congé','nom','f',None,None,17,23,'R','32')
v(7,'es-sêf','l’été','nom',None,None,None,17,23,'R','32')
v(7,'sayyidat-i','madame','nom','f',None,None,17,23,'R','32')
v(7,'dhel','il est entré','verbe',None,None,None,17,23,'R','32')
v(7,'lga','il a rencontré','verbe',None,None,None,17,23,'R','32')
v(7,'nâd','il s’est levé','verbe',None,None,None,17,23,'R','32')
v(7,'gâl','il a dit ; dire','verbe',None,None,None,17,23,'R','32',notes='inaccompli igûl (leçon 9)')
v(7,'ésel','il a lavé','verbe',None,None,None,17,23,'R','32')
v(7,'šrab','il a bu','verbe',None,None,None,17,23,'R','32')
v(7,'hdemt','j’ai travaillé','verbe',None,None,None,17,23,'R','32')
v(7,'cammart','j’ai rempli','verbe',None,None,None,17,23,'R','32')
v(7,'emelt','j’ai fait','verbe',None,None,None,17,23,'R','32')
v(7,'cajbet-ni','elle m’a plu','verbe',None,None,None,17,23,'R','32')
v(7,'bekri','de bonne heure','adverbe',None,None,None,17,23,'R','32')
v(7,'men','de, en provenance de','préposition',None,None,None,17,23,'R','32')
v(7,'lamma','lorsque, quand','conjonction',None,None,None,17,23,'R','32',notes='synonyme mnin (leçon 10)')
v(7,'b-ez-zâf','beaucoup, énormément','expression',None,None,None,17,23,'R','32')
v(7,'b-râh-i','de moi, avec ma personne','expression',None,None,None,17,23,'R','32')
v(7,'men-baed','ensuite, puis','expression',None,None,None,17,23,'R','32')
v(7,'jmie','ensemble','adverbe',None,None,None,17,23,'R','32')
v(7,'hetta-šay','la moindre chose','expression',None,None,None,17,23,'R','32')
v(7,'sbâh el-hér','bonjour','expression',None,None,None,17,22,'L','32')
# Leçon 8 — vocabulaire
v(8,'sâheb','camarade, ami','nom',None,'shâb',None,19,27,'R','38')
v(8,'tfal','enfant, garçonnet, jeune homme','nom',None,None,None,19,27,'R','38')
v(8,'môla-','propriétaire de','nom',None,None,None,19,27,'R','38',notes='môl-, mô- ; féminin môlat')
v(8,'sâha','cour, place','nom','f',None,None,19,27,'R','38')
v(8,'le-hsâb','le calcul','nom',None,None,None,19,27,'R','38')
v(8,'qâeat-ed-dars','salle de classe','nom','f',None,None,19,27,'R','38')
v(8,'et-temrin','devoir','nom',None,None,None,19,26,'L','38',notes='OCR partiel ; forme attestée dans le texte')
v(8,'sahl','facile','adj',None,None,None,19,27,'R','38')
v(8,'seâb','difficile','adj',None,None,None,19,27,'R','38')
v(8,'dars','leçon, cours','nom',None,None,None,19,27,'R','38')
v(8,'el-musallim','le maître, l’enseignant, le professeur','nom',None,None,None,19,27,'R','38')
v(8,'emel','faire, travailler','verbe',None,None,None,19,27,'R','38')
v(8,'ujed','trouver','verbe',None,None,None,19,26,'L','38',notes='OCR partiel ; forme attestée dans le texte')
v(8,'leab','jouer, s’amuser','verbe',None,None,None,19,27,'R','38')
v(8,'teallem','apprendre, étudier','verbe',None,None,None,19,27,'R','38')
v(8,'hfad','apprendre par cœur, conserver, protéger','verbe',None,None,None,19,27,'R','38')
v(8,'thseb','il compte','verbe',None,None,None,19,27,'R','38',notes='verbe hsâb à l’inaccompli')
v(8,'lâ-ken','mais','conjonction',None,None,None,20,28,'L','38')
v(8,'hâkda','ainsi, de cette façon','adverbe',None,None,None,20,28,'L','38')
v(8,'el-bâreh','la veille, hier','adverbe',None,None,None,20,28,'L','38')
v(8,'hér-men','mieux que, plus que','expression',None,None,None,20,28,'L','38')
v(8,'hâ-','voici (suivi d’un pronom isolé de 3e pers.)','particule',None,None,None,20,28,'L','38')
v(8,'sna','année','nom','f',None,'snîn',None,19,26,'L','38')
v(8,'eam','an, année','nom',None,None,None,19,26,'L','38')
# Leçon 9 — vocabulaire
v(9,'caziz','cher, chéri','adj',None,None,None,22,32,'L','44')
v(9,'matrûha','versée, renversée','participe','f',None,None,22,32,'L','44')
v(9,'ard','terre','nom','f',None,None,22,32,'L','44')
v(9,'felfel','poivrons','nom collectif','m',None,None,22,32,'L','44')
v(9,'hšîn','gros, grossier','adj',None,None,None,22,32,'L','44')
v(9,'el-bâyec','le vendeur','nom',None,None,None,22,32,'L','44',notes='variante bâis')
v(9,'el-goffa','le couffin','nom',None,None,None,22,32,'L','44')
v(9,'es-slâma','la paix, le salut','nom',None,None,None,22,32,'L','44')
v(9,'dhab','aller, s’en aller, partir','verbe',None,None,None,22,32,'L','44',notes='inaccompli yedhab')
v(9,'râh','s’en aller, partir','verbe',None,None,None,22,32,'L','44',notes='inaccompli irûh ; homonyme de râh « il est » (leçon 4)')
v(9,'šra','acheter','verbe',None,None,None,22,32,'L','44',notes='inaccompli išri')
v(9,'nzar','regarder, examiner','verbe',None,None,None,22,32,'L','44',notes='inaccompli yanzor')
v(9,'bda','commencer','verbe',None,None,None,22,32,'L','44',notes='inaccompli ibda')
v(9,'hemmem','penser, réfléchir','verbe',None,None,None,22,32,'L','44',notes='inaccompli ihemmem')
v(9,'hallas','payer, régler','verbe',None,None,None,22,32,'L','44',notes='inaccompli ihallas')
v(9,'uzen','peser, mesurer','verbe',None,None,None,22,32,'L','44',notes='inaccompli yuzen')
v(9,'trâh','verser','verbe',None,None,None,22,32,'L','44',notes='inaccompli itrâh')
v(9,'eraf','connaître','verbe',None,None,None,22,32,'L','44',notes='inaccompli yacraf')
v(9,'gder','pouvoir','verbe',None,None,None,22,32,'L','44',notes='inaccompli igder')
v(9,'rjas','revenir','verbe',None,None,None,22,32,'L','44',notes='inaccompli irjas')
v(9,'yâ-[lâh','allons ! courage !','expression',None,None,None,22,32,'L','44')
v(9,'ma-dâbiya','je veux bien, il me plaît de','expression',None,None,None,22,32,'L','44')
v(9,'gedwa','demain','adverbe',None,None,None,22,32,'L','44',notes='variante gda')
v(9,'kilu','kilo','nom',None,None,None,21,31,'L','44')
v(9,'dôro','douro (ancienne unité monétaire)','nom',None,None,None,21,31,'L','44',notes='valeur historique : 5 centimes')
v(9,'drâhem','argent','nom',None,None,None,22,33,'R','46',notes='OCR partiel ; à confirmer')
v(9,'sahha','bon, bien, d’accord','expression',None,None,None,21,31,'R','44',notes='variante sahét')
# Leçon 10 — vocabulaire
v(10,'el-msîd','l’école coranique','nom',None,None,None,24,36,'L','49')
v(10,'yedd','main','nom','f',None,None,24,36,'L','49')
v(10,'el-jeld','le cuir','nom',None,None,None,24,36,'L','49')
v(10,'ed-dheb','l’or','nom',None,None,None,24,36,'L','49')
v(10,'es-Sêh','le maître religieux, le vieillard','nom',None,None,None,24,36,'L','49')
v(10,'ayât-el-qorân','les versets du Coran','nom',None,None,None,24,36,'L','49')
v(10,'lôha','planche','nom','f',None,None,24,36,'L','49')
v(10,'en-nâs','les gens, le public','nom collectif',None,None,None,24,36,'L','49')
v(10,'balâ','mal, malheur','nom',None,None,None,24,36,'L','49')
v(10,'dâheb','allant','participe actif',None,None,None,24,36,'L','49')
v(10,'mabrûk','béni','participe passif',None,None,'brk',24,36,'L','49')
v(10,'mseffer','relié','participe passif',None,None,None,24,36,'L','49')
v(10,'mzewweg','décoré, orné','participe passif',None,None,None,24,36,'L','49')
v(10,'mrabbae','assis, les jambes croisées','participe passif',None,None,None,24,36,'L','49')
v(10,'erîda','large (f.)','adj','f',None,None,24,36,'L','49')
v(10,'dâyrin bi-h','l’entourant (pl.)','participe actif',None,None,None,24,36,'L','49')
v(10,'eâlem','savant','participe actif',None,None,'elm',24,36,'L','49')
v(10,'msellmin elih','le saluant','participe actif',None,None,None,24,36,'L','49')
v(10,'karim','généreux, noble','adj',None,None,None,24,36,'L','49')
v(10,'mektûb','écrit','participe passif',None,None,'ktb',24,36,'L','49')
v(10,'mahfûd','protégé, su par cœur','participe passif',None,None,'hfd',24,36,'L','49')
v(10,'hâfed','protégeant, sachant par cœur','participe actif',None,None,'hfd',24,36,'L','49')
v(10,'ela-s-sebea','à sept heures','expression',None,None,None,24,36,'L','49')
v(10,'wella','ou, ou bien','conjonction',None,None,None,24,36,'L','49')
v(10,'b-et-tagrib','environ, avec approximation','expression',None,None,None,24,36,'L','49')
v(10,'el-kull','le tout, en totalité','expression',None,None,None,24,36,'L','49')
v(10,'grêb','bientôt, proche','adverbe',None,None,None,24,36,'L','49')
v(10,'kull-','tout, chaque','déterminant',None,None,None,24,36,'L','49')
v(10,'kull-wâhed','chacun','expression',None,None,None,23,35,'R','49')
v(10,'kull-wâhda','chacune','expression',None,None,None,23,35,'R','49')
# Nombres et jours (leçons 8-9)
nums = [
 (8,'wâhed','un','wâhd-el-'),(8,'wâhda','une','wâhd-el-'),(8,'zûj','deux','zûj-'),
 (8,'tlâta','trois','telt-'),(8,'rabea','quatre','rabe-'),(8,'hemsa','cinq','hems-'),
 (9,'setta','six','sett-'),(9,'sebea','sept','sebe-'),(9,'tmânya','huit','tmân-'),
 (9,'tesca','neuf','tesc-'),(9,'eašra','dix','eašr-'),
]
for lesson, form, gloss, const in nums:
    pdf = 20 if lesson==8 else 23
    printed = 29 if lesson==8 else 34
    par = '42' if lesson==8 else '47'
    v(lesson, form, gloss, 'numéral', None, None, None, pdf, printed, 'R' if lesson==8 else 'L', par, notes=f'état construit : {const}')
days = [
 ('el-hâd','dimanche'),('le-tnin','lundi'),('et-tlâta','mardi'),('la-rbae','mercredi'),
 ('le-hmis','jeudi'),('el-jemca','vendredi'),('es-sebt','samedi'),
]
for form, gloss in days:
    v(9, form, gloss, 'nom', None, None, None, 23, 34, 'L', '47', notes='jour de la semaine ; peut être précédé de nhâr ou yôm')
# Pronoms / démonstratifs / être présent (leçons 3-5, 8)
prons = [
 (3,'hâda','celui-ci, ceci','hâdak'),(3,'hâdi','celle-ci','hâdik'),(3,'hâdu','ceux-ci, celles-ci','hâduk'),
 (3,'hâdak','celui-là, cela',None),(3,'hâdik','celle-là',None),(3,'hâduk','ceux-là, celles-là',None),
 (3,'hâd-el-','ce/cette…-ci (devant nom avec article)',None),
]
for lesson, form, gloss, far in prons:
    v(lesson, form, gloss, 'démonstratif', None, None, None, 11, 10, 'L', '15', notes=f'éloignement : {far}' if far else None)
rani = [
 ('râni','je suis'),('râk','tu es (m.)'),('râki','tu es (f.)'),('râh','il est'),
 ('râha','elle est'),('râna','nous sommes'),('râkum','vous êtes'),('râhum','ils/elles sont'),
]
for form, gloss in rani:
    v(4, form, gloss, 'mot verbal être présent', None, None, 'râ', 13, 14, 'L', '20bis')
iso = [
 ('ana','je'),('enta','tu (m.)'),('enti','tu (f.)'),('huwwa','il'),('hiyya','elle'),
 ('ahna','nous'),('ntuma','vous'),('huma','ils/elles'),
]
for form, gloss in iso:
    v(8, form, gloss, 'pronom isolé', None, None, None, 20, 28, 'L', '39')
suf = [
 ('-i','mon/ma/moi'),(' -k','ton/ta/toi (m.)'),('-ki','ton/ta/toi (f.)'),('-o','son/sa/lui (m.)'),
 ('-ha','son/sa/elle (f.)'),('-na','notre/nous'),('-kum','votre/vous'),('-hum','leur/eux'),
]
for form, gloss in suf:
    v(5, form.strip(), gloss, 'pronom suffixe', None, None, None, 14, 17, 'R', '25')

# grammar rules: lesson, par, title, summary, examples, pdf, printed, side, notes
R = []
def r(lesson, par, title, summary, examples, pdf, printed, side, notes=None):
    R.append(dict(lesson=lesson, par=par, title=title, summary=summary, examples=examples, pdf=pdf, printed=printed, side=side, notes=notes))

r(1,'1','Remarques préliminaires','Le manuel décrit un « parler moyen » algérien, non un dialecte unique. La transcription latine est phonétique et simplifiée ; chaque caractère se prononce avec sa valeur propre.',[{'latin':'el-gedra','fr':'se prononce el-guedra (g dur)'},{'latin':'râsek','fr':'se prononce râcek (s sourd)'}],6,1,'R')
r(1,'2','Consonnes communes','Consonnes communes au français et à l’arabe ; g toujours dur, r roulé, s sourd, š = ch, j = dj.',[{'latin':'š','fr':'ch'},{'latin':'j','fr':'dj'}],6,1,'R')
r(1,'3','Consonnes emphatiques','Les emphatiques (d, s, t, etc.) se prononcent avec emphase ; l’emphase peut contaminer le début/milieu du mot.',[{'latin':'sôg','fr':'marché'}],7,2,'L')
r(1,'4','Voyelles','Trois voyelles fondamentales a/u/i, brèves ou longues â/û/î ; voyelle neutre e non muette ; timbre conditionné par emphase/gutturales.',[{'latin':'â','fr':'a long'},{'latin':'e','fr':'voyelle neutre articulée'}],7,2,'L')
r(1,'6','Article el','Article unique el, valable pour les deux genres et les deux nombres ; placé devant nom ou adjectif épithète d’un nom déterminé.',[{'latin':'el-ktâb','fr':'le livre'},{'latin':'el-bent','fr':'la fille'}],7,3,'R')
r(1,'6bis','Article et adjectif','Le nom sans article correspond souvent à un indéfini ; l’adjectif suit le nom et prend l’article si le nom est déterminé.',[{'latin':'ktâb','fr':'un livre'},{'latin':'el-ktâb el-kbir','fr':'le grand livre'}],8,4,'L')
r(2,'8','Consonnes gutturales','Cinq gutturales : h, ḥ, x, ɛ, q (transcrites selon le système du livre). q peut être prononcé g en milieu rural.',[{'latin':'gâl','fr':'il a dit'},{'latin':'eabd-allâh','fr':'Abdallah'}],8,5,'R',notes='Transcription du livre à conserver ; ne pas confondre avec 3/7 modernes.')
r(2,'9','Structure des mots','Les mots sont dérivés de racines consonantiques ; les voyelles précisent sens et nature grammaticale ; e neutre facilite l’articulation.',[{'latin':'kteb','fr':'il a écrit'},{'latin':'ktâb','fr':'livre'},{'latin':'ktüb','fr':'livres'}],9,6,'L')
r(2,'11','Article : modifications phonétiques','el peut devenir le/la devant deux consonnes ; le l s’assimile devant dentales/prépalatales (d, t, r, s, š, z, etc.).',[{'latin':'ed-dâr','fr':'la maison'},{'latin':'er-râjel','fr':'l’homme'},{'latin':'eš-šems','fr':'le soleil'}],9,7,'R')
r(2,'11bis','Annexion','Un nom sans article suivi d’un autre nom forme un rapport d’annexion ; le second peut être remplacé par un pronom suffixe. Féminin -a devient -at/-et en annexion.',[{'latin':'weld-Mohammed','fr':'le garçon de Mohammed'},{'latin':'câsémat-el-jazâir','fr':'la capitale de l’Algérie'}],10,8,'L')
r(3,'15','Démonstratif','Proximité hâda/hâdi/hâdu ; éloignement hâdak/hâdik/hâduk (ou dak/dik/duk). Devant nom avec article : hâd-el- ; sinon pronom.',[{'latin':'hâd-el-bent','fr':'cette fille-ci'},{'latin':'hâda weld','fr':'celui-ci est un garçon'}],11,10,'L')
r(4,'18','Interrogation','Interrogation par ton ou mot interrogatif en tête : wâš, škûn, men, elaš, kéf, wén, weqtaš, šhâl, mnayn, etc.',[{'latin':'ké-râk ?','fr':'comment vas-tu ?'},{'latin':'wén-râh ?','fr':'où est-il ?'}],12,13,'R')
r(4,'20','Être présent : proposition sans verbe','Souvent le verbe être au présent ne s’exprime pas ; l’attribut s’accorde en genre/nombre mais n’a pas l’article.',[{'latin':'hâda, fellâh','fr':'celui-ci est un cultivateur'},{'latin':'Fâtéma, sgêra','fr':'Fatma est jeune'}],12,13,'R')
r(4,'20bis','Être présent : râni/râk/râh','Quand le sujet est un pronom ou sens existence/localisation, on emploie râni, râk, râki, râh, râha, râna, râkum, râhum.',[{'latin':'râni sgêr','fr':'je suis jeune'},{'latin':'Mohammed râh b-hér','fr':'Mohammed va bien'}],13,14,'L')
r(5,'25','Pronoms personnels suffixes','Suffixes à un nom (possession), à un verbe (objet direct) ou à une préposition (objet indirect). Ex. dâr-i, dâr-ek, dâr-o, dâr-ha, dâr-na, dâr-kum, dâr-hum.',[{'latin':'ktâb-i','fr':'mon livre'},{'latin':'drab-ni','fr':'il m’a frappé'},{'latin':'mea-k','fr':'avec toi'}],14,17,'R')
r(5,'26','Avoir présent : eand-','Le verbe avoir (possession) n’existe pas comme tel ; on emploie eand- + pronom suffixe.',[{'latin':'eand-i dâr','fr':'j’ai une maison'},{'latin':'eand-o weld','fr':'il a un garçon'}],14,17,'R')
r(5,'26bis','Possession : mtâe / dyâl','mtâe (ou ntâe) / dyâl exprime la possession après nom avec article, ou la matière après nom sans article.',[{'latin':'ed-dâr mtâe bû-ya','fr':'la maison de mon père'},{'latin':'zerbîya mtâe es-sôf','fr':'un tapis de laine'}],15,18,'L')
r(7,'33','Le verbe et la racine','Le verbe coïncide avec la racine ; pas d’infinitif. La racine est donnée à la 3e personne masculin singulier de l’accompli.',[{'latin':'kteb','fr':'il a écrit'},{'latin':'emel','fr':'il a fait'}],18,24,'L')
r(7,'35','Accompli','L’accompli exprime le passé ; suffixes de personne ; voyelle intérieure peut se déplacer (ressaut). Ex. kteb, ketbet, ktebna, ktebtu, ketbu.',[{'latin':'ktebt','fr':'j’ai écrit / tu as écrit (m.)'},{'latin':'ketbet','fr':'elle a écrit'},{'latin':'ktebna','fr':'nous avons écrit'}],18,24,'L')
r(7,'36','Négation ma…-ši','Négation verbale : ma + verbe + ši (réduit -š). Sans verbe être : ma-ši. ši seul après verbe peut marquer interrogation.',[{'latin':'ma kteb-ši','fr':'il n’a pas écrit'},{'latin':'Fâtéma ma-ši farhâna','fr':'Fatma n’est pas contente'}],18,25,'R')
r(8,'39','Pronoms personnels isolés','ana, enta/enti, huwwa/hiyya, ahna/hna, ntuma/entum, huma/hum. Sujets de proposition sans verbe ou apposition ; distinguent emelt (j’ai fait) de emelt (tu as fait).',[{'latin':'ana kbir','fr':'je suis grand'},{'latin':'hâ-hiyya qâeat-ed-dars','fr':'voici la salle de classe'}],20,28,'L')
r(8,'42','Nombres 1 à 5','État isolé vs état construit : wâhed/wâhda → wâhd-el- ; zûj → zûj- ; tlâta → telt- ; rabea → rabe- ; hemsa → hems-. De 3 à 10, e de liaison devant consonne.',[{'latin':'wâhd-el-weld','fr':'un garçon'},{'latin':'telt-e-byût','fr':'trois pièces'},{'latin':'hems-e-snîn','fr':'cinq ans'}],20,29,'R')
r(9,'45','Inaccompli','L’inaccompli exprime présent ou futur ; préfixes de personne (n-, t-, y-/i-, etc.) + suffixes aux formes longues. Ex. nekteb, tekteb, yekteb/ikteb, neketbu, teketbu, iketbu.',[{'latin':'nekteb','fr':'j’écris / j’écrirai'},{'latin':'ikteb','fr':'il écrit / il écrira'}],22,32,'L')
r(9,'45bis','Inaccompli : variantes','La voyelle du préfixe peut varier ; la consonne est stable. Les verbes dérivés suivent généralement le même schéma. La voyelle intérieure peut disparaître devant suffixe.',[{'latin':'nhallas','fr':'je paye'},{'latin':'nhalls-ek','fr':'je te paye'}],22,33,'R')
r(9,'47','Nombres 6 à 10 et jours','setta/sett-, sebea/sebe-, tmânya/tmân-, tesca/tesc-, eašra/eašr-. Jours : el-hâd, le-tnin, et-tlâta, la-rbae, le-hmis, el-jemca, es-sebt.',[{'latin':'sebea kilu','fr':'sept kilos'},{'latin':'nhâr le-hmis','fr':'jeudi'}],23,34,'L')
r(10,'50','kân / ikûn','Être au passé (imparfait) ou futur : kân, kânet, kânu ; nkûn, tkûn, ikûn, ikûnu. Transpose un état présent dans le passé/futur.',[{'latin':'l-ulâd kânu gâedîn','fr':'les enfants étaient assis'},{'latin':'grêb ikûn eâlem','fr':'bientôt il sera savant'}],24,37,'R')
r(10,'52','Participes','Participe actif : â après 1re consonne, e après 2e (eâlem, sâken, gâced). Participe passif : ma-/me- + û/ô (mabrûk, mektûb, mahfûd). Dérivés : m-/mu-/me- initial.',[{'latin':'eâlem','fr':'savant'},{'latin':'mektûb','fr':'écrit'},{'latin':'mzewweg','fr':'décoré'}],24,37,'R')
r(10,'52bis','Participes : emploi','Les participes s’emploient comme adjectifs ou substantifs ; après kân/ikûn, ils expriment imparfait ou futur. Féminin -a, pluriel -în.',[{'latin':'kân dâheb','fr':'il allait'},{'latin':'ikûnu msellmin','fr':'ils salueront'}],25,38,'L')
r(11,'54','Impératif (début)','La leçon 11 commence par un récit et annonce l’impératif ; la partie 01 ne contient pas encore le développement complet.',[{'latin':'agra f-el-ktâb !','fr':'lis dans le livre !'}],25,39,'R',notes='À compléter avec partie 02.')

# exercises: lesson, kind, par, prompt, items, pdf, printed, side
E = []
def e(lesson, kind, par, prompt, items, pdf, printed, side):
    E.append(dict(lesson=lesson, kind=kind, par=par, prompt=prompt, items=items, pdf=pdf, printed=printed, side=side))

e(1,'theme','7','Traduire en darija : un livre ; un garçon ; une fille ; un grand garçon ; le grand garçon ; une petite fille ; la grande école ; le grand livre ; une petite femme ; un homme habitant dans un petit logis ; une grande route ; un homme habitant l’Algérie.',[],8,4,'L')
e(2,'theme','12','Traduire : la grande maison ; la petite fille ; la petite école ; la grande école ; le garçon de Kaddour ; la fille de Abdallah ; la maison de Mohammed ; la maison d’un cultivateur ; la maison du cultivateur ; la maison du cuisinier ; la petite maison ; le livre de la fille ; la petite fille de Kaddour ; la petite route ; la route de Tunis ; le livre de Dieu ; le grand garçon de Ali.',[],10,8,'L')
e(3,'reading','13bis','Traduire les expressions du texte 13 en tenant compte du vocabulaire déjà étudié.',[],10,9,'R')
e(3,'theme','14','Traduire : la maison de l’enfant ; la maison de la fille ; la maison de la belle fille ; l’homme domicilié à Paris ; la beauté de Fatma et celle de Kaddour ; Abdallah est petit et Kaddour grand ; la tête de Mohammed ; le livre d’Allah ; Fatma est une belle fille ; Kaddour est un bel homme ; Tunis est une grande capitale ; Rabat est une belle capitale.',[],11,10,'L')
e(3,'theme','16','Traduire : ce garçon-ci ; ce garçon-là ; cette maison-là ; celui-ci est cultivateur et celui-là cuisinier ; celui-ci est le garçon de Mohammed et celle-ci la fille de Kaddour ; celui-ci est domicilié à Alger et celui-là à Rabat ; ce garçon est beau ; cette fille-là est belle ; cette maison-ci est la maison du cultivateur.',[],11,10,'L')
e(4,'version','17bis','Traduire le texte 17 (salutations). Traduction de contrôle fournie par le livre.',[],12,12,'L')
e(4,'translation','19','Prononcer puis traduire : škûn hâda ? škûn hâd-es-sayyed ? škûn hâdi ? wén râk sâken ? eand-men ? kéf hâlek ? mea-men râk sâken ?',[],12,13,'R')
e(4,'theme','21','Traduire : je vais bien ; nous allons bien ; ils vont bien ; comment vas-tu ? comment allez-vous ? Mohammed comment va-t-il ? il va parfaitement bien ; où habite-t-il ? il habite dans la grande école, sur la grand-route ; je suis domicilié chez le restaurateur ; avec qui ? avec Mohammed ; Abdallah est jeune et Fatma âgée ; le fils de Kaddour va bien ; pourquoi ce monsieur habite-t-il dans une tente ? où est Ali ? où sont Ali et Abdallah ? quand est venu ce garçon ?',[],13,14,'L')
e(5,'version','22bis','Traduire le texte 22 (eand-i dâr).',[],14,16,'L')
e(5,'questions','23','Répondre : wâš eand-i ? ed-dâr le-kbira wén râha ? w-ed-dâr es-sgêra wén râha ? škûn sâken f-ed-dâr es-sgêra ? wâš kâyen fi-wast-ha ? imm-à wén gâeda n-nhâr kâmel ? wâš eand-ha guddâm-ha ? wâš kâyen f-el-gedra ? wâš kâyen fi-bît-imm-à ? wâš kâyen f-el-hzâna ? zayy hâd-ed-dâr, š-men zayy ?',[],14,16,'L')
e(5,'theme','24','Traduire : mon garçon ; ta fille ; mon grand garçon ; ta petite fille ; sa grande maison ; son livre (à lui) ; son livre (à elle) ; ta maison est petite ; sa maison est grande ; mon père est avec ton père ; mon frère est avec toi ; ma mère est avec elle ; ma mère est assise dans sa maison ; ma maison se trouve dans le village ; ton frère est avec moi.',[],14,17,'R')
e(5,'theme','27','Traduire : j’ai un tapis en laine ; tu as une maison en banlieue ; il possède une maison dans le centre de la ville ; elle a un grand garçon ; cet homme a une petite fille ; nous avons ton livre ; vous avez une grande natte ; mon frère a un beau livre ; Fatma est dans une grande école ; Abdallah et Fatma ont une belle fille ; ce livre-ci est à moi et celui-là à toi.',[],15,18,'L')
e(6,'version','28bis','Traduire le texte 28 (eand-na dêf).',[],16,20,'L')
e(6,'questions','29','Répondre : škûn eand-na dêf-na el-yôm ? mnayn ja camm-i Milûd ? fâš ja camm-i ? camm-i Milûd râjel kéfâs ? layn hrej hô-ya ? wâš jâb ? wâš snaz ? elâš bû-ya râh farhân ? elaš ja camm-i Milûd le-mdinat-na ? škûn sâken f-dik-ed-dâr ? zayy-ha š-men zayy ?',[],16,21,'R')
e(6,'theme','30','Traduire : ma grande maison ; ta petite fille est dans ma maison ; mon père est avec mon oncle ; son frère est avec ton oncle ; sa maison est grande ; cette maison-ci est à mon oncle et celle-là à mon frère ; nous avons une petite maison en banlieue ; qui est venu aujourd’hui ? mon oncle Miloud est le frère de mon père ; c’est un brave homme ; la maison de mon oncle Miloud est grande ; je suis content et mon frère également ; il a apporté des légumes, des fruits et de la viande ; ma mère est dans la maison ; elle est assise devant mon père et mon oncle sur une natte en alfa ; il y a des légumes au marché.',[],16,21,'R')
e(6,'conjugation','31','Conjuguer oralement : eand-i dâr ; râni sâken ; hâd-el-ktâb mtâe-i ; dâr-i kbira ou ed-dâr dyâl-i kbira.',[],16,21,'R')
e(7,'version','32bis','Traduire le texte 32 (Mohammed w-el-madrasa).',[],17,23,'R')
e(7,'questions','34','Répondre : šhâl râna f-eš-šhar el-yôm ? wâš emel Mohammed es-sbâh bekri f-dâro ? mea-men dhel Mohammed l-el-madrasa ? wâš gâl Mohammed l-sâhb-o ? elaš Mohammed râh farhân el-yôm ? wâš emel f-hâd-el-cotla ? u-cali elaš ma râh-š farhân ? wâš Mohammed weld mlêh ?',[],18,24,'L')
e(7,'theme','37','Traduire : je me suis lavé la figure et j’ai bu mon café, ensuite je suis entré à l’école avec mon frère ; l’école a plu à mon frère ; son ami Ali n’est pas content, mais mon frère est très content ; tu es entré à l’école ce matin de bonne heure ; nous sommes sortis de l’école ; Fatma a travaillé beaucoup pendant ces vacances, mais Ali n’a pas travaillé ; vous êtes sortis de l’école ; qu’avez-vous fait cet été ? nous avons écrit et rempli un cahier complet.',[],18,25,'R')
e(8,'version','38bis','Traduire le texte 38 (Mohammed u-cali f-el-madrasa).',[],20,28,'L')
e(8,'questions','40','Répondre : wén lga-h Mohammed ? wâš gâl Mohammed l-sâhb-o ? wâš emel Mohammed el-bâreh ? u-cali, kéfâš ujed et-temrin ? wâš cemlu jmie ? škûn dak-et-tfal ? u-men-baed škûn ja ? škûn ihseb hér-men cali ? wén dehlu Mohammed u-cali ?',[],20,29,'R')
e(8,'conjugation','41','Conjuguer oralement : ana emelt el-hér ; ana hdemt el-bâreh ; ana ma hfadt-ši le-hsâb.',[],20,29,'R')
e(8,'theme','43','Traduire : bonjour mon ami, comment vas-tu ? et toi ? et ton frère va-t-il bien ? moi je suis un peu malade ; et ton petit frère ? qu’a-t-il fait ce matin ? lui est un brave garçon et toi une brave fille ; c’est un cultivateur domicilié dans le douar ; c’est une brave femme domiciliée à Alger ; vous avez fait le devoir et eux se sont amusés ; qu’as-tu fait hier ? mon petit frère est âgé de quatre ans ; trois garçons sont entrés au cinéma ; dans ma maison il y a deux pièces et une grande cour ; as-tu appris ta leçon ? oui, j’ai appris ma leçon, mais je n’ai pas fait mon devoir.',[],20,29,'R')
e(9,'version','44bis','Traduire le texte 44 (f-es-sûq).',[],22,32,'L')
e(9,'questions','46','Répondre : š-men nhâr el-yôm ? wâš râh iemel Mohammed f-el-haws ? škûn hrej ? wâš gâlet-lo immäh ? wén dhab Mohammed ? wâš gâl lel-bâyec ? š-men hodra šra Mohammed ? šhâl-men kilu ? elaš ma-ihallas-š el-bâyec ? škûn ihalls-o gedwa ? wâš dak-el-bâyec râjel mlêh ? š-men nhâr gedwa ? škûn bûk ?',[],22,33,'R')
e(9,'theme','48','Traduire : que fais-tu aujourd’hui ? aujourd’hui je travaille, et toi ? moi je ne travaille pas parce que c’est dimanche ; Fatma va au marché et elle achète légumes, fruits et viande, ensuite elle entre chez elle ; nous payerons le marchand samedi parce qu’aujourd’hui nous n’avons pas d’argent ; demain Ali ira à l’école avec son petit frère ; ils achèteront sept kilos de fruits à cinquante centimes le kilo ; nous allons au marché aujourd’hui et vous, vous irez demain ; tu examineras les légumes et les fruits.',[],23,34,'L')
e(10,'version','49bis','Traduire le texte 49 (le-msîd).',[],24,36,'L')
e(10,'questions','51','Répondre : š-men nhâr el-yôm ? š-men nhâr kunna l-bâreh ? š-men nhâr nkûnu gedwa ? weqtaš kân Mohammed dâheb l-el-msîd ? wâš kân f-yeddo ? wâš kân dak-el-ktâb ? škûn kân f-el-msîd mnin dhel Mohammed ? šhâl kânu men-ulâd ? elaš igûlu n-nâs l-Mohammed « es-Sêh Mohammed » ?',[],24,37,'R')
e(10,'theme','53','Traduire : aujourd’hui dimanche, Mohammed va à l’école coranique ; il a le livre d’Allah dans la main ; dans l’école coranique, le Cheikh est assis les jambes croisées et les garçons sont assis autour de lui ; le noble Coran est dans la main du Cheikh ; Mohammed est un savant, il sait le Coran par cœur et les gens le saluent ; ce garçon sera protégé ; son père lui a dit ce matin : « Tu seras le Cheikh Mohammed ! Dieu soit béni ! »',[],25,38,'L')
e(10,'conjugation','53bis','Conjuguer : ana kân eand-i ktâb ; tkûn eand-i dâr. Le verbe ne doit pas varier ; ikûn peut rester au masculin singulier même avec sujet féminin éloigné.',[],25,38,'L')

# study texts index (pas de texte brut exporté)
T = [
 (1,'5','Lire les mots et expressions',7,3,'R','complete'),
 (2,'10','Lire les mots et expressions',9,7,'R','complete'),
 (3,'13','Récapitulation : expressions',10,9,'R','complete'),
 (4,'17','yâ-Mohammed, ké-râk ?',11,11,'R','complete'),
 (5,'22','eand-i dâr',13,15,'R','complete'),
 (6,'28','eand-na dêf',15,19,'R','complete'),
 (7,'32','Mohammed w-el-madrasa',17,22,'L','complete'),
 (8,'38','Mohammed u-cali f-el-madrasa',19,26,'L','complete'),
 (9,'44','f-es-sûq',21,31,'L','complete'),
 (10,'49','le-msîd',23,35,'R','complete'),
 (11,'54','Mohammed u-hô-h es-sgêr',25,39,'R','partial'),
]


def main():
    DB.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB)
    con.executescript((ROOT/'db'/'schema.sql').read_text())
    con.execute('PRAGMA foreign_keys=ON')
    m = json.loads((ROOT/'manifest.json').read_text())
    con.execute('''INSERT OR REPLACE INTO sources(source_id,book,part,title,author,publisher,edition,isbn,filename,sha256,bytes,pdf_pages,dialect,register,rights_note)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', (SOURCE_ID,'manuel-arabe-algerien',PART,m['title'],m['author'],m['publisher'],m['edition'],m['isbn'],m['filename'],m['sha256'],m['bytes'],m['pdf_pages'],'arq',m['register'],'Œuvre sous droit (Klincksieck). Usage interne/recherche ; publication app nécessite licence ou contenu original/licencié.'))
    # purge partie 01 (idempotent) — périmètre strict : ne jamais toucher les autres parties
    for table, idcol in [('study_texts','text_id'),('exercises','exercise_id'),
                         ('grammar_rules','rule_id'),('vocabulary','vocab_id')]:
        for (oid,) in con.execute(f'SELECT {idcol} FROM {table} WHERE source_id=?', (SOURCE_ID,)).fetchall():
            con.execute('DELETE FROM review_tasks WHERE object_type=? AND object_id=?', (table, oid))
        con.execute(f'DELETE FROM {table} WHERE source_id=?', (SOURCE_ID,))
    for (lid,) in con.execute('SELECT lesson_id FROM lessons WHERE source_id=?', (SOURCE_ID,)).fetchall():
        con.execute('DELETE FROM review_tasks WHERE object_type=? AND object_id=?', ('lessons', lid))
    con.execute('DELETE FROM lesson_sections WHERE lesson_id IN (SELECT lesson_id FROM lessons WHERE source_id=?)', (SOURCE_ID,))
    con.execute('DELETE FROM lessons WHERE source_id=?', (SOURCE_ID,))
    con.execute('DELETE FROM pages WHERE source_id=?', (SOURCE_ID,))
    meta = json.loads((ROOT/'ocr'/'partie-01-colonnes'/'ocr-columns.json').read_text())
    for p in meta['pages']:
        n=p['pdf_page']; printed=p['printed_pages']
        for side,key in [('L','left'),('R','right')]:
            pp=printed[0] if side=='L' else printed[1]
            info=p[key]
            con.execute('''INSERT INTO pages(source_id,pdf_page,printed_page,side,ocr_file,ocr_langs,ocr_psm,ocr_chars,quality)
            VALUES(?,?,?,?,?,?,?,?,?)''',(SOURCE_ID,n,pp,side,info['file'],info['langs'],info['psm'],info['chars'],'ocr_columns'))
    lesson_ids={}
    for no,title,sp,spn,ep,epn,comp,topics in LESSONS:
        cur=con.execute('''INSERT INTO lessons(source_id,lesson_no,title_fr,topics,start_pdf_page,start_printed_page,end_pdf_page,end_printed_page,completeness,status)
        VALUES(?,?,?,?,?,?,?,?,?,?)''',(SOURCE_ID,no,title,j(topics),sp,spn,ep,epn,comp,'needs_review'))
        lesson_ids[no]=cur.lastrowid
    # sections minimales par leçon
    for no,title,sp,spn,ep,epn,comp,topics in LESSONS:
        lid=lesson_ids[no]
        con.execute('''INSERT INTO lesson_sections(lesson_id,kind,paragraph_ref,title,pdf_page,printed_page,side,content_fr,status,notes)
        VALUES(?,?,?,?,?,?,?,?,?,?)''',(lid,'grammar',None,title,sp,spn,'L',title,'needs_review','Section repérée ; contenu détaillé dans grammar_rules/vocabulary.'))
    # vocab
    for i, item in enumerate(V, 1):
        lid=lesson_ids[item['lesson']]
        uid=f"tapiero-p01-l{item['lesson']:02d}-{slug(item['form'])}-{i:03d}"
        con.execute('''INSERT INTO vocabulary(lesson_id,source_id,entry_uid,form_latin,form_ar,pos,gender,plural,root,gloss_fr,example_latin,example_fr,pdf_page,printed_page,side,paragraph_ref,status,notes)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',(lid,SOURCE_ID,uid,item['form'],None,item['pos'],item['gender'],item['plural'],item['root'],item['gloss'],item['ex'],item['exfr'],item['pdf'],item['printed'],item['side'],item['par'],'needs_review',item['notes']))
    # rules
    for i, item in enumerate(R, 1):
        lid=lesson_ids[item['lesson']]
        uid=f"tapiero-p01-rule-{item['par']}-{slug(item['title'])}"
        con.execute('''INSERT INTO grammar_rules(lesson_id,source_id,rule_uid,paragraph_ref,title,summary_fr,examples_json,pdf_page,printed_page,side,status,notes)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?)''',(lid,SOURCE_ID,uid,item['par'],item['title'],item['summary'],j(item['examples']),item['pdf'],item['printed'],item['side'],'needs_review',item['notes']))
    # exercises
    for i, item in enumerate(E, 1):
        lid=lesson_ids[item['lesson']]
        uid=f"tapiero-p01-ex-{item['par']}-{slug(item['prompt'][:40])}"
        con.execute('''INSERT INTO exercises(lesson_id,source_id,exercise_uid,kind,paragraph_ref,prompt_fr,items_json,pdf_page,printed_page,side,status)
        VALUES(?,?,?,?,?,?,?,?,?,?,?)''',(lid,SOURCE_ID,uid,item['kind'],item['par'],item['prompt'],j(item['items']),item['pdf'],item['printed'],item['side'],'needs_review'))
    # texts
    for lesson, par, title, pdf, printed, side, comp in T:
        lid=lesson_ids[lesson]
        uid=f"tapiero-p01-text-{par}"
        con.execute('''INSERT INTO study_texts(lesson_id,source_id,text_uid,paragraph_ref,title_latin,latin_text,ar_text,fr_translation,pdf_page,printed_page,side,status,notes)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)''',(lid,SOURCE_ID,uid,par,title,None,None,None,pdf,printed,side,'needs_review',f'Texte {comp} ; transcription à valider avant publication. OCR colonnes disponible en interne.'))
    # review tasks
    def add_tasks(table, idcol, reason, priority):
        for row in con.execute(f'SELECT {idcol} FROM {table} WHERE source_id=?', (SOURCE_ID,)):
            con.execute('INSERT INTO review_tasks(object_type,object_id,reason,priority,status) VALUES(?,?,?,?,?)', (table, row[0], reason, priority, 'open'))
    add_tasks('vocabulary','vocab_id','Validation native forme + sens + registre Tapiéro',2)
    add_tasks('grammar_rules','rule_id','Validation native règle + exemples',2)
    add_tasks('exercises','exercise_id','Validation consigne + corrigé à produire',3)
    add_tasks('study_texts','text_id','Transcription/validation texte latin + arabe avant publication',1)
    add_tasks('lessons','lesson_id','Validation pédagogique leçon',3)
    con.execute('INSERT INTO processing_runs(part,step,finished_at,details_json) VALUES(?,?,datetime("now"),?)', (PART,'ingestion_curated',j({'vocab':len(V),'rules':len(R),'exercises':len(E),'texts':len(T),'lessons':len(LESSONS)})))
    con.commit()
    # exports
    exp=ROOT/'exports'/'partie-01'
    exp.mkdir(parents=True, exist_ok=True)
    def dump(name, rows):
        (exp/f'{name}.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2), encoding='utf-8')
        if rows:
            with (exp/f'{name}.csv').open('w',newline='',encoding='utf-8') as f:
                w=csv.DictWriter(f, fieldnames=list(rows[0].keys()))
                w.writeheader(); w.writerows(rows)
    lessons=[dict(lesson_no=r[0], title=r[1], start_pdf_page=r[2], start_printed_page=r[3], end_pdf_page=r[4], end_printed_page=r[5], completeness=r[6], topics=r[7], status='needs_review') for r in LESSONS]
    dump('lessons', lessons)
    dump('vocabulary', [dict(entry_uid=f"tapiero-p01-l{x['lesson']:02d}-{slug(x['form'])}-{i:03d}", lesson_no=x['lesson'], form_latin=x['form'], form_ar=None, pos=x['pos'], gender=x['gender'], plural=x['plural'], root=x['root'], gloss_fr=x['gloss'], example_latin=x['ex'], example_fr=x['exfr'], pdf_page=x['pdf'], printed_page=x['printed'], side=x['side'], paragraph_ref=x['par'], status='needs_review', notes=x['notes']) for i,x in enumerate(V,1)])
    dump('grammar_rules', [dict(rule_uid=f"tapiero-p01-rule-{x['par']}-{slug(x['title'])}", lesson_no=x['lesson'], paragraph_ref=x['par'], title=x['title'], summary_fr=x['summary'], examples=x['examples'], pdf_page=x['pdf'], printed_page=x['printed'], side=x['side'], status='needs_review', notes=x['notes']) for x in R])
    dump('exercises', [dict(exercise_uid=f"tapiero-p01-ex-{x['par']}-{slug(x['prompt'][:40])}", lesson_no=x['lesson'], kind=x['kind'], paragraph_ref=x['par'], prompt_fr=x['prompt'], items=x['items'], pdf_page=x['pdf'], printed_page=x['printed'], side=x['side'], status='needs_review') for x in E])
    dump('study_texts_index', [dict(text_uid=f"tapiero-p01-text-{par}", lesson_no=lesson, paragraph_ref=par, title_latin=title, pdf_page=pdf, printed_page=printed, side=side, completeness=comp, status='needs_review', latin_text=None, ar_text=None, fr_translation=None) for lesson,par,title,pdf,printed,side,comp in T])
    counts={t:con.execute(f'SELECT COUNT(*) FROM {t}').fetchone()[0] for t in ['sources','pages','lessons','lesson_sections','vocabulary','grammar_rules','exercises','study_texts','review_tasks']}
    (exp/'counts.json').write_text(json.dumps(counts,ensure_ascii=False,indent=2), encoding='utf-8')
    print(json.dumps(counts,ensure_ascii=False,indent=2))
    print('integrity', con.execute('PRAGMA integrity_check').fetchone()[0])
    con.close()

if __name__=='__main__':
    main()
