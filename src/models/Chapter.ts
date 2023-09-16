import { Schema, model } from 'mongoose';
import { IVerse } from './Verse';

export interface IChapter {
  chapter: number;
  verses: Array<IVerse>;
}

const ChapterSchema = new Schema({
  chapter: { type: Number, required: true },
  verses: [{ type: Schema.Types.ObjectId, ref: 'Verse' }],
});

export const Chapter = model<IChapter>('Chapter', ChapterSchema);
