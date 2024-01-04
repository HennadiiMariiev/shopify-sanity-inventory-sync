import fs from 'fs';

type TError = {
  code: string;
};

export function isFileClosed(filePath: string) {
  try {
    // Attempt to open the file in append mode without throwing an error
    fs.openSync(filePath, 'a');
    return true; // File can be opened, so it's closed
  } catch (err) {
    return ((err as TError).code as string) === 'EBUSY'; // 'EBUSY' means the file is still open
  }
}
