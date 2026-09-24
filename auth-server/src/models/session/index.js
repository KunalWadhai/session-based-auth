import mongoose from "mongoose";
import { SessionSchema } from "../../schema/session/schema.js";

export const Session = mongoose.model("Session", SessionSchema);