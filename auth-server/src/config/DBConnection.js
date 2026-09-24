import mongoose from 'mongoose';
import { MONGODB_URI } from '../constants.js';

export async function connectMongoDb(){
    await mongoose.connect(MONGODB_URI);
    console.log('Mongodb connected')
}

export default connectMongoDb;