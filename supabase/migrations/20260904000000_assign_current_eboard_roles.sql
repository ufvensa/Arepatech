-- Give the 2026-2027 VENSA E-Board accounts access to the newsletter workspace.
-- auth.users.email is used as the authoritative match so editing a profile email
-- cannot be used to grant administrative access.

with current_eboard(email, newsletter_role) as (
  values
    ('v.cadavieco@ufl.edu', 'president'),
    ('alamosofia@ufl.edu', 'eboard'),
    ('rodrigoblanco@ufl.edu', 'eboard'),
    ('pulido.jd@ufl.edu', 'eboard'),
    ('mcarrerojimenez@ufl.edu', 'eboard'),
    ('federica.sosa@ufl.edu', 'eboard'),
    ('vjedlicka@ufl.edu', 'eboard'),
    ('vmedinalaguado@ufl.edu', 'eboard'),
    ('aidanle@ufl.edu', 'eboard'),
    ('jimenez.a1@ufl.edu', 'eboard'),
    ('anavegas@ufl.edu', 'eboard'),
    ('f.jorgehernandez@ufl.edu', 'technology'),
    ('aarveloferreira@ufl.edu', 'eboard')
)
update public.profiles as profile
set
  status = 'eboard',
  is_admin = true,
  role = current_eboard.newsletter_role
from auth.users as account
join current_eboard
  on lower(trim(account.email)) = current_eboard.email
where account.id = profile.id;
