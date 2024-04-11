DELIMITER //
CREATE PROCEDURE UpdateBunchStatistics(IN _bunchId VARCHAR(32))
BEGIN
    UPDATE Bunches
    SET totalViewCount = (
        SELECT SUM(viewCount)
        FROM Videos
        WHERE videoId IN (
            SELECT DISTINCT videoId
            FROM BunchContain
            WHERE bunchId = _bunchId
        )
    )
    WHERE bunchId = _bunchId;

    UPDATE Bunches
    SET avargeView = (
        totalViewCount / (
            SELECT COUNT(videoId)
            FROM BunchContain
            WHERE bunchId = _bunchId
        )
    )
    WHERE bunchId = _bunchId;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER UpdateBunchStatistics_trigger
AFTER DELETE ON BunchContain
FOR EACH ROW
BEGIN

    IF EXISTS (SELECT videoId FROM BunchContain WHERE bunchId = OLD.bunchId)
        DELETE FROM Bunches WHERE bunchId = deleted.bunchId;
    ELSE
        CALL UpdateBunchStatistics(OLD.bunchId);
    END IF
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER UpdateBunchStatistics_triggerADD
AFTER INSERT ON BunchContain
FOR EACH ROW
BEGIN
    CALL UpdateBunchStatistics(NEW.bunchId);
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE ForkBunch(userId_ VARCHAR(32), bunchId_ VARCHAR(32), newBunchId_ VARCHAR(32))
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE _bunchName VARCHAR(32);
    DECLARE _videoId VARCHAR(32);
    DECLARE _cursor CURSOR FOR
        SELECT videoId
        FROM BunchContain
        WHERE bunchId = bunchId_;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    SET _bunchName = (SELECT bunchName FROM Bunches WHERE bunchId = bunchId_);
    INSERT INTO Bunches (userId, bunchId, bunchName) VALUES (userId_, newBunchId_, _bunchName);

    OPEN _cursor;
    REPEAT
        FETCH _cursor INTO _videoId;
        INSERT IGNORE INTO BunchContain (videoId, bunchId) VALUES (_videoId, newBunchId_);
    UNTIL done
    END REPEAT;
END //
DELIMITER ;