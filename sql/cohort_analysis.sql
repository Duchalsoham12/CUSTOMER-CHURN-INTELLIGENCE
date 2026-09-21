-- Cohorts require signup or first-purchase dates. The supplied source has neither.
SELECT 'unavailable' AS status, 'No signup or transaction dates available in source data.' AS note;