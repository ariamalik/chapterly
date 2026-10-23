-- Demo shelf so a fresh chapterly install is not empty.
-- Idempotent: safe to run on every boot.
--
-- Demo writer: aria@chapterly.dev / demo1234 (pen name "Aria Malik").

insert into writers (email, pen_name, password_hash)
values (
  'aria@chapterly.dev',
  'Aria Malik',
  'scrypt$1a7ff082a3a0704d86120245df55818c$505c50fbb9e1e8d18eaf5a2e2d69171d3897ae6e5284835c60467696cc8df49818ed5a47b38add06ab123374fb852760f2fe0b40eb1cd7de065225001cb6a412'
)
on conflict (email) do nothing;

-- ---------------------------------------------------------------- story one

insert into stories (writer_id, title, slug, synopsis, status)
select
  w.id,
  'The Lantern Keeper',
  'the-lantern-keeper',
  'Every autumn the lighthouse at Corran Point loses its keeper, and every autumn the village sends someone new. This year it sends Maren, who has questions the sea would rather leave unanswered.',
  'published'
from writers w
where w.email = 'aria@chapterly.dev'
on conflict (slug) do nothing;

insert into chapters (story_id, title, body, position, published_at)
select
  s.id,
  'Chapter One: The Fog Line',
  $body$The road gave up being a road about a mile before the gate. Maren walked the rest of it with her suitcase knocking against her shin and the fog closing behind her like a door.

The keeper's cottage smelled of paraffin and old rain. Someone had left a pot of tea on the stove, still warm, and a note weighted down with a brass key: *The light wants oil at dusk. Do not count the steps. — R.*

She counted the steps anyway. Two hundred and eleven of them, and at the top the lamp room turned slowly on its bearings, patient as a heart, throwing its beam out across a sea that had swallowed three men that decade and given back none of them.$body$,
  1,
  now() - interval '9 days'
from stories s
where s.slug = 'the-lantern-keeper'
on conflict (story_id, position) do nothing;

insert into chapters (story_id, title, body, position, published_at)
select
  s.id,
  'Chapter Two: What the Tide Keeps',
  $body$By the third night Maren had learned the light's temper. It wanted oil at dusk, a wiped lens at midnight, and no questions.

The question arrived anyway, in the shape of a rowing boat tethered to the rocks below the point, its oars shipped, its seat dry. Nobody in Corran owned a boat like it. Nobody in Corran would have left it.

In the boathouse she found the logbook, and in the logbook a page in handwriting that matched the note on the stove. Same brass key. Same R. The entry was dated eleven years ago, the night the last keeper walked into the water and did not come out.

Maren read it twice. Then she went up the two hundred and eleven steps and asked the light what it had been keeping.$body$,
  2,
  now() - interval '5 days'
from stories s
where s.slug = 'the-lantern-keeper'
on conflict (story_id, position) do nothing;

-- ---------------------------------------------------------------- story two

insert into stories (writer_id, title, slug, synopsis, status)
select
  w.id,
  'Salt & Paper',
  'salt-and-paper',
  'A letter-writer in a harbour town takes dictation from sailors who cannot read, and learns that some of them are writing to people who died years ago.',
  'published'
from writers w
where w.email = 'aria@chapterly.dev'
on conflict (slug) do nothing;

insert into chapters (story_id, title, body, position, published_at)
select
  s.id,
  'Chapter One: The Dictation Room',
  $body$Nadia's shop sat between the chandlery and the pawnbroker, which meant her customers arrived smelling of rope and leaving with lighter pockets. Two pounds a letter, read aloud if they asked.

She had written to sweethearts, to debt collectors, to mothers, to a magistrate. She had never once been asked to write to the dead — until the Tuesday the old man with salt in his eyebrows put four coins on the counter and said a name she recognised from the parish register.

Nadia took the coins. She wrote the letter. And she noticed, as she blotted the ink, that the man was watching the door as though he expected someone to walk through it.$body$,
  1,
  now() - interval '3 days'
from stories s
where s.slug = 'salt-and-paper'
on conflict (story_id, position) do nothing;
