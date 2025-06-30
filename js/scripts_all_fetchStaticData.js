const pages = {};

async function loadData() {
    const response = await fetch("../data/staticPageData.json");
    const data = await response.json();
    data.forEach((page) => {
        pages[page.id] = page;
    });

    handleRouting();
}

function handleRouting() {
    const hash = window.location.hash.substring(1); // Get the hash part of the URL
    if (hash && pages[hash]) {
        displayPageContent(pages[hash]);
        window.scrollTo(0, 0);
        addHyperlinksToReferences();
    } else {
        displayHomePage();
    }
}

function addTooltips(text, hoverMap) {
    if (!hoverMap || Object.keys(hoverMap).length === 0) return text;
    const keys = Object.keys(hoverMap).sort((a, b) => b.length - a.length);
    keys.forEach(key => {
        // For Chinese, just replace all occurrences
        if (/[\u4e00-\u9fa5]/.test(key)) {
            // Chinese key
            text = text.replaceAll(key, `<span class="tooltipp">${key}<span class="tooltiptext">${hoverMap[key]}</span></span>`);
            console.log(`Replaced Chinese key: ${key} with ${hoverMap[key]}`);
        } else {
            // English key: match word with optional punctuation after
            const regex = new RegExp(`\\b${key}\\b(?=[.,;:!?\\s]|$)`, 'g');
            text = text.replace(regex, `<span class="tooltipp">${key}<span class="tooltiptext">${hoverMap[key]}</span></span>`);
            console.log(`${text}`);
        }
    });
    return text;
}

