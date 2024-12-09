const Niche = require('../models/Niche');

class NicheService {
  static async list(userId) {
    try {
      const niches = await Niche.find({ userId }).sort({ createdAt: -1 });
      return niches.map(niche => ({
        id: niche._id,
        name: niche.name,
        pillars: niche.pillars || [],
        pillarsCount: niche.pillars ? niche.pillars.length : 0,
        progress: niche.progress || 0,
        status: niche.status || 'new',
        lastUpdated: niche.updatedAt || niche.createdAt
      }));
    } catch (error) {
      console.error('Error in NicheService.list:', error);
      throw error;
    }
  }

  static async create(userId, name) {
    try {
      const niche = new Niche({
        name,
        userId,
        pillars: [],
        progress: 0,
        status: 'new'
      });
      await niche.save();
      console.log(`Niche created successfully: ${name}`);
      return {
        id: niche._id,
        name: niche.name,
        pillars: [],
        pillarsCount: 0,
        progress: 0,
        status: 'new',
        lastUpdated: niche.createdAt
      };
    } catch (error) {
      console.error('Error in NicheService.create:', error);
      throw error;
    }
  }
}

module.exports = NicheService;
