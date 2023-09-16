import { Schema, model } from 'mongoose';

export interface IVerse {
  verse: number;
  text: string;
}

const VerseSchema = new Schema({
  verse: { type: Number, required: true },
  text: { type: String, required: true },
});
