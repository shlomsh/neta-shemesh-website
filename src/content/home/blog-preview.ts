import { improveCoupleCommunication } from '../posts/improve-couple-communication';
import { emotionalDistanceInARelationship } from '../posts/emotional-distance-in-a-relationship';
import { oneHourAWeekIsNotEnough } from '../posts/one-hour-a-week-is-not-enough';
import { whenOnlyOnePartnerWantsHelp } from '../posts/when-only-one-partner-wants-help';
import { lonelinessInARelationship } from '../posts/loneliness-in-a-relationship';

export const BLOG_PREVIEW_OPTIONS = [
  { slug: 'hero', name: 'מאמר במסך הפתיחה', description: 'הזמנה לקריאה לצד המסר הראשי, עוד לפני שגוללים.' },
  { slug: 'editorial', name: 'מאמר מוביל', description: 'תמונה גדולה, שאלה מוכרת והבטחה לכלים מעשיים מיד אחרי מסך הפתיחה.' },
  { slug: 'chooser', name: 'מה מעסיק אתכם?', description: 'בחירה אישית של נושא שמובילה למאמר מתאים, בלי צורך לחפש בבלוג.' },
  { slug: 'quote', name: 'רגע של הזדהות', description: 'טיזר רגשי אחרי תחומי הטיפול, שמחבר בין הקושי לבין קריאה נוספת.' },
  { slug: 'magazine', name: 'מגזין מהקליניקה', description: 'שלושה מאמרים בעמוד הבית, עם תמונות ומגוון נושאים לבחירה.' },
] as const;

export type BlogPreviewOption = (typeof BLOG_PREVIEW_OPTIONS)[number]['slug'];

export const BLOG_PREVIEW = {
  eyebrow: 'מחשבות מהקליניקה',
  read: 'לקריאת המאמר',
  all: 'לכל המאמרים',
  hero: {
    label: 'אפשר להתחיל גם בכמה דקות של קריאה',
    all: 'מעבר לכל המאמרים',
    previous: 'המאמר הקודם',
    next: 'המאמר הבא',
    pause: 'השהיית ההחלפה האוטומטית',
    play: 'הפעלת ההחלפה האוטומטית',
    slides: [
      { post: improveCoupleCommunication, hook: 'שוב אותו ריב?', text: 'שלושה צעדים קטנים שיכולים לשנות את השיחה הבאה שלכם.' },
      { post: emotionalDistanceInARelationship, hook: 'חיים יחד, מרגישים רחוקים?', text: 'איך אפשר להתחיל להתקרב כשהשיחות הפכו לטכניות?' },
      { post: whenOnlyOnePartnerWantsHelp, hook: 'רק אחד מכם רוצה עזרה?', text: 'מה אפשר לעשות כשלא מסכימים אם לפנות לטיפול?' },
      { post: lonelinessInARelationship, hook: 'מרגישים לבד בתוך הזוגיות?', text: 'אפשר להתחיל בלמצוא מילים לתחושה שקשה לדבר עליה.' },
      { post: oneHourAWeekIsNotEnough, hook: 'מה יכול להשתנות דווקא בבית?', text: 'על התפקיד של ההורים בשינוי שממשיך מחוץ לחדר הטיפול.' },
    ],
  },
  editorial: {
    title: 'אולי זה בדיוק מה שאתם עוברים',
    subtitle: 'לפעמים הדרך לשינוי מתחילה בלמצוא מילים למה שמרגישים.',
    hook: 'חיים יחד, אבל מרגישים רחוקים?',
    post: emotionalDistanceInARelationship,
  },
  chooser: {
    title: 'מה מעסיק אתכם עכשיו?',
    subtitle: 'בחרו את מה שמרגיש קרוב אליכם. יש מאמר שאפשר להתחיל ממנו.',
    recommendation: 'קריאה שמתאימה לנושא שבחרתם',
    choices: [
      { label: 'אנחנו רבים שוב ושוב', post: improveCoupleCommunication },
      { label: 'הקרבה בינינו התרחקה', post: emotionalDistanceInARelationship },
      { label: 'קשה לנו מול הילדים', post: oneHourAWeekIsNotEnough },
    ],
  },
  quote: {
    title: 'זה נשמע לכם מוכר?',
    subtitle: 'לא כל משבר מתחיל בריב. לפעמים הוא מתחיל בשקט.',
    text: 'אין בינינו ריבים גדולים, אנחנו מסתדרים מצוין ביום-יום, אבל משהו בחיבור פשוט כבה',
    attribution: 'מתוך המאמר על ריחוק רגשי בזוגיות',
    invitation: 'למה זה קורה, ואיך אפשר להתחיל להתקרב מחדש?',
    post: emotionalDistanceInARelationship,
  },
  magazine: {
    title: 'כמה דקות בשביל הקשר שלכם',
    subtitle: 'על השיחות, המרחק וההורות. אולי תמצאו כאן משהו שילווה אתכם גם אחרי הקריאה.',
    posts: [improveCoupleCommunication, emotionalDistanceInARelationship, oneHourAWeekIsNotEnough],
  },
} as const;
