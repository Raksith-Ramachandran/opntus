const ADJ=["Calm","Silent","Blue","Gentle","Quiet","Soft","Still","Bright","Clear","Fresh","Light","Peaceful","Warm","Kind","Serene","Tender","Mindful","Open","Free","Steady","Hopeful","Humble","Golden","Silver","Crystal","Dawn","Dusk","Misty"];
const NOUN=["River","Sky","Leaf","Wave","Stone","Star","Moon","Cloud","Rain","Wind","Tree","Bird","Path","Light","Shore","Hill","Brook","Lake","Meadow","Grove","Petal","Ember","Glow","Tide","Mist","Bloom","Echo","Spark","Hollow","Crest","Drift","Willow"];
const rnd=<T>(a:T[])=>a[Math.floor(Math.random()*a.length)];
export const generateAnonymousName=async():Promise<string>=>`${rnd(ADJ)}${rnd(NOUN)}${Math.floor(Math.random()*90)+10}`;
export const isValidAnonymousName=(n:string)=>/^[A-Za-z]{4,20}[0-9]{2}$/.test(n);
