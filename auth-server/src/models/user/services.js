import { User } from "./index.js";

export const createUser = async (userData) => {
    return User.create(userData)
    .then((res) => res)
    .catch((error) =>{
        throw error;
    });
}

export const getUserByEmail = async ({ email }) => {
    return User.findOne({ email })
    .then((res) => res)
    .catch((error) => {
      throw error
    })
}

export const getUserByQuery = async (query) => {
    return User.findOne(query)
    .then((res) => res)
    .catch((error) => {
        throw error
    })
}
export const getUser = async (query, populate = []) => {
  return User.findOne(query)
    .populate(populate)
    .then((res) => res)
    .catch((error) => {
      throw error
    })
}

export const getById = async (userId) => {
    return User.findById( userId )
    .then((res) => res)
    .catch((error) => error)
}