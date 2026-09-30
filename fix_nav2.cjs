
const fs = require("fs");

const files = [
  "ContactoPage.jsx",
  "InversionPage.jsx"
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  
  let content = fs.readFileSync(file, "utf8");

  if (!content.includes("import Navbar")) {
    content = content.replace("import React", "import Navbar from \"./src/components/Navbar\";\nimport React");
  }

  const startIndex = content.indexOf("{/* Announcement Bar");
  let endIndex = content.indexOf("</header>");
  if(endIndex === -1) {
    endIndex = content.indexOf("</Header>");
  }
  
  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    endIndex += 9; // length of </header>
    content = content.substring(0, startIndex) + "<Navbar />" + content.substring(endIndex);
    fs.writeFileSync(file, content, "utf8");
    console.log("Updated " + file);
  } else {
    console.log("Could not find header block in " + file);
  }
}

