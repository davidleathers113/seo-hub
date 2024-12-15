import { createClient } from '@supabase/supabase-js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { UserModel, UserDocument } from '../../server/database/mongodb/models/User'
import { PillarModel, PillarDocument } from '../../server/database/mongodb/models/Pillar'
import { ArticleModel, ArticleDocument } from '../../server/database/mongodb/models/Article'
import { NicheModel, NicheDocument } from '../../server/database/mongodb/models/Niche'
import { Database } from '../../types/supabase'

dotenv.config()

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// MongoDB connection
const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost/pythagora'

async function connectToMongo() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

async function migrateUsers() {
  console.log('Migrating users...')
  const users = await UserModel.find({})

  for (const user of users) {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user._id.toString(),
        email: user.email,
        name: user.name || null,
        created_at: user.createdAt?.toISOString(),
        updated_at: user.updatedAt?.toISOString(),
        role: user.role || 'user',
        last_login_at: user.lastLoginAt?.toISOString() || null,
        is_active: user.isActive ?? true
      })

    if (error) {
      console.error(`Error migrating user ${user._id}:`, error)
    } else {
      console.log(`Migrated user ${user._id}`)
    }
  }
}

async function migrateNiches() {
  console.log('Migrating niches...')
  const niches = await NicheModel.find({})

  for (const niche of niches) {
    const { data, error } = await supabase
      .from('niches')
      .upsert({
        id: niche._id.toString(),
        name: niche.name,
        user_id: niche.userId?.toString(),
        created_at: niche.createdAt?.toISOString(),
        updated_at: niche.updatedAt?.toISOString(),
        description: null,
        status: niche.status || 'active'
      })

    if (error) {
      console.error(`Error migrating niche ${niche._id}:`, error)
    } else {
      console.log(`Migrated niche ${niche._id}`)
    }
  }
}

async function migratePillars() {
  console.log('Migrating pillars...')
  const pillars = await PillarModel.find({})

  for (const pillar of pillars) {
    const { data, error } = await supabase
      .from('pillars')
      .upsert({
        id: pillar._id.toString(),
        title: pillar.title,
        niche_id: pillar.nicheId?.toString(),
        user_id: pillar.createdById?.toString(),
        created_at: pillar.createdAt?.toISOString(),
        updated_at: pillar.updatedAt?.toISOString(),
        status: pillar.status || 'draft',
        content: null,
        description: null
      })

    if (error) {
      console.error(`Error migrating pillar ${pillar._id}:`, error)
    } else {
      console.log(`Migrated pillar ${pillar._id}`)
    }
  }
}

async function migrateArticles() {
  console.log('Migrating articles...')
  const articles = await ArticleModel.find({})

  for (const article of articles) {
    const { data, error } = await supabase
      .from('articles')
      .upsert({
        id: article._id.toString(),
        title: article.title,
        content: article.content,
        pillar_id: article.subpillarId?.toString(),
        user_id: article.authorId?.toString(),
        created_at: article.createdAt?.toISOString(),
        updated_at: article.updatedAt?.toISOString(),
        status: article.status || 'draft',
        description: article.metaDescription || null,
        keywords: article.keywords || []
      })

    if (error) {
      console.error(`Error migrating article ${article._id}:`, error)
    } else {
      console.log(`Migrated article ${article._id}`)
    }
  }
}

async function main() {
  try {
    await connectToMongo()

    // Run migrations in sequence
    await migrateUsers()
    await migrateNiches()
    await migratePillars()
    await migrateArticles()

    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    process.exit()
  }
}

main()