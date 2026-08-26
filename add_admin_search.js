const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const targetStr = `                        </div>
                    </div>
                </div>
            </div>
            
            <div class="home-content">
                <div class="services-section">`;

const replaceStr = `                        </div>
                    </div>
                </div>
                
                <div class="home-search-bar">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input type="text" placeholder="Search for a service">
                </div>
            </div>
            
            <div class="home-content">
                <div class="services-section">`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replaceStr);
    html = html.replace(/script\.js\?v=\d+/, 'script.js?v=16');
    fs.writeFileSync('index.html', html);
    console.log('Search bar added successfully.');
} else {
    console.log('Could not find target string. Proceeding to try alternative match...');
    const altTargetStr = `                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            \r\n            <div class="home-content">\r\n                <div class="services-section">`;
    if (html.includes(altTargetStr)) {
        html = html.replace(altTargetStr, replaceStr);
        html = html.replace(/script\.js\?v=\d+/, 'script.js?v=16');
        fs.writeFileSync('index.html', html);
        console.log('Search bar added successfully using alternative match.');
    } else {
        console.log('Could not find ANY target string. Aborting.');
    }
}
