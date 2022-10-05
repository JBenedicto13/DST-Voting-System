const express = require("express");
const router = express.Router();
const User = require("../models/user");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

//Login Route
router.post("/", async (req, res) => {
    const { email } = req.body;
    let validPass = false;
    await User.findOne({ email })
    .then((res) => {
        //validate against hash
        validPass = bcrypt.compareSync(req.body.password, res.password);
    })
    .catch((err) => console.log(err))
    
    if (validPass) {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).send("Invalid Email");

        //generate JWT token
        const jwtData = {_id: user.id, username: user.username}
        const token = jwt.sign(jwtData, process.env.JWTSECRET, {expiresIn: "2h"})

        res.send(token);
    } else {
        return res.status(400).send("Invalid Password");
    }
});

module.exports = router;