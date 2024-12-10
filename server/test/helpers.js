const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Niche = require('../models/Niche');

// Set a constant JWT secret for testing
const TEST_JWT_SECRET = 'test-secret-key';
process.env.JWT_SECRET = TEST_JWT_SECRET;

async function createTestUser(userData = {}) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password || 'password123', salt);
  
  return User.create({
    email: userData.email || 'test@example.com',
    password: hashedPassword,
    name: userData.name || 'Test User',
    ...userData
  });
}

function generateTestToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    TEST_JWT_SECRET,
    { expiresIn: '1d' }
  );
}

async function createTestNiche(nicheData = {}, user) {
  return Niche.create({
    name: nicheData.name || 'Test Niche',
    userId: user._id,  // Changed from createdBy to userId
    pillars: nicheData.pillars || [],
    status: nicheData.status || 'new',
    progress: nicheData.progress || 0,
    ...nicheData
  });
}

async function createTestPillar(pillarData = {}, niche, user) {
  return Pillar.create({
    title: pillarData.title || 'Test Pillar',
    niche: niche._id,
    createdBy: user._id,
    status: pillarData.status || 'pending',
    ...pillarData
  });
}

module.exports = {
  createTestUser,
  generateTestToken,
  createTestNiche,
  createTestPillar
};
