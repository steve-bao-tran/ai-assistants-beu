import * as mongoose from "mongoose";

export function initDBConnection(uri?: string, extraConfig: any = {}): Promise<any> {
  const connectionCfg = process.env.MONGODB_URL || uri;
  const defaultOptions: mongoose.ConnectionOptions = {
    ...extraConfig,
    poolSize: 1,
    useNewUrlParser: true,
    auth: { authSource: "admin" }
  };
  if (process.env.IS_OFFLINE) {
    mongoose.set("debug", true);
    console.log("state connection mongoose", mongoose.connection.readyState);
  }

  if (mongoose.connection.readyState !== 0) {
    return Promise.resolve(mongoose);
  }

  return mongoose.connect(connectionCfg, defaultOptions).then(() => {
    console.log(`Connect mongodb successfully!`);

    return mongoose;
  }).catch((error) => {
    console.log("Connect mongodb have errors");

    return Promise.reject(error);
  });
}
