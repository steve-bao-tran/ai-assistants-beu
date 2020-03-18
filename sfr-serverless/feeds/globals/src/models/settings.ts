import * as mongoose from "mongoose";

export interface ISetting extends mongoose.Document {
  key: string;
  value: string;
}

export const SettingSchemaName = "settings";

const SettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

export const Setting = mongoose.model<ISetting>(SettingSchemaName, SettingSchema);
