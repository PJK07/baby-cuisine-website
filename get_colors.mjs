import getColors from 'get-image-colors';
import path from 'path';

const imagePath = path.join(process.cwd(), 'src/assets/56793963f4406674327e30a2587aa6beac1f4afa.png');

getColors(imagePath).then(colors => {
  console.log("Found colors:");
  colors.forEach(color => {
    console.log(`HEX: ${color.hex()}, RGB: ${color.rgb()}`);
  });
}).catch(err => {
  console.error("Error extracting colors:", err);
});
