const generateToken = jest.fn().mockImplementation((user) => {
  return `mock_token_${user._id}`;
});

const verifyToken = jest.fn().mockImplementation((token) => {
  const userId = token.split('_')[2];
  return { id: userId };
});

module.exports = {
  generateToken,
  verifyToken
};