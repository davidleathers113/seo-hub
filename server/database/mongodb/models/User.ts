import mongoose, { Schema } from 'mongoose';
import { User, UserDocument } from '../../interfaces';
import { generateToken } from '../../../utils/jwt';
import { randomUUID } from 'crypto';

const userSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false // Don't include password by default in queries
    },
    name: {
        type: String,
        required: false,
        trim: true
    },
    token: {
        type: String,
        unique: true,
        sparse: true,
        default: () => randomUUID()
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            delete ret.password; // Always remove password from JSON
            return ret;
        }
    }
});

userSchema.methods.generateAuthToken = function(this: UserDocument): string {
    return generateToken({
        _id: this._id?.toString() || '',
        email: this.email
    });
};

userSchema.methods.regenerateToken = async function(this: UserDocument): Promise<UserDocument> {
    this.token = randomUUID();
    if (!this.isNew) {
        await this.save();
    }
    return this as UserDocument;
};

export const UserModel = mongoose.model<UserDocument>('User', userSchema);

// Re-export the UserDocument type for use in other files
export type { UserDocument };
export default UserModel;
