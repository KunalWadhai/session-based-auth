import mongoose from "mongoose";
import { UserSchema } from '../../schema/user/schema.js';

export const User = mongoose.model('User', UserSchema);
