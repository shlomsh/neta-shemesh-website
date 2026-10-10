# Neta Shemesh — נטע שמש

> Source of truth for who Neta is and what this website is for. All copy on the
> site should be consistent with the voice and facts captured here.

## Who she is

Neta Shemesh is a couple and family therapist with **14 years of clinical
experience**. She is an **M.S.W. clinical social worker** and a member of the
Israeli association for couple and family therapy.

Her work centers on guiding people through **change, crisis, and growth** —
within couples, within families, and within themselves. Her therapeutic approach
combines **psychodynamic, systemic, and trauma-informed perspectives**.

### Professional background
- **Social Services Department** (Ra'anana municipality and others): Diverse roles including family social worker (from infancy to adolescence), social worker for women leaving shelters, clubhouses social worker, and "The New Way" (הדרך החדשה) social worker.
- **Group Facilitation**: Led parenting guidance groups and therapeutic styling groups.
- **"Shachar" Organization**: Guided foster families and conducted family assessments for the Ministry of Welfare.
- **Current Practice**: Couple and family therapist at the Couple and Family Therapy Station in the Lev HaSharon Regional Council, and owner of a private clinic in Netanya (Poleg neighborhood).


### Tone & brand voice
- **Warm, calm, safe.** Not clinical or cold.
- Hebrew-first, RTL. Tagline: **"מקום בטוח לצמוח בו ביחד"** (a safe place to grow
  together).
- Invitational, low-pressure: *"בואו נמצא את הדרך חזרה אחד לשנייה"* (let's find
  our way back to each other). First contact is framed as a short, no-commitment
  conversation.

## Services

1. **Couple therapy** — relationship dynamics, communication patterns.
2. **Family therapy** — family bonds, managing dynamics.
3. **Parenting guidance** — practical tools for age-specific challenges.
4. **Personal accompaniment** — emotional processing, life transitions.

## Social proof
Not on the site yet. The "לקוחות ממליצים" block is parked (`SHOW_TESTIMONIALS = false` in
`src/app/page.tsx`; its content is placeholder text) until real client quotes exist. A draft
quote from Netta's notes, unpublished and unverified:
> "She created a space where we could finally hear each other. For the first time
> in years, we felt on the same side." — *L & D, after an 8-month process.*

The credentials card does state a consistent 5-star rating from clients.

## Contact
- Primary CTA: **תיאום פגישת ייעוץ** (schedule a consultation). On the site today: hero
  "ייעוץ עם נטע שמש", CTA band "קביעת פגישת ייעוץ", and the floating pill (WhatsApp / call).
- Channel: **WhatsApp** — a short introductory call, no commitment. Phone and email are
  secondary; there is no contact form.
- Where: one clinic in **Netanya** (Poleg). Sessions are **in person only**; no online therapy,
  and no other cities are claimed.
- The contact section has two panels: **עקבו אחריי** (social) and **המשרד שלי** (clinic details + map).
  Facts live in `src/content/site.ts`.

---

## Website abstract

A small, content-focused **marketing site** for Neta's private practice. Its job
is to make a warm first impression, establish trust and credentials, explain the
four service areas, and convert visitors into a low-friction first contact
(WhatsApp / consultation booking).

It is **Hebrew-first and RTL**, with a soft, grounded visual language built on the
chosen palette. The aesthetic should feel like the tagline — *a safe place* —
through generous whitespace, gentle motion, and warm, muted tones rather than
bright, busy, or corporate design.

### Page outline (home page, anchored sections, in order)
1. **Hero** — name, tagline, primary CTA.
2. **Intro** — "ליווי מקצועי לזוגות", photo collage.
3. **Expertise** — the four service areas as cards.
4. **Bio** — "קצת עלי": background, philosophy pull-quote, signature.
5. **Credentials** — 14 years of clinical experience, couple and family therapist, parent
   guidance, M.S.W. clinical social worker, group facilitator, consistent 5-star client rating.
6. **Reignite** — "להצית מחדש", photo band.
7. **Services** — "איך זה עובד?", the four steps of the process.
8. **CTA band** — "קביעת פגישת ייעוץ" over a photo.
9. **Gallery** — six-photo grid.
10. **Contact** — social panel and clinic panel with map.
11. **Footer** — tagline, contact link, signature, © line.

Testimonials would sit between Services and the CTA band when un-parked. Blog: `/blog` and two
posts (couple loneliness; why one hour a week is not enough).

### Reference
- Existing site (content + layout reference): https://nettashemesh.lovable.app/
- Visual/layout starting point: a Canva-exported couples-therapist template. The site was built from it and has since been refactored far from it; the files are only a local, git-ignored `reference/template/` folder (the first commit, `8f8d5ba`, holds `couples-therapist.html`). **Modernize, don't copy**: the design language is adapted to Hebrew-first RTL and this brand voice.

---

## Voice

How Netta writes, condensed from her own articles and About texts. Her full articles are the
two posts in `src/content/posts/*.ts`; her About text is on the site in
`src/components/sections/bio/Bio.tsx` and `src/components/blog/AuthorCard.tsx`. Read a post
before writing new copy in her name.

**Style**
- Opens on a recognisable scene or expectation, then speaks to "you" (plural, אתם): "תחשבו על
  הסיטואציה הבאה...", "בואו נדבר רגע על הציפייה המוכרת הזו".
- Plain and direct, but never clinical: "הנה האמת המקצועית שחשוב להגיד בקול רם".
- Turns blame into strength: "זו לא אשמה, זו עוצמה!"; "בקליניקה, אנחנו לא מחפשים אשמים".
- Reframes pain as a signal, not a verdict: loneliness in a couple is "לא סימן שהקשר שלכם נגמר,
  אלא תמרור אזהרה שהקשר שלכם זקוק להזנה".
- Concrete images and numbers instead of jargon: 168 hours in a week and one of them in the
  clinic; two people half a metre apart on a sofa and "שנות אור" of distance; teaching a child
  to swim "על יבש"; "אי בודד".
- Short subheads that are questions or images: "איך הגענו למצב שאנחנו לבד ביחד?", "הגשר חזרה",
  "בשביל לשחות, צריך להיכנס למים".
- Small, doable steps ("מיקרו-רגעים של חיבור", "מרחב נקי ממסכים", "להניח את השריון"), not grand
  gestures or promises of a cure.
- Ends with a warm, low-pressure first-person invitation: "אני מזמינה אתכם ליצור איתי קשר"
  (once with "ונתחיל לצעוד יחד").

**Her own words about her work**
- A safe, empathic, containing, non-judgmental space ("מרחב בטוח, מכיל ולא שיפוטי"); human
  connection "בגובה העיניים" next to professionalism and stability; deep listening next to
  practical thinking.
- Method: psychodynamic, systemic and trauma-informed, fitted to each person, couple or family.
- Belief: "בתוך כל קושי טמון גם פוטנציאל לצמיחה"; together they build a shared language and
  bring closeness back home.

**Vocabulary she uses:** מרחב בטוח / מוגן / מכיל, דינמיקה זוגית / משפחתית, שפה משותפת, לפרק את
השתיקות, ללמוד להקשיב, הדרכת הורים, טיפול דיאדי (parent-child), מנגנוני הגנה, פגיעות,
חיבור, שקט, קרבה, ביטחון.

**Avoid** (see PRODUCT.md anti-references): clinical or diagnostic language, urgency or pressure,
bold claims. Write Hebrew in the feminine first person ("אני מלווה", "אני מאמינה"), "אנחנו" for the work done together.
