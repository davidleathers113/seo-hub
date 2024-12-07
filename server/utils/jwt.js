const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
