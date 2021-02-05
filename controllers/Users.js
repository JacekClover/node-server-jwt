var userModel = require('../models/user');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

class userController {
    async login(req, res, next) {
        let { email, password } = req.body;
        let existingUser = await userModel.findOne({ email: email }, (err) => {
            if (err) return res.status(500).send('Error on the server');
        });
        if (!existingUser) {
            return res.status(401).send({ msg: 'No user found.' });
        } else {
            let passwordIsValid = bcrypt.compareSync(password, existingUser.password);
            if (!passwordIsValid) {
                console.log('pa', 'invalid')
                return res.status(401).send({ auth: false, token: null });
            } else {
                let token = jwt.sign({ id: existingUser._id }, 'electron', { expiresIn: 60 });
                console.log('token', token)
                res.status(200).send({ auth: true, token: token, user: existingUser, status: true });
            }
        }
    }
    async register(req, res, next) {
        let email = req.body.email;
        let password = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        if (password !== confirmPassword) {
            return res.status(401).send('No match password');
        } else {
            let existingEmail = await userModel.findOne({ email: email });
            if (existingEmail) {
                return res.status(500).send('This email already registered');
            } else {
                let newUser = new userModel();
                newUser.email = email;
                newUser.password = bcrypt.hashSync(password, 8);
                await newUser.save((err) => {
                    if (err) {
                        return res.status(500).send("There was a problem registering the user.")
                    }
                    userModel.findOne({ email: email }, (err, user) => {
                        console.log('user', user)
                        if (err) {
                            return res.status(500).send("There was a problem getting user")
                        }
                        let token = jwt.sign({ di: user._id }, 'whitehorse', { expiresIn: '600' });
                        res.json({ status: true, token: token, user: user, msg: 'Registered successfully' });
                    });
                });
            }
        }
    }
}

module.exports = userController;
