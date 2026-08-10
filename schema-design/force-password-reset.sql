-- Cut-over credential invalidation.
-- The hand-off dump carries the live legacy bcrypt hashes; run this ONCE on the
-- production cse_department database immediately after loading the dump, so no
-- legacy password works against the new deployment.
--
-- The replacement value is a real bcrypt hash of 32 random bytes whose plaintext
-- was discarded at generation time — it stays format-valid for bcrypt.compareSync
-- (an invalid string would make the login route throw instead of returning 401)
-- but matches no enterable password.
--
-- Every account is pushed back into the first-login state; users recover through
-- the mail-based reset flow (POST /passwordreset, admin via /passwordreset/admin).
-- All 27 faculty rows have an email; the admin row carries webmaster.cse@nith.ac.in.

UPDATE user_accounts
SET password_hash = '$2b$08$1mWxiEM7XiXwbPbKbTfkJeQnwWJh7eh7ejEETC7gkx5cox.xXmzqK',
    first_login   = 1;

SELECT COUNT(*) AS accounts_invalidated FROM user_accounts;
