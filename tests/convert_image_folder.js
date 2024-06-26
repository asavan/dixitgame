import sharp from 'sharp';
import { readdir, copyFile } from "node:fs/promises";
import * as path from 'path';

async function main() {
    const dir = process.argv[2];
    const dir2 = process.argv[3];
    const filenames = await readdir(dir);
    for (let filename of filenames) {
        // console.log(filename);
        const longfile = path.join(dir, filename);
        const longfile2 = path.join(dir2, filename);
        const image = await sharp(longfile);
        const metadata = await image.metadata();
        if (metadata.width > 600) {
            console.log(longfile);
            await image.resize(400).toFile(longfile2);
        } else {
            await copyFile(longfile, longfile2);
        }
    }
}

// usage node ./tests/convert_image_folder.js "./assets/evamelinda11/DIXIT CARDS" ./src/images/v2
main();
