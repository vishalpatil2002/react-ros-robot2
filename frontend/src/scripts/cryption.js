import CryptoJS from "crypto-js";
import config from "./config.js";

class Crypt {
  static secretKey = config.SECRET_KEY;

  static encrypt(data) {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      this.secretKey
    );
    return encrypted.toString();
  }

  static decrypt(cypherText) {
    const inBytes = CryptoJS.AES.decrypt(cypherText, this.secretKey);
    // console.log("inbytes:", inBytes);
    const decryptedText = inBytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error("Decryption failed or the data is invalid.");
    }

    return JSON.parse(decryptedText);
  }
}

export default Crypt;
