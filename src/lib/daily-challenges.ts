// Daily pronunciation challenges — one per day, rotates on a 30-day cycle.

export interface DailyChallenge {
  id: string;
  phrase: string;
  ipa: string;
  difficulty: "Easy" | "Medium" | "Hard";
  focus: string;
  tip: string;
  emoji: string;
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "th-three",
    phrase: "Three thousand thinkers thought through thirty theories",
    ipa: "/θriː ˈθaʊzənd ˈθɪŋkərz ˈθɔːt θruː ˈθɜːrti ˈθɪriz/",
    difficulty: "Hard",
    focus: "/θ/ voiceless dental fricative",
    tip: "Rest tongue tip lightly between teeth — don't bite. Just enough to hear the hiss.",
    emoji: "🐍",
  },
  {
    id: "r-rhythm",
    phrase: "Red lorry, yellow lorry, red lorry, yellow lorry",
    ipa: "/rɛd ˈlɔːri, ˈjɛloʊ ˈlɔːri, rɛd ˈlɔːri, ˈjɛloʊ ˈlɔːri/",
    difficulty: "Hard",
    focus: "/r/ vs /l/ distinction",
    tip: "Curl tongue tip back for /r/ — don't let it touch the roof. For /l/, press tip behind upper teeth.",
    emoji: "🚛",
  },
  {
    id: "vowel-ship",
    phrase: "She sells seashells by the seashore",
    ipa: "/ʃiː sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔːr/",
    difficulty: "Medium",
    focus: "/ʃ/ vs /s/ contrast",
    tip: "For /ʃ/, round lips slightly and pull tongue back. For /s/, keep tongue tip behind teeth, smile.",
    emoji: "🐚",
  },
  {
    id: "schwa-about",
    phrase: "I've thought about it for a couple of hours",
    ipa: "/aɪv ˈθɔːt əˈbaʊt ɪt fər ə ˈkʌpəl əv ˈaʊərz/",
    difficulty: "Medium",
    focus: "Schwa /ə/ reduction",
    tip: "The bold syllables get stressed; everything else reduces to a soft /ə/. Keep unstressed vowels lazy.",
    emoji: "🌊",
  },
  {
    id: "linking-wanna",
    phrase: "What do you want to do this afternoon?",
    ipa: "/wʌt də jə wɑːnə duː ðɪs ˈæftərˌnuːn/",
    difficulty: "Medium",
    focus: "Connected speech: want to → wanna",
    tip: "Drop the 't' in 'want' and the 'to' becomes 'na'. Practice the glide: wahn-na.",
    emoji: "🔗",
  },
  {
    id: "stress-photograph",
    phrase: "Photograph, photographer, photographic",
    ipa: "/ˈfoʊtəˌɡræf, fəˈtɑːɡrəfər, ˌfoʊtəˈɡræfɪk/",
    difficulty: "Hard",
    focus: "Word stress shifts in word families",
    tip: "Stress moves: PHO-to-graph → pho-TOG-ra-pher → pho-to-GRAPH-ic. Stress changes the vowel quality.",
    emoji: "📷",
  },
  {
    id: "rhythm-cantaloupe",
    phrase: "I'd like a cantaloupe, a watermelon, and an apple",
    ipa: "/aɪd laɪk ə ˈkæntəˌloʊp, ə ˈwɔːtərˌmɛlən, ænd ən ˈæpəl/",
    difficulty: "Hard",
    focus: "Content vs function word stress",
    tip: "Content words (nouns, verbs) get stress; function words (a, an, and) reduce. Feel the bounce.",
    emoji: "🍈",
  },
  {
    id: "ae-bat",
    phrase: "Pat sat a fat cat on a mat at bat",
    ipa: "/pæt sæt ə fæt kæt ɑːn ə mæt æt bæt/",
    difficulty: "Easy",
    focus: "/æ/ front vowel (as in cat)",
    tip: "Drop jaw, spread lips slightly. It's brighter than /ɑ/ — keep tongue forward.",
    emoji: "🐈",
  },
  {
    id: "ng-singing",
    phrase: "Singing ringers bring longer songs",
    ipa: "/ˈsɪŋɪŋ ˈrɪŋərz brɪŋ ˈlɔːŋɡər sɔːŋz/",
    difficulty: "Medium",
    focus: "/ŋ/ velar nasal",
    tip: "Back of tongue raises to soft palate. No /g/ unless at end of 'longer' — feel the difference.",
    emoji: "🎤",
  },
  {
    id: "intonation-really",
    phrase: "Really? ... Really. ... Really!",
    ipa: "/ˈriəli ↗ /  /ˈriəli → /  /ˈriəli ↘/",
    difficulty: "Medium",
    focus: "Intonation: question / statement / exclamation",
    tip: "Same words, three meanings. Rising pitch = question. Flat = statement. Falling + emphasis = surprise.",
    emoji: "📈",
  },
  {
    id: "θð-feather",
    phrase: "Father's brother gathered feathers for mother",
    ipa: "/ˈfɑːðərz ˈbrʌðər ˈɡæðərd ˈfɛðərz fɔːr ˈmʌðər/",
    difficulty: "Hard",
    focus: "/θ/ vs /ð/ — voiceless vs voiced dental",
    tip: "Same mouth position. /θ/ is breathy (think); /ð/ vibrates vocal cords (this). Touch throat to feel it.",
    emoji: "🪶",
  },
  {
    id: "r-control",
    phrase: "Park the car in Harvard Yard",
    ipa: "/pɑːrk ðə kɑːr ɪn ˈhɑːrvərd jɑːrd/",
    difficulty: "Medium",
    focus: "American /r/ — rhoticity",
    tip: "American English keeps the /r/ everywhere. Curl tongue back slightly; lips round a touch.",
    emoji: "🚗",
  },
  {
    id: "vowel-heat",
    phrase: "He sees the sheep eating green beans",
    ipa: "/hiː siːz ðə ʃiːp ˈiːtɪŋ ɡriːn biːnz/",
    difficulty: "Easy",
    focus: "/iː/ tense vs /ɪ/ lax",
    tip: "Smile for /iː/ (long, tense). For /ɪ/ (sit), relax the tongue — don't spread lips as wide.",
    emoji: "🐑",
  },
  {
    id: "tap-water",
    phrase: "Better get a bottle of water from Betty",
    ipa: "/ˈbɛɾər ɡɛɾ ə ˈbɑːɾəl əv ˈwɑːɾər frʌm ˈbɛɾi/",
    difficulty: "Hard",
    focus: "American /t/ flap [ɾ] between vowels",
    tip: "Between voiced sounds, /t/ becomes a quick flap — sounds almost like /d/. 'Water' → 'wader'.",
    emoji: "💧",
  },
  {
    id: "stress-desert",
    phrase: "I walked through the desert, then ate dessert",
    ipa: "/aɪ wɔːkt θruː ðə ˈdɛzərt, ðɛn eɪt dɪˈzɜːrt/",
    difficulty: "Medium",
    focus: "DES-ert vs de-SERT stress contrast",
    tip: "Same spelling root, different stress = different meaning. Desert (dry place), dessert (sweet).",
    emoji: "🏜️",
  },
  {
    id: "vowels-bit",
    phrase: "The ship hit the lip of the pit",
    ipa: "/ðə ʃɪp hɪt ðə lɪp ʌv ðə pɪt/",
    difficulty: "Easy",
    focus: "/ɪ/ lax short vowel",
    tip: "Relaxed, short. Don't spread lips into a smile — that makes /iː/. Keep it lazy.",
    emoji: "🚢",
  },
  {
    id: "z-buzzing",
    phrase: "Bees buzz as busy buzzing cousins do",
    ipa: "/biːz bʌz æz ˈbɪzi ˈbʌzɪŋ ˈkʌzɪnz duː/",
    difficulty: "Easy",
    focus: "/z/ voiced sibilant vs /s/ voiceless",
    tip: "Touch throat — vocal cords vibrate for /z/. /s/ is just hiss. 'Bus' → /s/, 'buzz' → /z/.",
    emoji: "🐝",
  },
  {
    id: "linking-see-it",
    phrase: "Can you see it? I want to try it out.",
    ipa: "/kæn juː siː ɪt/ /aɪ wɑːnə traɪ ɪt aʊt/",
    difficulty: "Medium",
    focus: "Vowel-to-vowel linking with /j/ and /w/",
    tip: "'See it' → 'see-yit' (insert /j/). 'Try it' → 'try-wit' (insert /w/). Smooth glide, no gap.",
    emoji: "👁️",
  },
  {
    id: "rhythm-record",
    phrase: "I'll record the record after we finish",
    ipa: "/aɪl rɪˈkɔːrd ðə ˈrɛkərd ˈæftər wiː ˈfɪnɪʃ/",
    difficulty: "Medium",
    focus: "Verb vs noun stress (re-CORD vs RE-cord)",
    tip: "Verb: stress 2nd syllable. Noun: stress 1st. Same spelling, different rhythm, different meaning.",
    emoji: "🎙️",
  },
  {
    id: "ae-ai-bag",
    phrase: "My bag is black, but my bike is brown",
    ipa: "/maɪ bæɡ ɪz blæk, bʌt maɪ baɪk ɪz braʊn/",
    difficulty: "Easy",
    focus: "/æ/ vs /aɪ/ contrast",
    tip: "/æ/ (bag) — short, jaw drops. /aɪ/ (bike) — diphthong, jaw drops then closes. Feel the movement.",
    emoji: "👜",
  },
  {
    id: "fast-going",
    phrase: "Whatcha gonna do? I'm gonna go get some lunch.",
    ipa: "/ˈwʌtʃə ˈɡʌnə duː/ /aɪm ˈɡʌnə ɡoʊ ɡɛt sʌm lʌntʃ/",
    difficulty: "Medium",
    focus: "Casual reductions: what are you → whatcha, going to → gonna",
    tip: "Native speech compresses. 'What are you' → 'whatcha'. 'Going to' → 'gonna'. Practice the flow.",
    emoji: "🏃",
  },
  {
    id: "v-ceiling",
    phrase: "Seven lovely villages voted for vegetables",
    ipa: "/ˈsɛvən ˈlʌvli ˈvɪlɪdʒɪz ˈvoʊtɪd fɔːr ˈvɛdʒtəbəlz/",
    difficulty: "Medium",
    focus: "/v/ voiced labiodental",
    tip: "Top teeth touch bottom lip. Vocal cords vibrate. Don't confuse with /w/ — keep jaw tighter.",
    emoji: "🥬",
  },
  {
    id: "intonation-list",
    phrase: "Apples, bananas, cherries, and dates",
    ipa: "/ˈæpəlz, bəˈnænəz, ˈtʃɛriz, ænd deɪts/",
    difficulty: "Easy",
    focus: "List intonation (rise, rise, fall)",
    tip: "Each item rises except the last. Final 'dates' falls. Pattern signals list is complete.",
    emoji: "🍎",
  },
  {
    id: "ai-mind",
    phrase: "I'd find time to climb if I tried",
    ipa: "/aɪd faɪnd taɪm tuː klaɪm ɪf aɪ traɪd/",
    difficulty: "Medium",
    focus: "/aɪ/ diphthong in consonant clusters",
    tip: "Start with jaw open /a/, glide to /ɪ/. Cluster like 'climb' — silent b, just /aɪm/.",
    emoji: "🧗",
  },
  {
    id: "shadow-ocean",
    phrase: "The ocean's motion is a soothing potion",
    ipa: "/ði ˈoʊʃənz ˈmoʊʃən ɪz ə ˈsuːðɪŋ ˈpoʊʃən/",
    difficulty: "Medium",
    focus: "/ʃ/ — postalveolar fricative",
    tip: "Round lips, tongue blade near roof behind alveolar ridge. 'Shh' sound — air flows smoothly.",
    emoji: "🌊",
  },
  {
    id: "stress-pharmacy",
    phrase: "She went to the pharmacy for a photograph",
    ipa: "/ʃiː wɛnt tuː ðə ˈfɑːrməsi fɔːr ə ˈfoʊtəˌɡræf/",
    difficulty: "Hard",
    focus: "PHAR-ma-cy vs PHO-to-graph (first-syllable stress)",
    tip: "Both stress first syllable but vowel differs. /ɑ/ in pharmacy, /oʊ/ in photograph.",
    emoji: "💊",
  },
  {
    id: "shadow-rhythm",
    phrase: "The rhythm of the river rippled past rocks",
    ipa: "/ðə ˈrɪðəm ʌv ðə ˈrɪvər ˈrɪpəld pæst rɑːks/",
    difficulty: "Hard",
    focus: "/ð/ in connected speech + rhythm",
    tip: "'The' before consonants reduces to /ðə/. 'River' and 'rippled' share /r/ — keep it smooth.",
    emoji: "🏞️",
  },
  {
    id: "vowel-wood",
    phrase: "Good wood would look good in this room",
    ipa: "/ɡʊd wʊd wʊd lʊk ɡʊd ɪn ðɪs ruːm/",
    difficulty: "Medium",
    focus: "/ʊ/ short back rounded vowel",
    tip: "Relaxed /ʊ/ (wood) vs tense /uː/ (room). Lips loosely rounded for /ʊ/, tighter for /uː/.",
    emoji: "🪵",
  },
  {
    id: "rhythm-days",
    phrase: "Sunday, Monday, happy days; Tuesday, Wednesday, happy days",
    ipa: "/ˈsʌndeɪ, ˈmʌndeɪ, ˈhæpi deɪz; ˈtjuːzdeɪ, ˈwɛnzdeɪ, ˈhæpi deɪz/",
    difficulty: "Easy",
    focus: "/deɪ/ diphthong + rhythm pattern",
    tip: "Each '-day' glides from /ɛ/ to /ɪ/. Stress 'SUN' / 'MON' etc. — function word 'happy' gets secondary stress.",
    emoji: "📅",
  },
  {
    id: "fast-get-out",
    phrase: "Get out of here! You've gotta be kidding me!",
    ipa: "/ɡɛˈdaʊdə hɪr/ /juːv ˈɡɑːdə biː ˈkɪdɪŋ miː/",
    difficulty: "Hard",
    focus: "Extreme reductions: get out of → ged-outta, got to → gotta",
    tip: "Native speakers blend aggressively. 'Get out of' becomes 3 syllables. Practice the smash.",
    emoji: "😅",
  },
];

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

export function getDailyChallenge(date = new Date()): DailyChallenge {
  const idx = dayOfYear(date) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[idx];
}

export function getDailyChallengeId(date = new Date()): string {
  return `dc-${date.toISOString().slice(0, 10)}`;
}
