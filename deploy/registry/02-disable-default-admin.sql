-- Enable the account only after setting your own BCrypt password.
UPDATE ayeezblog.`user` SET status = 0 WHERE username = 'admin';
