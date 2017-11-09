const express = require("express")
const app = express()

const session = require("express-session")

const path = require("path")

const passport = require("passport")
const { Strategy: TwitterStrategy } = require("passport-twitter")

const secrets = require("./secrets.json")

app.use(session({
	secret: secrets.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new TwitterStrategy({
	consumerKey: secrets.TWITTER_CONSUMER_KEY,
	consumerSecret: secrets.TWITTER_CONSUMER_SECRET,
	callbackURL: 'http://127.0.0.1:3000/auth/twitter/callback'
}, (token, tokenSecret, profile, done) => {
	console.log("Done!")
	console.log(profile)
	done(null, profile)
}))

passport.serializeUser((user, done) => {
	done(null, user)
})

passport.deserializeUser((obj, done) => {
	done(null, obj)
})

app.get("/", (req, res) => {
	console.log("User:")
	console.log(req.user)
	res.sendFile(path.join(__dirname, 'static/index.html'))
})

app.get("/bundle.js", (req, res) => {
	res.sendFile(path.join(__dirname, 'static/bundle.js'))
})

app.get("/bundle.css", (req, res) => {
	res.sendFile(path.join(__dirname, 'static/bundle.css'))
})


app.get('/auth/twitter', passport.authenticate('twitter'))

app.get('/auth/twitter/callback', passport.authenticate('twitter', {
	failureRedirect: '/'
}), (req, res) => {
	console.log("Success!")
	res.end()
})

app.listen(3000, () => {console.log("HTTP server listening")})