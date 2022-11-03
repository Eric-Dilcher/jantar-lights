import {
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { ColorConfig } from "./colorConfig";
import app from "./firebase";

interface SerializedColorConfig {
  colorConfigStringified: string;
}

const db = getFirestore(app);

function getColorConfigDocRef(uid: string): DocumentReference<DocumentData> {
  return doc(db, "users", uid, "userConfigs", "colorConfig");
}

function serializeColorConfig(config: ColorConfig): SerializedColorConfig {
  return {
    colorConfigStringified: JSON.stringify(config),
  };
}

function deserializeColorConfig(serializedConfig: SerializedColorConfig): ColorConfig {
    return JSON.parse(serializedConfig.colorConfigStringified);
}

export function setColorConfig(
  uid: string,
  config: ColorConfig
): Promise<void> {
  const docRef = getColorConfigDocRef(uid);
  return setDoc(docRef, serializeColorConfig(config));
}

/**
 * Gets the current colorConfig for a user, or sets it if it's not available
 * @param uid 
 * @param defaultConfig 
 * @returns 
 */
export function getColorConfig(
  uid: string,
  defaultConfig: ColorConfig
): Promise<ColorConfig> {
  const docRef = getColorConfigDocRef(uid);
  return getDoc(docRef)
    .then((docSnap) => docSnap.data())
    .then((colorConfig) => {
      if (colorConfig) {
        return deserializeColorConfig(colorConfig as SerializedColorConfig);
      }
      return setColorConfig(uid, defaultConfig).then(() => defaultConfig);
    });
}