function format_page_content(page) {
    // Get hoverText for English and Chinese
    const engHover = page.Eng_content.hoverText || {};
    const chiHover = page.Chi_content["補充説明"] || {};

    const content = `
        <div style="position: absolute; top: 90px; right: 30px;">
            <i style="font-size:24px; padding-right:5px;" class="fa fa-language"></i>
                <span class="chi">ENG</span> | 
                <span class="eng">中文</span>
        </div>
        <!-- English Version -->
        <div class="english-version">
            <h1 style="text-align: center;padding-top:30px;font-size:80px;">${page.name}</h1>

            <div class="mContent">
                <div class="container row" style="padding:0 50px;">
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-3 text-end">
                        <p id="flipTut">For mobile devices, click the image to flip it, and click somewhere else to flip it back.</p>
                        <div class="flip">
                            <div class="front">
                                <img src="${page.img_map}" alt="Character Image" class="img-fluid" />
                            </div>
                            <div class="back">
                                <img src="${page.img_ourVer}" alt="Character Image Back" class="img-fluid" />
                                <p style="font-size:10px;">Illustrated by ${page.Eng_content.Credit["Illustrated by"]}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-9 text-start">
                
                        <table class="table table-bordered">
                            ${Object.entries(page.Eng_content.Table).map(([key, value]) => `
                                <tr><th>${key}</th><td>${value}</td></tr>
                            `).join("")}
                        </table>
                        
                    </div>
                </div>
                <div class="container">
                    <div class="intro">
                        <h2 style="padding-top:80px;">Introduction</h2>
                        <div>
                            ${page.Eng_content.Introduction.map((item) => 
                                typeof item === "string" && item.startsWith("./images") 
                                    ? `<img src="${item}" alt="Image" class="img-fluid" />` 
                                    : `<p>${addTooltips(item, engHover)}</p>`
                            ).join("")}
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div class="ref">
                        <h2 style="padding-top:30px;">References</h2>
                        <ol>
                            ${page.Eng_content.References.map(ref => `<li> ${ref} </li>`).join("")}
                        </ol>
                    </div>
                </div>
                <div class="container">
                    <div class="credit">
                        <h2 style="padding-top:30px;">Credit</h2>
                        ${page.Eng_content.Credit["Initial Research (English)"] ? `<p><strong>Initial Research (English):</strong> ${page.Eng_content.Credit["Initial Research (English)"]}</p>` : ""}
                        ${page.Eng_content.Credit["Initial Research (English & Chinese)"] ? `<p><strong>Initial Research (English & Chinese):</strong> ${page.Eng_content.Credit["Initial Research (English & Chinese)"]}</p>` : ""}
                        ${page.Eng_content.Credit["English text written by"] ? `<p><strong>English text written by:</strong> ${page.Eng_content.Credit["English text written by"]}</p>` : ""}
                        ${page.Eng_content.Credit["English text reviewed by"] ? `<p><strong>English text reviewed by:</strong> ${page.Eng_content.Credit["English text reviewed by"]}</p>` : ""}
                        ${page.Eng_content.Credit["Chinese Translation"] ? `<p><strong>Chinese Translation:</strong> ${page.Eng_content.Credit["Chinese Translation"]}</p>` : ""}
                    </div>
                </div>
            </div>
        </div>

        <!-- Chinese Version -->
        <div class="chinese-version" style="display: none;">
            <h1 style="text-align: center; font-family: 'JinghuaOldSong', 'Hiragino Kaku Gothic Pro', '微軟正黑體', '蘋果儷中黑', Helvetica, Arial, sans-serif;padding-top:30px;font-size:50px;line-height:1.3;">${page.Chi_content.Table["名稱"]}</h1>
            <div class="mContent">
                <div class="container row" style="padding:0 50px;">
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-3 text-end">
                        <p id="flipTut">若使用手機或平板設備，單擊圖像以翻轉，然後單擊其他地方以翻轉回來。</p>
                        <div class="flip">
                            <div class="front">
                                <img src="${page.img_map}" alt="角色圖片" class="img-fluid" />
                            </div>
                            <div class="back">
                                <img src="${page.img_ourVer}" alt="角色圖片背面" class="img-fluid" />
                                <p style="font-size:14px;">${page.Eng_content.Credit["Illustrated by"]} 繪</p>
                            </div>
                        </div>
                        
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-9 text-start">
                        <table class="table table-bordered">
                            ${Object.entries(page.Chi_content.Table).map(([key, value]) => `
                                <tr><th>${key}</th><td>${value}</td></tr>
                            `).join("")}
                        </table>
                        
                    </div>
                </div>
                <div class="container">
                    <div class="intro">
                        <h2 style="padding-top:80px;">簡介</h2>
                        <div>
                            ${page.Chi_content["簡介"].map((item) => 
                                typeof item === "string" && item.startsWith("./images") 
                                    ? `<img src="${item}" alt="圖片" class="img-fluid" />` 
                                    : `<p>${addTooltips(item, chiHover)}</p>`
                            ).join("")}
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div class="ref">
                        <h2 style="padding-top:50px;">參考資料</h2>
                        <ol>
                            ${page.Chi_content["參考文獻"].map(ref => `<li>${ref}</li>`).join("")}
                        </ol>
                    </div>
                </div>
                <div class="container">
                    <div class="credit">
                        <h2 style="padding-top:50px;">致謝</h2>
                        ${page.Chi_content["致謝"]["初步研究 (英文)"] ? `<p><strong>初步研究 (英文)：</strong> ${page.Chi_content["致謝"]["初步研究 (英文)"]}</p>` : ""}
                        ${page.Chi_content["致謝"]["初步研究 (英文 & 中文)"] ? `<p><strong>初步研究 (英文 & 中文)：</strong> ${page.Chi_content["致謝"]["初步研究 (英文 & 中文)"]}</p>` : ""}
                        ${page.Chi_content["致謝"]["撰文 (英文)"] ? `<p><strong>撰文 (英文)：</strong> ${page.Chi_content["致謝"]["撰文 (英文)"]}</p>` : ""}
                        ${page.Chi_content["致謝"]["英文文字編輯"] ? `<p><strong>英文文字編輯：</strong> ${page.Chi_content["致謝"]["英文文字編輯"]}</p>` : ""}
                        ${page.Chi_content["致謝"]["中文翻譯"] ? `<p><strong>中文翻譯：</strong> ${page.Chi_content["致謝"]["中文翻譯"]}</p>` : ""}
                    </div>
                </div>
            </div>
        </div>
    `;


    // Add the event listener after rendering the content
    setTimeout(() => {
        const engLabel = document.querySelector('.chi');
        const chiLabel = document.querySelector('.eng');

        // Initially show English and hide Chinese content
        document.querySelectorAll('.english-version').forEach(el => {
            el.style.display = 'block';
        });
        document.querySelectorAll('.chinese-version').forEach(el => {
            el.style.display = 'none';
        });

        engLabel.addEventListener('click', () => {
            // Show English sections and hide Chinese sections
            document.querySelectorAll('.english-version').forEach(el => {
                el.style.display = 'block';
            });
            document.querySelectorAll('.chinese-version').forEach(el => {
                el.style.display = 'none';
            });
        });

        chiLabel.addEventListener('click', () => {
            // Show Chinese sections and hide English sections
            document.querySelectorAll('.english-version').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.chinese-version').forEach(el => {
                el.style.display = 'block';
            });
        });
    }, 0);

    return content;
}



