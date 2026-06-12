const https = require('https');

https.get('https://www.sayanpaul.me/assets/index-BfA7DaC7.js', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    // Find skill categories
    const results = [];
    // The JS bundle usually minifies objects. Let's look for "title:" and "skills:"
    const regex = /title\s*:\s*["']([^"']+)["'],.*?skills\s*:\s*\[(.*?)\]/gi;
    let match;
    while ((match = regex.exec(data)) !== null) {
      const title = match[1];
      const skillsStr = match[2];
      const skills = [];
      const skillRegex = /["']([^"']+)["']/g;
      let skillMatch;
      while ((skillMatch = skillRegex.exec(skillsStr)) !== null) {
        skills.push(skillMatch[1]);
      }
      results.push({ title, skills });
    }
    console.log(JSON.stringify(results, null, 2));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
