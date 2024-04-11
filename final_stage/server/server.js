function isEmpty(obj) {
    if (obj === null || obj === undefined) return true;
    if (typeof obj === 'object' && Object.keys(obj).length === 0) return true;
    if (Array.isArray(obj) && obj.length === 0) return true;
    return false;
}

function verifyUser(userId, password, callback) {
    const query = "SELECT userId FROM Users WHERE userId = ? AND passwd = ?";
    return connection.query(query, [userId, password], (err, result) => {
        if (err || Array.from(result).length === 0) return callback(false);
        return callback(true);
    });
}

function verifyPermission(userId, bunchId, callback) {
    const query = "SELECT bunchId FROM Bunches WHERE bunchId = ? AND userId = ?";
    return connection.query(query, [bunchId, userId], (err, result) => {
        if (err || Array.from(result).length === 0) return callback(false);
        return callback(true);
    });
}

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
var connection = mysql.createConnection({
    host: '34.136.11.139',
    user: 'root',
    password: 'CAW7LQ3.62rF8ex',
    database: 'test'
});

connection.connect;


var app = express();

// set up ejs view engin
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));

/* GET home page, respond by rendering index.ejs */
app.get('/', function(req, res) {
    res.render('index', { title: 'Mark Attendance' });
});

app.post("/loginUser", (req, res) => {
    const userId = String(req.body.userId);
    const password = String(req.body.password);

    const query = "SELECT userName FROM Users WHERE userId = ? AND passwd = ?";
    connection.query(query, [userId, password], (err, result) => {
        if (err) {
            res.send([]);
            return;
        }
        if (isEmpty(result) === true) {
            result = [{ "_success": "1" }];
        }
        res.send(result);
        return;
    })
})

app.post("/signupUser", (req, res) => {
    const userId = String(req.body.userId);
    const password = String(req.body.password);

    const query = "INSERT INTO Users (userId, passwd) VALUES (?, ?)";
    connection.query(query, [userId, password], (err, result) => {
        if (err) {
            res.send([]);
            return;
        }
        res.send([{ "_success": "1" }]);
        return;
    });
});


app.post("/renameUser", (req, res) => {
    const userId = String(req.body.userId);
    const password = String(req.body.password);
    const userName = String(req.body.userName);

    verifyUser(userId, password, (ret) => {
        if (ret === false) {
            res.send([]);
            return;
        }

        const query = "UPDATE Users SET userName = ? WHERE userId = ? AND passwd = ?";
        connection.query(query, [userName, userId, password], (err, result) => {
            if (err) {
                res.send([]);
                return;
            }
            res.send([{ "_success": "1" }]);
            return;
        });
    });
})

app.post("/randBunch", (req, res) => {
    const query = `
        SELECT Bunches.bunchId, Bunches.bunchName, Bunches.userId,
            COUNT(BunchContain.videoId) AS numVideos,
            COUNT(BunchLike.userId) AS numLikes,
            avargeView
        FROM Bunches
        LEFT JOIN BunchContain ON Bunches.bunchId = BunchContain.bunchId
        LEFT JOIN BunchLike ON Bunches.bunchId = BunchLike.bunchId
        GROUP BY Bunches.bunchId
        ORDER BY RAND()
        LIMIT 20
    `;

    connection.query(query, [], (err, result) => {
        if (err) {
            res.send([]);
            return;
        }
        if (isEmpty(result) === true) {
            result = [{ "_success": "1" }];
        }
        res.send(result);
        return;
    });
});

app.post("/forkBunch", (req, res) => {
    const userId = String(req.body.userId);
    const password = String(req.body.password);
    const bunchId = String(req.body.bunchId);

    verifyUser(userId, password, (ret) => {
        if (ret === false) {
            res.send({});
            return;
        }

        const query = `SELECT MAX(CAST(bunchId AS SIGNED)) + 1 AS newId FROM Bunches`;
        connection.query(query, [], (err, result) => {
            if (err) {
                res.send([]);
                return;
            }

            let newBunchId = result[0]["newId"];
            if (newBunchId == null) bunchId = 1;

            const query2 = `CALL ForkBunch(?, ?, ?)`;
            connection.query(query2, [userId, bunchId, newBunchId], (err, result) => {
                if (err) {
                    res.send([]);
                    return;
                }
                res.send([{ "_success": "1" }]);
                return;
            });
        });
    });
});

app.post("/userBunch", (req, res) => {
    const userId = String(req.body.userId);
    const password = String(req.body.password);

    verifyUser(userId, password, (ret) => {
        if (ret === false) {
            res.send([]);
            return;
        }

        const query = `
            SELECT _.bunchId, bunchName, _.userId,
                   COUNT(DISTINCT videoId) AS numVideos,
                   COUNT(DISTINCT bl.userId) AS numLikes,
                   avargeView
            FROM (SELECT bunchId, bunchName, userId, avargeView FROM Bunches WHERE userId = ?) AS _
                 NATURAL LEFT JOIN BunchContain
                 LEFT JOIN BunchLike bl ON _.bunchId = bl.bunchId
            GROUP BY _.bunchId
            ORDER BY numVideos DESC, numLikes DESC
            LIMIT 100
        `;

        connection.query(query, [userId], (err, result) => {
            if (err) {
                res.send([]);
                return;
            }
            if (isEmpty(result) === true) {
                result = [{ "_success": "1" }];
            }
            res.send(result);
            return;
        });
    });
});