// **************************************** /
// **** individual son and monster page **** /
// **************************************** /
function displayPageContent(page) {
    const h1Element = document.getElementById("h1Text");
    h1Element.innerHTML = `<div style="margin-top:10px;margin-left:20px;display: inline-block; padding: 5px 10px;background-color: #c7b996;border-radius: 8px;"><a style="color:rgb(78, 63, 23)!important;" href="#" onclick="displayHomePage()"><i class="fa fa-arrow-left"></i> Back to the Creatures List</a></div>`;

    const pText = document.getElementById("pText");
    pText.innerHTML = ``;

    const clickableMap_front = document.getElementById("clickableMap_front");
    clickableMap_front.innerHTML = ``;

    const clickableMap_verso = document.getElementById("clickableMap_verso");
    clickableMap_verso.innerHTML = ``;

    const contentElement = document.getElementById("fetchContent");
    contentElement.innerHTML = ``;

    const contentElement_ind = document.getElementById("fetchContent_ind");
    contentElement_ind.innerHTML = format_page_content(page)
}

// **************************************** /
// ************** all.html **************** /
// **************************************** /
function displayHomePage() {
    const h1Element = document.getElementById("h1Text");
    h1Element.innerHTML = `<h1>All Creatures in the Map</h1><h1 style="font-size:52px;padding-top: 0px; font-family: 'JinghuaOldSong', 'Hiragino Kaku Gothic Pro', '微軟正黑體', '蘋果儷中黑', Helvetica, Arial, sans-serif;">地圖生物圖鑑</h1>`;

    const pText = document.getElementById("pText");
    pText.innerHTML = `<p style="padding-left:15px;padding-right:15px;">Click the creatures in the map to read each of their tales.<br/>點擊圖中生物，了解他們的故事</p>`;

    const clickableMap_front = document.getElementById("clickableMap_front");
    clickableMap_front.innerHTML = `<img src="images/map/b626738_s.png" usemap="#map_front" alt="Map" id="map1"><map name="map_front"><area target="" alt="Japheth" title="Japheth" href="#S1" coords="668,163,402,361,373,178,436,139,661,134" shape="poly"><area target="" alt="Cam" title="Cam" href="#S2" coords="1499,1105,1590,1047,1703,976,1761,925,1835,844,1838,990,1841,1112,1838,1173,1506,1172" shape="poly"><area target="" alt="Sem" title="Sem" href="#S3" coords="1521,152,1826,394,1833,135,1524,132" shape="poly"><area target="" alt="Septentrio" title="Septentrio" href="#W01" coords="1048,276,1029,291,1034,317,1058,339,1075,348,1120,349,1185,339,1192,291,1187,267" shape="poly"><area target="" alt="Aquilo" title="Aquilo" href="#W02" coords="1204,259,1202,296,1216,324,1267,308,1324,277,1367,248,1370,204,1343,178" shape="poly"><area target="" alt="Circius" title="Circius" href="#W03" coords="974,331,1002,283,974,262,926,235,890,212,861,188,823,202,822,240,847,271,916,312" shape="poly"><area target="" alt="Subsolanus" title="Subsolanus" href="#W04" coords="1752,742,1828,766,1826,519,1751,541" shape="poly"><area target="" alt="Vulturnus" title="Vulturnus" href="#W05" coords="1507,254,1607,247,1716,336,1656,373" shape="poly"><area target="" alt="Eurus" title="Eurus" href="#W06" coords="1595,913,1682,832,1732,785,1781,867,1716,939,1639,990" shape="poly"><area target="" alt="Auster" title="Auster" href="#W07" coords="978,1064,990,1158,1096,1163,1213,1163,1264,1149,1247,1057" shape="poly"><area target="" alt="Libonotus" title="Libonotus" href="#W08" coords="674,964,644,1036,741,1095,817,1122,926,1148,945,1062" shape="poly"><area target="" alt="Euronotus" title="Euronotus" href="#W09" coords="1332,1038,1362,1122,1458,1095,1543,1052,1535,1005,1506,961" shape="poly"><area target="" alt="Favonius" title="Favonius" href="#W10" coords="373,476,443,486,448,649,371,661" shape="poly"><area target="" alt="Africus" title="Africus" href="#W11" coords="386,817,455,769,553,874,599,908,556,992,474,937,405,863" shape="poly"><area target="" alt="Corus" title="Corus" href="#W12" coords="494,322,620,226,717,235,558,368" shape="poly"><area target="" alt="Gegenees" title="Gegenees" href="#M01" coords="75,118,263,293" shape="rect"><area target="" alt="Gorgades" title="Gorgades" href="#M02" coords="75,298,260,462" shape="rect"><area target="" alt="Nephilim" title="Nephilim" href="#M03" coords="76,471,265,639" shape="rect">
<area target="" alt="Onocentaur" title="Onocentaur" href="#M04" coords="75,646,263,817" shape="rect"><area target="" alt="Machlyes" title="Machlyes" href="#M05" coords="75,826,263,995" shape="rect"><area target="" alt="Nisitae" title="Nisitae" href="#M06" coords="76,1004,263,1172" shape="rect"><area target="" alt="Crane-Necked Monster" title="Crane-Necked Monster" href="#M07" coords="76,1184,265,1352" shape="rect"></map>`;


    const img = document.getElementById('map1');
    img.onload = adjustAreaCoords1; // Adjust coordinates once the image is loaded

    // Recalculate coordinates on window resize
    window.addEventListener("resize", adjustAreaCoords1);

    const clickableMap_verso = document.getElementById("clickableMap_verso");
    clickableMap_verso.innerHTML = `<img src="images/map/b626738-verso_s.png" usemap="#map_verso" alt="Map" id="map2"><map name="map_verso"><area target="" alt="Cynocephaly" title="Cynocephaly" href="#M08" coords="684,80,794,175" shape="rect"><area target="" alt="Arimaspi" title="Arimaspi" href="#M09" coords="684,178,792,275" shape="rect"><area target="" alt="Akephaloi" title="Akephaloi" href="#M10" coords="684,280,796,379" shape="rect"><area target="" alt="Nuloi" title="Nuloi" href="#M11" coords="684,385,794,481" shape="rect"><area target="" alt="Amazons" title="Amazons" href="#M12" coords="686,485,796,580" shape="rect"><area target="" alt="Sciopod" title="Sciopod" href="#M13" coords="686,585,796,683" shape="rect"><area target="" alt="Unknown" title="Unknown" href="#M14" coords="685,688,797,784" shape="rect"><area target="" alt="Sciritae" title="Sciritae" href="#M15" coords="1017,78,1128,172" shape="rect"><area target="" alt="Amyctyrae" title="Amyctyrae" href="#M16" coords="1017,179,1129,274" shape="rect"><area target="" alt="Panotti" title="Panotti" href="#M17" coords="1019,282,1128,380" shape="rect"><area target="" alt="Aegipan" title="Aegipan" href="#M18" coords="1017,383,1127,481" shape="rect"><area target="" alt="One-legged hunter" title="One-legged hunter" href="#M19" coords="1017,488,1127,580" shape="rect"><area target="" alt="Hippopodes" title="Hippopodes" href="#M20" coords="1018,587,1128,681" shape="rect"><area target="" alt="Pygmies" title="Pygmies" href="#M21" coords="1019,688,1129,781" shape="rect"></map><br/><br/>`;

    const img2 = document.getElementById('map2');
    img2.onload = adjustAreaCoords2; // Adjust coordinates once the image is loaded

    // Recalculate coordinates on window resize
    window.addEventListener("resize", adjustAreaCoords2);

    const contentElement_ind = document.getElementById("fetchContent_ind");
    contentElement_ind.innerHTML = ``;

    const contentElement = document.getElementById("fetchContent");
    contentElement.innerHTML = `

    ${Object.keys(pages).map(
        (id) =>
            `<div class="eachCharacter"><a href="#${id}">${pages[id].name}<div class="flip"><div class="front"><img src="${pages[id].img_map}" alt="Character Image - map version" class="img-fluid"/></div><div class="back"><img src="${pages[id].img_ourVer}" alt="Character Image Back - our own recreated version" class="img-fluid"/></div></div></a></div>`
    )}
`;
}

