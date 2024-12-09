const Niche = require('../models/Niche');

class NicheService {
  static async list(userId) {
    try {
      console.log(`Fetching niches for user: ${userId}`);
      const niches = await Niche.find({ userId }).sort({ createdAt: -1 });
      console.log(`Found ${niches.length} niches for user ${userId}`);
      const mappedNiches = niches.map(niche => ({
        id: niche._id,
        name: niche.name,
        pillars: niche.pillars || [],
        pillarsCount: niche.pillars ? niche.pillars.length : 0,
        progress: niche.progress || 0,
        status: niche.status || 'new',
        lastUpdated: niche.updatedAt || niche.createdAt
      }));
      console.log('Mapped niches:', JSON.stringify(mappedNiches, null, 2));
      return mappedNiches;
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

  static async getById(nicheId, userId) {
    console.log(`Attempting to fetch niche with ID: ${nicheId} for user: ${userId}`);
    try {
      const niche = await Niche.findOne({ _id: nicheId, userId });

      if (!niche) {
        console.log(`Niche not found in database for ID: ${nicheId} and user: ${userId}`);
        return null;
      }

      console.log('Niche found in database:', niche);
      const mappedNiche = {
        id: niche._id,
        name: niche.name,
        pillars: niche.pillars || [],
        pillarsCount: niche.pillars ? niche.pillars.length : 0,
        progress: niche.progress || 0,
        status: niche.status || 'new',
        lastUpdated: niche.updatedAt || niche.createdAt
      };

      console.log('Mapped niche:', JSON.stringify(mappedNiche, null, 2));
      return mappedNiche;
    } catch (error) {
      console.error('Error in NicheService.getById:', error);
      throw error;
    }
  }

  static async update(nicheId, userId, updatedData) {
    console.log(`Attempting to update niche with ID: ${nicheId} for user: ${userId}`);
    try {
      const niche = await Niche.findOneAndUpdate(
        { _id: nicheId, userId },
        { $set: updatedData },
        { new: true, runValidators: true }
      );

      if (!niche) {
        console.log(`Niche not found or not owned by user: ${nicheId}`);
        return null;
      }

      console.log('Niche updated successfully:', niche);
      return {
        id: niche._id,
        name: niche.name,
        pillars: niche.pillars || [],
        pillarsCount: niche.pillars ? niche.pillars.length : 0,
        progress: niche.progress || 0,
        status: niche.status || 'new',
        lastUpdated: niche.updatedAt || niche.createdAt
      };
    } catch (error) {
      console.error('Error in NicheService.update:', error);
      throw error;
    }
  }

  static async delete(nicheId, userId) {
    console.log(`Attempting to delete niche with ID: ${nicheId} for user: ${userId}`);
    try {
      const result = await Niche.findOneAndDelete({ _id: nicheId, userId });
      if (!result) {
        console.log(`Niche not found or not owned by user: ${nicheId}`);
        return null;
      }
      console.log(`Niche deleted successfully: ${nicheId}`);
      return result;
    } catch (error) {
      console.error('Error in NicheService.delete:', error);
      throw error;
    }
  }
}

module.exports = NicheService;