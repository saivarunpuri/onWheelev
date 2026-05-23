const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'frontend/src/pages/Dashboard.jsx',
  'frontend/src/pages/LiveTracking.jsx',
  'frontend/src/pages/Login.jsx',
  'frontend/src/pages/SavedTrips.jsx'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import if not present
  if (!content.includes("import toast from 'react-hot-toast';")) {
    content = content.replace(/(import .* from ['"].*['"];?\n)(?!import)/, "$1import toast from 'react-hot-toast';\n");
  }

  // Replace alert with toast
  content = content.replace(/alert\((['`])(.*?)(['`])\)/g, (match, p1, p2, p3) => {
    const errorKeywords = ['insufficient', 'please', 'invalid', 'already', 'use '];
    const isError = errorKeywords.some(kw => p2.toLowerCase().includes(kw));
    if (isError) {
      return `toast.error(${p1}${p2}${p3})`;
    } else {
      return `toast.success(${p1}${p2}${p3})`;
    }
  });

  // Handle special case where alert was using response.data.message
  content = content.replace(/alert\(response\.data\.message\)/g, 'toast.error(response.data.message)');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
