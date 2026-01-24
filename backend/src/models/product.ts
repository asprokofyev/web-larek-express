import mongoose, { Types } from 'mongoose';
import { unlink } from 'fs';
import { join } from 'path';

export interface IFile {
  fileName: string;
  originalName: string;
}

export interface IProduct {
  _id: Types.ObjectId;
  title: string;
  image: IFile;
  category: string;
  description: string;
  price: number;
}

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    unique: true,
    required: [true, 'Поле title должно быть заполнено'],
    minlength: [2, 'Минимальная длина поля title = 2'],
    maxlength: [30, 'Максимальная длина поля title = 30'],
  },
  image: {
    fileName: {
      type: String,
      required: [true, 'Поле fileName должно быть заполнено'],
    },
    originalName: {
      type: String,
    },
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    default: null,
  },
}, { versionKey: false });

productSchema.pre('findOneAndUpdate', async function deleteOldImage() {
  // @ts-ignore
  const updateImage = this.getUpdate().$set?.image;
  const docToUpdate = await this.model.findOne(this.getQuery());
  if(updateImage && docToUpdate) {
    unlink(join(__dirname, `../public/${docToUpdate.image.fileName}`), (err) => console.log(err));
  }
});

export default mongoose.model<IProduct>('product', productSchema);