app.post("/bunchLike", (req, res) => {
    const userId = String(req.body.userId);
    const password = String(req.body.password);
    const bunchId = String(req.body.bunchId);

    verifyUser(userId, password, (ret) => {
        if (ret === false) {
            res.send([]);
            return;
        }

        const query = `INSERT INTO BunchLike (userId, bunchId) VALUES (?, ?)`;
        connection.query(query, [userId, bunchId], (err, result) => {
            if (err) {
                res.send([{"_already_liked": "1"}]);
                return;
            }

            const query2 = `SELECT COUNT(userId) AS numLikes FROM BunchLike WHERE bunchId = ?`;
            connection.query(query2, [bunchId], (err, result) => {
                if (err) {
                    res.send([]);
                    return;
                }
                res.send(result);
                return;
            });
        });
    });
});

app.post("/viewBunch", (req, res) => {
    const bunchId = String(req.body.bunchId);

    const query = `
        SELECT videoId, title, categoryName, viewCount, likes, dislikes, commentCount
        FROM (SELECT videoId FROM BunchContain WHERE bunchId = ?) AS _
             NATURAL LEFT JOIN Videos
             NATURAL LEFT JOIN Categories
        ORDER BY viewCount DESC, likes DESC, dislikes ASC
        LIMIT 100
    `;

    connection.query(query, [bunchId], (err, result) => {
        if (err) {
            res.send([]);
            return;
        }
        if (isEmpty(result) === true) {
            result = [{ "_success": "1" }];
        }
        res.send(result);
        return;
    });
});

app.post("/deleteFromBunch", (req, res) => {
    const userId = String(req.body.userId);
    const password = String(req.body.password);
    const videoId = String(req.body.videoId);
    const bunchId = String(req.body.bunchId);

    verifyUser(userId, password, (ret) => {
        if (ret === false) {
            res.send([]);
            return;
        }

        verifyPermission(userId, bunchId, (ret) => {
            if (ret === false) {
                res.send([]);
                return;
            }

            const query = `DELETE FROM BunchContain WHERE bunchId = ? AND videoId = ?`;
            connection.query(query, [bunchId, videoId], (err, result) => {
                if (err) {
                    res.send([]);
                    return;
                }

                const query2 = `SELECT COUNT(videoId) AS numVideos FROM BunchContain WHERE bunchId = ?`;
                connection.query(query2, [bunchId], (err, result) => {
                    if (err) {
                        res.send([]);
                        return;
                    }
                    res.send(result);
                    return;
                });
            });
        });
    });
});

app.post("/searchVideo", (req, res) => {
    const title = String(req.body.title);
    const channelName = String(req.body.channelName);
    const categoryName = String(req.body.categoryName);

    let query = `
        SELECT videoId, title, channelName, categoryName, viewCount, likes, dislikes, commentCount
        FROM Videos NATURAL JOIN Channels NATURAL JOIN Categories
        WHERE 1 = 1
    `;
    if (title != "undefined") {
        query += ` AND title LIKE '%${title}%'`;
    }
    if (channelName != "undefined") {
        query += ` AND channelName LIKE '%${channelName}%'`;
    }
    if (categoryName != "undefined") {
        query += ` AND categoryName LIKE '%${categoryName}%'`;
    }
    query += ` ORDER BY viewCount DESC, likes DESC`;
    query += ` LIMIT 100`;

    connection.query(query, [], (err, result) => {
        if (err) {
            res.send([]);
            return;
        }
        if (isEmpty(result) === true) {
            result = [{ "_success": "1" }];
        }
        res.send(result);
        return;
    });
});

app.post("/addToBunch", (req, res) => {
    const userId = String(req.body.userId);
    const password = String(req.body.password);
    const videoId = String(req.body.videoId);
    const bunchId = String(req.body.bunchId);

    verifyUser(userId, password, (ret) => {
        if (ret === false) {
            res.send([]);
            return;
        }

        verifyPermission(userId, bunchId, (ret) => {
            if (ret === false) {
                res.send([]);
                return;
            }

            const query = `INSERT INTO BunchContain (bunchId, videoId) VALUES (?, ?)`;
            connection.query(query, [bunchId, videoId], (err, result) => {
                if (err) {
                    res.send([{ "_already_exists": "1" }]);
                    return;
                }

                const query2 = `SELECT COUNT(videoId) AS numVideos FROM BunchContain WHERE bunchId = ?`;
                connection.query(query2, [bunchId], (err, result) => {
                    if (err) {
                        res.send([]);
                        return;
                    }
                    res.send(result);
                    return;
                });
            });
        });
    });
});

app.post("/addToNewBunch", (req, res) => {
    const userId = String(req.body.userId);
    const password = String(req.body.password);
    const videoId = String(req.body.videoId);
    const bunchName = String(req.body.bunchName);

    verifyUser(userId, password, (ret) => {
        if (ret === false) {
            res.send([]);
            return;
        }

        const query = `SELECT MAX(CAST(bunchId AS SIGNED)) + 1 AS newId FROM Bunches`;
        connection.query(query, [], (err, result) => {
            if (err) {
                res.send([]);
                return;
            }

            let bunchId = result[0]["newId"];
            if (bunchId == null) bunchId = 1;

            const query2 = `INSERT INTO Bunches (bunchId, userId, bunchName) VALUES (?, ?, ?)`;
            connection.query(query2, [bunchId, userId, bunchName], (err, result) => {
                if (err) {
                    res.send([]);
                    return;
                }

                const query3 = `INSERT INTO BunchContain (bunchId, videoId) VALUES (?, ?)`;
                connection.query(query3, [bunchId, videoId], (err, result) => {
                    if (err) {
                        res.send([]);
                        return;
                    }
                    res.send([{ '_success': "1" }]);
                    return;
                });
            });
        });
    });
});

app.listen(80, function () {
    console.log('Node app is running on port 80');
});
