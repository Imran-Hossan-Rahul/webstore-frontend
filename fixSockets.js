const fs = require('fs');
const path = require('path');

const filesToFix = [
  "components/AdminComponents/Advanced/RealTimeAnalytics.jsx",
  "components/AdminComponents/LiveEvents.jsx",
  "components/AdminComponents/LiveVisitors.jsx",
  "components/AdminComponents/UnifiedAdminDashboard.jsx",
  "components/AdminComponents/test.jsx",
  "components/dashboard/NotificationDropdown.jsx",
  "components/dashboard/community/DiscussionChat.jsx",
  "components/dashboard/community/DiscussionChatNew.jsx"
];

const basePath = "C:\\Codalina\\codalina-frontend";

filesToFix.forEach(relPath => {
  const fullPath = path.join(basePath, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace `io(url)` with `io(url, { withCredentials: true, transports: ['polling', 'websocket'] })`
    // This regex looks for `io(` followed by something that isn't a comma or closing paren, up to a closing paren.
    // It's a bit tricky because some have options already e.g. LiveEvents.jsx.

    // Let's do string replacement for the specific lines we saw in grep:
    content = content.replace(
      /io\((process\.env\.NEXT_PUBLIC_SOCKET_URL \|\| 'http:\/\/localhost:5000')\);/g,
      "io($1, { withCredentials: true, transports: ['polling', 'websocket'] });"
    );
    
    content = content.replace(
      /io\((process\.env\.NEXT_PUBLIC_SOCKET_URL \|\| "http:\/\/localhost:5000")\);/g,
      "io($1, { withCredentials: true, transports: ['polling', 'websocket'] });"
    );

    content = content.replace(
      /io\((process\.env\.NEXT_PUBLIC_SOCKET_URL \|\| process\.env\.NEXT_PUBLIC_API_URL \|\| "http:\/\/localhost:5000")\);/g,
      "io($1, { withCredentials: true, transports: ['polling', 'websocket'] });"
    );

    content = content.replace(
      /io\((socketUrl)\);/g,
      "io($1, { withCredentials: true, transports: ['polling', 'websocket'] });"
    );

    // LiveEvents has { transports: ["websocket"] }
    content = content.replace(
      /io\((process\.env\.NEXT_PUBLIC_SOCKET_URL \|\| "http:\/\/localhost:5000"), \{ transports: \["websocket"\] \}\);/g,
      "io($1, { withCredentials: true, transports: ['polling', 'websocket'] });"
    );

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log("Fixed", relPath);
  } else {
    console.log("Not found", relPath);
  }
});
