SELECT 
  CASE 
    WHEN role = 'resident' THEN 'Morador'
    WHEN role = 'professional' THEN 'Prestador'
    WHEN role = 'admin' THEN 'Síndico/Admin'
    WHEN role = 'super_admin' THEN 'Super Admin'
    ELSE 'Outro/Sem Role' 
  END as Tipo_Usuario,
  count(*) as Quantidade
FROM profiles 
GROUP BY role
ORDER BY Quantidade DESC;
