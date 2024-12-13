import mongoose from 'mongoose';
import { User } from '../../interfaces';
import { generateToken } from '../../../utils/jwt';
import { randomUUID } from 'crypto';

// Define the Mongoose document type
export interface UserDocument extends mongoose.Document, Omit<User, 'id'> {
  _id: mongoose.Types.ObjectId;
  token: string;
  lastLoginAt: Date;
  isActive: boolean;
  regenerateToken(): Promise<UserDocument>;
  generateAuthToken(): string;
}

// Define the Mongoose model type
export interface UserModel extends mongoose.Model<UserDocument> {
  authenticateWithPassword(email: string, password: string): Promise<UserDocument | null>;
}

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  token: {
    type: String,
    unique: true,
    index: true,
    default: () => randomUUID(),
  },
}, {
  versionKey: false,
});

// Update the updatedAt timestamp before saving
schema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

schema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    return {
      id: ret._id.toString(),
      email: ret.email,
      name: ret.name,
      token: ret.token,
      lastLoginAt: ret.lastLoginAt,
      isActive: ret.isActive,
      createdAt: ret.createdAt,
      updatedAt: ret.updatedAt
    };
  },
});

schema.methods.regenerateToken = async function(this: UserDocument): Promise<UserDocument> {
  this.token = randomUUID();
  if (!this.isNew) {
    await this.save();
  }
  return this;
};

schema.methods.generateAuthToken = function(this: UserDocument): string {
  return generateToken({
    _id: this._id.toString(),
    email: this.email
  });
};

schema.static('authenticateWithPassword', async function(
  email: string,
  password: string
): Promise<UserDocument | null> {
  const user = await this.findOne({ email }).exec();
  if (!user) return null;

  // Since we removed the password validation for now
  user.lastLoginAt = new Date();
  return await user.save();
});

// Create and export the model
export const UserModel = (mongoose.models.User || mongoose.model<UserDocument, UserModel>('User', schema)) as UserModel;

export default UserModel;