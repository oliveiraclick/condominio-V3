-- 1. Ver exatamente como está o usuário
SELECT id, email, email_confirmed_at, confirmed_at, last_sign_in_at
FROM auth.users 
WHERE email = 'denyscoborges@gmail.com';

-- 2. Ver se há duplicatas (emails parecidos)
SELECT email, count(*) 
FROM auth.users 
GROUP BY email 
HAVING count(*) > 1;
