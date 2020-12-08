const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.jwtKey;

require('./../mongodb/models/User');
const User = mongoose.model('intellilogsuser');

module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'password'}, async (email, password, done) => {
        let user = await User.findOne({ email });
        if(!user) {
            return done(null, false, { message: 'User not found.' });
        }

        bcrypt.compare(password, user.password, (err, match) => {
            if(match) {
                return done(null, user);
            }else{
                return done(null, false, { message: 'Invalid credentials.' });
            }
        })
    }));

    passport.use(new JwtStrategy(opts, function(jwtPayload, done) {
        User.findOne({email: jwtPayload.email}, function(err, user) {
            if(err) {
                return done(err, false);
            }
            if(user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        })
    })
}

// function hashGenerator(pass) {
//     return new Promise(resolve => {
//         bcrypt.genSalt(10, function(err, salt) {
//             bcrypt.hash(pass, salt, function(err, hash) {
//                 resolve(hash);
//             });
//         });

//     })
// }

// function criarUsuario(email, password){
//     hashGenerator(password).then(e => {
//         User.create({
//             email, 
//             password: e
//         })
//     }).catch(e => {
//         console.log('Erro ao criar usuário', e);
//     })
//     console.log('usuario ' + email + ' criado');
    
// }

// criarUsuario('breno', 'breno')