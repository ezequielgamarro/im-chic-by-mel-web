
const fs = require("fs");
const file = "src/components/Navbar.jsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace("className={elative", "className={`relative");
content = content.replace("tracking-wide }", "tracking-wide`}");
fs.writeFileSync(file, content, "utf8");

