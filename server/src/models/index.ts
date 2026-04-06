import mongoose from 'mongoose';

const ServiceObjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['留守儿童', '留守老人'], required: true },
  age: { type: Number, required: true },
  village: { type: String, required: true },
  situation: { type: String, required: true },
  needs: { type: String, required: true },
  status: { type: String, enum: ['待认领', '已认领'], default: '待认领' }
}, { timestamps: true });

export const ServiceObject = mongoose.model('ServiceObject', ServiceObjectSchema);

const ApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  major: { type: String, required: true },
  phone: { type: String, required: true },
  availability: { type: String, required: true },
  objectId: { type: String },
  reason: { type: String },
  status: { type: String, enum: ['待审核', '已通过', '已拒绝'], default: '待审核' }
}, { timestamps: true });

export const Application = mongoose.model('Application', ApplicationSchema);

const StatsSchema = new mongoose.Schema({
  key: { type: String, default: 'main' },
  viewCount: { type: Number, default: 0 },
  heroImage: { type: String },
  photoWall: [String]
}, { timestamps: true });

export const Stats = mongoose.model('Stats', StatsSchema);
