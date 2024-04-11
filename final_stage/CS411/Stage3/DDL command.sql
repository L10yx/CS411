CREATE TABLE Channels(
    channelId VARCHAR(32),
    channelName VARCHAR(255),

    PRIMARY KEY (channelId)
);

CREATE TABLE Videos (
    videoId             VARCHAR(32) PRIMARY KEY,
    title               VARCHAR(255),
    publishedAt         DATETIME,
    channelId           VARCHAR(32) REFERENCES Channels(channelId),
    categoryId          INT,
    trendingDate        DATETIME,
    viewCount           INT,
    likes               INT,
    dislikes            INT,
    commentCount        INT,
    commentsDisabled    BIT,
    ratingsDisabled     BIT,
    description         TEXT,

    FOREIGN KEY (channelId) REFERENCES Channels(channelId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Bunches(
    bunchId VARCHAR(32),
    userId VARCHAR(32),

    PRIMARY KEY (bunchId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Users(
    userId VARCHAR(32),
    userName VARCHAR(255),
    passwd VARCHAR(255),

    PRIMARY KEY (userId)
);

CREATE TABLE Comments(
    commentId VARCHAR(32),
    userId VARCHAR(32),
    videoId VARCHAR(32),
    parentcommentId VARCHAR(32),

    PRIMARY KEY (commentId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (videoId) REFERENCES Videos(videoId)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE BunchComments(
    bunchCommentId VARCHAR(32),
    userId VARCHAR(32),
    bunchId VARCHAR(32),
    ParentbunchCommentId VARCHAR(32),

    PRIMARY KEY (bunchCommentId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (bunchId) REFERENCES Bunches(bunchId)
        ON DELETE CASCADE
        ON UPDATE CASCADE    
);

CREATE TABLE BunchContain(
    videoId VARCHAR(32),
    bunchId VARCHAR(32),

    PRIMARY KEY (videoId, bunchId),
    FOREIGN KEY (videoId) REFERENCES Videos(videoId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (bunchId) REFERENCES Bunches(bunchId)
        ON DELETE CASCADE
        ON UPDATE CASCADE 
);

CREATE TABLE ChannelLike(
    userId VARCHAR(32),
    channelId VARCHAR(32),

    PRIMARY KEY(userId, channelId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (channelId) REFERENCES Channels(channelId)
        ON DELETE CASCADE
        ON UPDATE CASCADE    
);

CREATE TABLE BunchLike(
    userId VARCHAR(32),
    bunchId VARCHAR(32),

    PRIMARY KEY(userId, bunchId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (bunchId) REFERENCES Bunches(bunchId)
        ON DELETE CASCADE
        ON UPDATE CASCADE    
);

CREATE TABLE CommentLike(
    userId VARCHAR(32),
    commentId VARCHAR(32),

    PRIMARY KEY(userId, commentId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (commentId) REFERENCES Comments(commentId)
        ON DELETE CASCADE
        ON UPDATE CASCADE    
);

CREATE TABLE BunchCommentLike(
    userId VARCHAR(32),
    bunchCommentId VARCHAR(32),

    PRIMARY KEY(userId, bunchCommentId),
    FOREIGN KEY (userId) REFERENCES Users(userId)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (bunchCommentId) REFERENCES BunchComments(bunchCommentId)
        ON DELETE CASCADE
        ON UPDATE CASCADE    
);

CREATE TABLE VideoTags (
    tagId               INT PRIMARY KEY,
    tagName             VARCHAR(255)
);

CREATE TABLE HasTag (
    videoId             VARCHAR(32),
    tagId               INT PRIMARY KEY,
    PRIMARY KEY (videoId, tagId),
    FOREIGN KEY (videoId) REFERENCES Videos(videoId)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tagId) REFERENCES VideoTags(tagId)
        ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO Users VALUES
    ('root', 'admin', 'admin');

INSERT INTO Bunches VALUES
    ('001', 'root'),
    ('002', 'root'),
    ('003', 'root');

INSERT INTO BunchContain VALUES
    ('uU8Kqe-RoVE', '001'),
    ('ONWVVDKK3H8', '001'),
    ('ONWVVDKK3H8', '002'),
    ('MS82JAkBkDY', '002'),
    ('smFvR_-8xh0', '002'),
    ('smFvR_-8xh0', '003'),
    ('MS82JAkBkDY', '003'),
    ('C24hUt18RWY', '003'),
    ('QDv9Fy5XAxY', '003'),

    ('Pa-64fUsyZU', '003'),
    ('8-LN9xU9lLQ', '003'),
    ('CO72JNivnB4', '003'),
    ('7erD56xKJaM', '003'),
    ('7d-t0cJ_HQ0', '003'),
    ('1E_dafyt5eA', '003'),
    ('kyq1Qu5vA_I', '003'),
    ('AnDhlrs3XVM', '003'),
    ('-navJLrLOEQ', '003'),
    ('6tV8yYKsBV4', '003'),
    ('6t8mcSuA0sg', '003');


    

