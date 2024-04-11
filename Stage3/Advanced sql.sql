EXPLAIN ANALYZE
SELECT DISTINCT tagName,
                COUNT(videoId) AS appearTimes
FROM    Videos  NATURAL JOIN HasTag
                NATURAL JOIN VideoTags
WHERE   viewCount >= 100
    AND likes / viewCount >= 0.001
    AND dislikes / viewCount <= 0.1
    AND commentCount / viewCount >= 0.0001
GROUP BY tagId
ORDER BY appearTimes DESC
LIMIT 15;

CREATE INDEX idx_viewcount ON Videos (viewCount);

CREATE INDEX idx_likes_viewcount ON Videos (likes, viewCount);

CREATE INDEX idx_dislikes_viewcount ON Videos (dislikes, viewCount);

CREATE INDEX idx_commentcount_viewcount ON Videos (commentCount, viewCount);

EXPLAIN ANALYZE
SELECT DISTINCT title
FROM    Videos NATURAL JOIN BunchContain
WHERE   bunchId IN (
    SELECT  bunchId
    FROM    BunchContain
    GROUP BY bunchId
    HAVING  COUNT(videoId) >= ALL(
        SELECT  COUNT(videoId)
        FROM    BunchContain
        GROUP BY bunchId
    )
)
LIMIT 15;

CREATE INDEX idx_bunchid ON BunchContain (bunchId);

CREATE INDEX idx_videoid ON BunchContain (videoId);

CREATE INDEX idx_bunchid_videoid ON BunchContain (bunchId, videoId);