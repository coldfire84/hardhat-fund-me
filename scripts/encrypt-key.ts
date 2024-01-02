import { Wallet } from 'ethers';
import * as fs from 'fs';
import 'dotenv/config';

async function main() {
  if (!process.env.PRIVATE_KEY || !process.env.PRIVATE_KEY_PASSWORD) {
    console.error(
      'Required environment variables PRIVATE_KEY and/or PRIVATE_KEY_PASSWORD not set',
    );
    return;
  }
  const wallet = new Wallet(process.env.PRIVATE_KEY);
  const encryptedJsonKey = await wallet.encrypt(
    process.env.PRIVATE_KEY_PASSWORD,
  );
  fs.writeFileSync('./.encryptedKey.json', encryptedJsonKey);
  console.log('Encrypted key written to ./.encryptedKey.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
