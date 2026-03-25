import mongoose from "mongoose";

const globalMongoose = globalThis.__taskManagementMongoose ?? {
  conn: null,
  promise: null,
};

globalThis.__taskManagementMongoose = globalMongoose;

const conncetDB = async () => {
  if (globalMongoose.conn) {
    return globalMongoose.conn;
  }

  if (!globalMongoose.promise) {
    globalMongoose.promise = mongoose.connect(process.env.MONGODB_URI).then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}\n`);
      return conn;
    });
  }

  try {
    globalMongoose.conn = await globalMongoose.promise;
    return globalMongoose.conn;
  } catch (error) {
    globalMongoose.promise = null;
    throw error;
  }
};

export default conncetDB;
