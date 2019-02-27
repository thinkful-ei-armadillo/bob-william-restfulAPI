-- psql -U dunder_mifflin_admin -d bookmarks -f C:/ei-28/bookmarks-api-owen-william/seeds/seed.bookmarks.sql
-- psql -U dunder_mifflin_admin -d bookmarks_test -f C:/ei-28/bookmarks-api-owen-william/seeds/seed.bookmarks.sql
INSERT INTO bookmarks_table (id, title, url, description, rating)
VALUES (
    1,
    'Thinkful',
    'https://www.thinkful.com',
    'Think outside the classroom',
    5
  ),
  (
    2,
    'Google',
    'https://www.google.com',
    'Where we find everything else',
    4
  ),
  (
    3,
    'MDN',
    'https://developer.mozilla.org',
    'The only place to find web documentation',
    5
  )