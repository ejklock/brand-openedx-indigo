const fs = require("fs");
const path = require('path');

const themesSupported = ["dark"]
let theme = process.env.npm_config_theme;

// INFO: writing copyDirectorySync instead of using fs-extra package because we don't want to have any npm dependency in brand-openedx
function copyDirectorySync(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const files = fs.readdirSync(source);

  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectorySync(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

if (themesSupported.includes(theme)){
  const srcDir = path.resolve(__dirname, 'themes', theme);
  const destDir = path.resolve(__dirname, 'paragon'); 
  copyDirectorySync(srcDir, destDir);
}
