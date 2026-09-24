import { Session } from "./index.js";

export const createSession = async (sessionData) => {
    return Session.create(sessionData)
    .then((res) => res)
    .catch((error) => {
        throw error;
    })
}

export const getSessionByQuery = async (query) => {
    return Session.findOne(query).exec();
}

export const updateSessionByQuery = async (query, update) => {
    return Session.findOneAndUpdate(query, update, { new: true }).exec();
}