function adjustAreaCoords1() {
    const img = document.getElementById('map1');
    const areas = document.querySelectorAll('map[name="map_front"] area');

    // Log original dimensions for verification
    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;
    console.log('Original Width:', originalWidth);
    console.log('Original Height:', originalHeight);

    areas.forEach(area => {
        const coords = area.coords.split(',').map(Number);
        const widthRatio = img.clientWidth / originalWidth;
        const heightRatio = img.clientHeight / originalHeight;

        const newCoords = coords.map((coord, index) => {
            return index % 2 === 0 ? coord * widthRatio : coord * heightRatio;
        });

        area.coords = newCoords.join(',');
    });
}

function adjustAreaCoords2() {
    const img = document.getElementById('map2');
    const areas = document.querySelectorAll('map[name="map_verso"] area');

    // Log original dimensions for verification
    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;
    console.log('Original Width:', originalWidth);
    console.log('Original Height:', originalHeight);

    areas.forEach(area => {
        const coords = area.coords.split(',').map(Number);
        const widthRatio = img.clientWidth / originalWidth;
        const heightRatio = img.clientHeight / originalHeight;

        const newCoords = coords.map((coord, index) => {
            return index % 2 === 0 ? coord * widthRatio : coord * heightRatio;
        });

        area.coords = newCoords.join(',');
    });
}


function addHyperlinksToReferences() {
    const elements = document.querySelectorAll('.ref');

    elements.forEach(element => {
        let text = element.innerHTML;
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
        element.innerHTML = text;
    });
}

window.onhashchange = handleRouting; // Handle hash changes
window.onload = loadData; // Load data on page load
