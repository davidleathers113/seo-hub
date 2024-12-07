const { randomUUID } = require('crypto');

const User = require('../models/user.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

class UserService {
  static async list() {
    try {
      return User.find();
    } catch (err) {
      throw `Database error while listing users: ${err}`;
    }
  }

  static async get(id) {
    try {
      return User.findOne({ _id: id }).exec();
    } catch (err) {
      throw `Database error while getting the user by their ID: ${err}`;
    }
  }

  static async getByEmail(email) {
    try {
      return User.findOne({ email }).exec();
    } catch (err) {
      throw `Database error while getting the user by their email: ${err}`;
    }
  }

  static async update(id, data) {
    try {
      return User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      throw `Database error while updating user ${id}: ${err}`;
    }
  }

  static async delete(id) {
    try {
      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw `Database error while deleting user ${id}: ${err}`;
    }
  }

  static async authenticateWithPassword(email, password) {
    console.log('Starting authentication for email:', email);
    if (!email) throw 'Email is required';
    if (!password) throw 'Password is required';

    try {
      console.log('Looking up user in database...');
      const user = await User.findOne({email}).exec();
      console.log('User found?', !!user);

      if (!user) {
        console.log('No user found with this email');
        return null;
      }

      console.log('Validating password...');
      const passwordValid = await validatePassword(password, user.password);
      console.log('Password valid?', passwordValid);

      if (!passwordValid) {
        console.log('Password validation failed');
        return null;
      }

      console.log('Updating lastLoginAt...');
      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      console.log('User updated successfully');
      return updatedUser;
    } catch (err) {
      console.error('Error in authenticateWithPassword:', err);
      throw `Database error while authenticating user ${email} with password: ${err}`;
    }
  }

  static async authenticateWithToken(token) {
    try {
      return User.findOne({ token }).exec();
    } catch (err) {
      throw `Database error while authenticating user ${email} with token: ${err}`;
    }
  }

  static async regenerateToken(user) {
    user.token = randomUUID(); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      throw `Database error while generating user token: ${err}`;
    }
  }

  static async createUser({ email, password, name = '' }) {
    if (!email) throw 'Email is required';
    if (!password) throw 'Password is required';

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) throw 'User with this email already exists';

    const hash = await generatePasswordHash(password);

    try {
      const user = new User({
        email,
        password: hash,
        name,
        token: randomUUID(),
      });

      await user.save();
      return user;
    } catch (err) {
      throw `Database error while creating new user: ${err}`;
    }
  }

  static async setPassword(user, password) {
    if (!password) throw 'Password is required';
    user.password = await generatePasswordHash(password); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      throw `Database error while setting user password: ${err}`;
    }
  }
}

module.exports = UserService;
