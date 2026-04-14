import mongoose from 'mongoose';

export function toObjectId(value) {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }
  return new mongoose.Types.ObjectId(value);
}

export function parseCommaSeparated(input) {
  if (!input) {
    return [];
  }

  return String(input)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}