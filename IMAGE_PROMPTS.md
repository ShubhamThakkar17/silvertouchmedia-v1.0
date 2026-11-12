# Image prompts (AI fallback)

Image sources, in priority order (brief §8):

1. Our own brand concept images (`/assets-src/brand` → `pnpm images:brand`).
2. Licensed stock: `pnpm images:fetch`, then choose at `/admin/image-picker` (dev only).
3. The AI prompts below, for channels where neither fits.
4. Other brands' real campaigns: link cards in `inTheWild` only. Never download or host them.

## How to use a generated image

1. Generate at 3:2, at least 2048 px wide.
2. Save the PNG to `assets-src/brand/` with a kebab-case name, e.g. `coral-airline-cabin-at-golden-hour.png`.
3. Run `pnpm images:brand`. This writes the AVIF/WebP files, the 1024 px ribbon texture and the blur placeholder.
4. Pick it at `/admin/image-picker` ("Or a brand concept image"), or set `heroImage` and `cardImage` in the channel's frontmatter by hand.
5. Keep `imageIsConcept: true`. The page then captions it "Concept visual".

## House style (append to every prompt)

> Photoreal, Indian city context, blue hour or warm studio light, coral #FF5B3A accent on
> the media surface, charcoal and silver tones, 3:2, no real brand logos, no legible text.

---

## Needed now (abstract placeholders in use)

### 12 · Airline & In-flight Branding

> Interior of a modern Indian domestic airliner cabin at golden hour, seen from the aisle at
> seated eye level. Seat-back headrest covers and the overhead bin panel carry an abstract
> coral #FF5B3A and silver ribbon design. Warm window light, charcoal and silver cabin
> trim. Business travellers softly out of focus. No airline livery or logos.

### 13 · Cricket Stadiums & Sports

> Indian cricket stadium at night under floodlights, packed stands, a long LED boundary
> board glowing coral #FF5B3A with abstract silver shapes. Shot from the upper stands just
> after blue hour, pitch in sharp focus, crowd slightly motion-blurred. No team, league or
> sponsor logos.

---

## Optional replacements

These are for when a concept image from the deck feels off-brief, or you want a second option.

### 01 · Print Media

> Morning newspaper spread on a wooden table in an Ahmedabad home, cutting chai and
> spectacles beside it. A full-page ad in coral #FF5B3A and charcoal with abstract
> shapes and illegible text blocks. Soft window light, shallow depth of field.

### 02 · Television

> Indian family living room in the evening, a large wall-mounted TV showing an abstract
> coral and silver commercial frame. Family silhouettes on a sofa, warm lamp light.

### 03 · Radio

> Compact FM radio studio with a host's microphone, headphones and a glowing on-air sign
> in coral #FF5B3A. Acoustic panels in charcoal. City lights through the studio window.

### 04 · Cinema

> Multiplex auditorium from the back row, the screen showing an abstract coral and silver
> image, audience heads in silhouette, aisle lights glowing.

### 05 · Hoardings & Billboards

> Large highway billboard beside an Indian expressway at blue hour, the board lit in coral
> #FF5B3A with abstract silver shapes, light trails from traffic below.

### 06 · Digital OOH Screens

> Tall portrait digital screen in a modern Indian mall atrium with jaali patterns, the
> screen showing an abstract coral motion frame, shoppers on escalators softly blurred.

### 07 · Bus, BRTS & Auto Wraps

> Ahmedabad BRTS bus pulling into a glass station at dusk, its side wrapped in a coral
> #FF5B3A and silver abstract design. Two auto-rickshaws with coral hood branding in the
> foreground.

### 08 · Metro Train Wraps

> Metro train crossing an elevated viaduct over an Indian city at blue hour, the whole
> train wrapped in a coral #FF5B3A and silver abstract livery, city lights below.

### 09 · Inside Metro

> Metro station platform in India, commuters waiting, a long backlit panel and a pillar
> wrap in coral #FF5B3A with abstract silver shapes, clean modern architecture.

### 10 · Railways & Train Branding

> Indian intercity express train at dawn on a curve through farmland, one coach wrapped in
> coral #FF5B3A and silver, soft mist and golden light.

### 11 · Airport Branding

> Indian airport departure hall, a large backlit display and baggage belt branded with an
> abstract coral and silver design, travellers with trolleys softly blurred.

### 14 · Brand Ambassadors & Celebrities

> Behind the scenes of an ad shoot on a Gujarat set, a model under soft key light, crew and
> monitors in the foreground, a coral #FF5B3A backdrop.

### 15 · Influencers & Creators

> Young Indian creator filming a product reel on a phone with a ring light in a warm home
> studio, coral #FF5B3A accents on props.

### 16 · Social Media

> Hands holding a smartphone in a café in an Indian city, the screen showing an abstract
> coral and silver social feed, laptop and chai cup nearby.

### 17 · Search & Performance

> Laptop on a desk showing an abstract landing page and analytics dashboard in coral and
> silver, phone beside it with a notification, warm studio light.

### 18 · Digital Articles, Native & PR

> A press briefing room with a lectern, microphones and a backdrop in charcoal with a
> coral #FF5B3A accent stripe, journalists' laptops in the foreground.
