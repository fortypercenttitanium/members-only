const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');

const strategy = new LocalStrategy(
	{
		usernameField: 'email',
		passwordField: 'password',
	},
	function (username, password, done) {
		User.findOne({ userName: username }, (err, user) => {
			if (err) {
				return done(err);
			}
			if (!user) {
				return done(null, false, { message: 'Incorrect username or password' });
			}
			bcrypt.compare(password, user.password, (err, res) => {
				if (err) {
					return done(err);
				}
				if (res) {
					return done(null, user);
				} else {
					return done(null, false, {
						message: 'Incorrect username or password',
					});
				}
			});
		});
	}
);

const serialize = (user, done) => {
	done(null, user.id);
};

const deserialize = (id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
};

module.exports = {
	strategy,
	serialize,
	deserialize,
};
