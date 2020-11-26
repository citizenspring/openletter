-- delete duplicate signatures for which one has been confirmed
with data as (
SELECT l.slug, max(name) as name, city, count(*), 
SUM(
case 
	when is_verified IS TRUE then 1
	when is_verified IS FALSE then 0
end
) as is_verified,
MAX(
case
	when is_verified IS TRUE then 0
	when is_verified IS FALSE then s.id
end
) as non_verified_id
FROM "signatures" s LEFT JOIN letters l on s.letter_id = l.id
GROUP BY slug, name, city
), duplicates as (
SELECT * FROM data d WHERE is_verified = 1 AND d.count > 1
)

SELECT * FROM signatures s WHERE s.id IN (select non_verified_id FROM duplicates)
-- DELETE * FROM signatures s WHERE s.id IN (select non_verified_id FROM duplicates)
