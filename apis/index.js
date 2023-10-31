const express = require("express")
const app = express()
const http = require("http")
const {
    Server
} = require("socket.io")
const database = require("./config/db")
const server = http.createServer(app)

const cors = require("cors")

app.use(cors({
    origin: "*"
}))

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["get", "post"]
    }
})

server.listen(3120, () => {
    console.log("Success")
})

const test = () => {
    console.log("wrokess")
}

io.on("connection", (socket) => {

    socket.on("join_chat", (data) => {

        socket.join(data.group_id);

        console.log("User id " + data.user_id + " joined " + data.group_name);
    });

    socket.on("start_chat", (id) => {
        socket.join(id)
        // console.log(`Conversation with ${id} and socket id with ${socket.id} have been started.`)
        console.log(`Group chat connected by ${id}`)
    })

    socket.on("send_message", (data) => {
        socket.to(data.id).emit("receive_message", (data))
        console.log(data)
    })
    socket.on('disconnect', () => {
        console.log(socket.id + " has been disconnected")
    })
})

app.use(express.json())

app.get("/user/:id", (req, res) => {
    try {

        const friendsList = () => {
            return new Promise((resolve, reject) => {
                const checkSql = `SELECT * FROM user_friends WHERE user_id='${req.params.id}'`
                database.query(checkSql, (err, results) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results)
                    }

                })
            })
        }

        const friendsDetails = (id) => {
            return new Promise((resolve, reject) => {
                const checkSql = `SELECT * FROM users WHERE user_id='${id}'`
                database.query(checkSql, (err, results) => {
                    if (err) {
                        reject(err)
                    } else {
                        const checkSql = `SELECT * FROM messages WHERE user_id='${req.params.id}' AND forward_to='${id}'`
                        database.query(checkSql, (err, msgResults) => {
                            if (err) {
                                reject(err)
                            } else {
                                results[0].messages_id = msgResults[0]?.messages_id
                                resolve(results)
                            }

                        })
                    }

                })
            })
        }

        const groupList = () => {
            return new Promise((resolve, reject) => {
                const checkSql = `SELECT * FROM user_group WHERE user_id='${req.params.id}'`
                database.query(checkSql, (err, results) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results)
                    }

                })
            })
        }

        const groupDetails = (id) => {
            return new Promise((resolve, reject) => {
                const checkSql = `SELECT * FROM groups WHERE group_id='${id}'`
                database.query(checkSql, (err, results) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(results)
                    }

                })
            })
        }

        const checkSql = `SELECT * FROM users WHERE user_id='${req.params.id}'`
        database.query(checkSql, async (err, results) => {
            if (err) {
                res.json({
                    succcess: false,
                    err
                })
            } else {
                if (results.length == 0) {
                    res.json({
                        succcess: false,
                        message: "nodatafound"
                    })
                } else {
                    const friendsDAta = await friendsList()
                    const groups = await groupList()

                    results[0].friends = []

                    for (let i = 0; i < friendsDAta.length; i++) {
                        const values = await friendsDetails(friendsDAta[i].friend_id)
                        results[0].friends.push(values)
                    }
                    const trimArrayOFArray = [].concat(...results[0].friends)

                    results[0].friends = trimArrayOFArray

                    for (let i = 0; i < groups.length; i++) {
                        results[0].groups = await groupDetails(groups[i].group_id)
                    }

                    res.json({
                        succcess: true,
                        results
                    })
                }
            }
        })

    } catch (error) {
        res.json(error)
    }
})

app.get("/messages/:type/:user_id/:person_id", (req, res) => {
    try {
        let checkSql = `SELECT * FROM messages WHERE `

        if (req.params.type == "group") {
            checkSql += `forward_to='${req.params.person_id}' ORDER BY id ASC`
        } else {
            checkSql += `(user_id='${req.params.user_id}' OR forward_to='${req.params.user_id}')
            AND (user_id='${req.params.person_id}' OR forward_to='${req.params.person_id}') ORDER BY id ASC`
        }
        database.query(checkSql, async (err, results) => {
            if (err) {
                res.json({
                    succcess: false,
                    err
                })
            } else {
                if (results.length == 0) {
                    res.json({
                        success: false,
                        message: "nodatafound"
                    })
                } else {
                    res.json({
                        success: true,
                        results
                    })
                }
            }
        })
    } catch (error) {
        res.send(error)
    }
})

app.post("/:type", (req, res) => {
    try {
        const values = req.body.values
        const tableName = req.params.type
        const id = tableName + "_id"


        let fullID

        if (tableName != "messages") {
            fullID = Math.floor(10000 + Math.random() * 99999)
        } else {
            const user_id = values[0].user_id
            const forward_id = values[0].forward_to
            const mix = [user_id, forward_id].sort().join("")
            fullID = Number(mix)
        }

        const mixingValues = values.map((value) => ({
            ...value,
            [id]: fullID

        }))

        const checkSql = `INSERT INTO ${tableName} SET ?`
        database.query(checkSql, mixingValues, async (err, results) => {
            if (err) {
                res.json({
                    succcess: false,
                    err
                })
            } else {
                const messages_id = fullID
                res.json({
                    succcess: true,
                    messages_id
                })
            }
        })
    } catch (error) {
        res.send(error)
    }
})

app.get("/users", (req, res) => {
    try {

        const checkSql = `SELECT * FROM users ORDER BY id DESC`
        database.query(checkSql, async (err, results) => {
            if (err) {
                res.json({
                    succcess: false,
                    err
                })
            } else {
                if (results.length == 0) {
                    res.json({
                        succcess: false,
                        message: "nodatafound"
                    })
                } else {
                    res.json({
                        succcess: true,
                        results
                    })
                }
            }
        })
    } catch (error) {
        res.send(error)
    }
})