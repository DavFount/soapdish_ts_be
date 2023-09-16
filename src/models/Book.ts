import { Schema, model } from 'mongoose';
import { IChapter } from './Chapter';

interface IBook {
  name: string;
  translation: string;
  chapters: Array<IChapter>;
}

const BookSchema = new Schema({
  name: { type: String, required: true },
  translation: { type: String, required: true },
  chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }],
});

export const Book = model<IBook>('Bible', BookSchema);
