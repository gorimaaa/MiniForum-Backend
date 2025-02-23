const express = require('express')
const router = express.Router()
const { Users } = require('../models')
const bcrypt = require('bcryptjs');
const { validateToken } = require('../middlewares/Authmiddleware');
const { sign } = require('jsonwebtoken');

router.post('/', async (req, res) => {
    const {username, password} = req.body;
    bcrypt.hash(password, 10).then((hash) => {
        Users.create({
            username: username,
            password: hash
        })
    })
    return res.json("SUCCESS");
})

router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    const user = await Users.findOne({where : {username: username}});
    if(!user){
        return res.json({error: "User doesn't exist"});
    }
    bcrypt.compare(password, user.password).then((match) => {
        if(!match){
            return res.json({error: "Wrong username and password combination"});
        }
        const accessToken = sign(
            {username: user.username, id: user.id},
            "importantsecret");
        return res.json({token: accessToken, username: username, id: user.id});
    })
})

router.get('/auth', validateToken, (req, res) => {
    return res.json(req.user);
})

module.exports = router;