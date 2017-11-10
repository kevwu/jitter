const express = require("express")
const app = express()

const session = require("express-session")

const path = require("path")

const passport = require("passport")
const { Strategy: TwitterStrategy } = require("passport-twitter")

const secrets = require("./secrets.json")

const mysql = require("mysql")

let db = mysql.createConnection({
	host: "localhost",
	database: "jitter",
	user: "jitter",
	password: secrets.MYSQL_PASS
})

db.connect((err) => {
	if(err) {
		throw err
	}
	console.log("DB connected.")
})

// test connection
db.query("SELECT 1", (err, results, fields) => {
	if(err) {
		throw err
	}

	console.log("DB connection working.")
})

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

	// if user is new, create profile
	db.query("SELECT id,allowed_chars FROM users WHERE id=?", [profile.id], (err, results, fields) => {
		if(err) {
			throw err
		}

		let allowed_chars
		if(results.length !== 1) {
			// new user, create profile

			db.query("INSERT INTO users(id, handle, allowed_chars) VALUES(?, ?, 1)",
				[profile.id, profile.username], (err2) => {
				if(err2) {
					throw err2
				}
			})

			allowed_chars = 1
		} else {
			allowed_chars = results[0].allowed_chars
		}

		done(null, {
			id: profile.id,
			handle: profile.username,
			allowed_chars: allowed_chars,
		})
	})
}))

passport.serializeUser((user, done) => {
	done(null, user.id)
})

passport.deserializeUser((id, done) => {
	db.query("SELECT id,handle,allowed_chars FROM users WHERE id=?", [id], (err, results, fields) => {
		if(err) {
			throw err
		}

		if(results.length !== 1) {
			throw new Error("Invalid result length.")
		}

		done(err, results[0])
	})
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
	res.end()
})

app.listen(3000, () => {console.log("HTTP server listening")})