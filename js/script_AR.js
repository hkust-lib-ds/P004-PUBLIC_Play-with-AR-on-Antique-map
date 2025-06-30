function initializeAR(json_path, pageName, pageNameChi) {
    document.addEventListener("DOMContentLoaded", function () {
        const sceneEl = document.querySelector("a-scene");
        let arSystem;

        sceneEl.addEventListener("loaded", function () {
            arSystem = sceneEl.systems["mindar-image-system"];
        });

        // Dynamically create the tutorial section
        const container = document.getElementById("container");
        const tutorialDiv = document.createElement("div");
        tutorialDiv.id = "tutorial";
        tutorialDiv.innerHTML = `
            <p>
                <strong>
                    Do you know which son of Noah and which creatures in
                    <a
                        target="_blank"
                        href="https://doi.org/10.14711/spcol/b626738"
                    >
                        this map
                    </a>
                    belong to <span style="color: #91722a">${pageName}</span>?
                </strong>
            </p>
            <p>
                <strong>
                    猜猜看！在<a target="_blank" href="https://doi.org/10.14711/spcol/b626738">這幅地圖</a>裡，諾亞的哪個兒子和哪些生物來自<span style="color: #91722a">${pageNameChi}</span>?
                </strong>
            </p>
            <ol>
                <li>Click the button below to start turning on your camera<br/>點擊下方按鈕，啟動相機功能</li>
                <li>Point the camera at each map creature. Those who belong to <span style="color: #91722a">${pageName}</span> will trigger a
                pop-up illustration.<br/>將鏡頭對準地圖上的每個生物，，當偵測到屬於<span style="color: #91722a">${pageNameChi}</span>之地的生物時，即會彈出插圖。</li>
                <li>Click the illustration to learn more about that creature<br/>點擊彈出的插圖了解更多該地圖生物的故事</li>
            </ol>

            <div id="buttons">
                <button id="start-button">Start Exploring! <span class="btn-chi">開始！</span></button>
            </div>
        `;
        container.appendChild(tutorialDiv);

        const startButton = document.querySelector("#start-button");

        startButton.addEventListener("click", () => {
            console.log("start");
            arSystem.start(); // start AR
            tutorialDiv.style.display = "none"; // hide tutorial
        });

        // arReady event triggered when ready
        sceneEl.addEventListener("arReady", (event) => {
            const welcomeMessage = document.createElement("div");
            welcomeMessage.id = "welcome-message";
            welcomeMessage.className = "welcome";
            welcomeMessage.innerHTML = `Welcome to <strong>${pageName}</strong>!`;
            document.body.appendChild(welcomeMessage);
            setTimeout(() => {
                document.body.removeChild(welcomeMessage);
            }, 2000);
        });

        // arError event triggered when something went wrong. Mostly browser compatibility issue
        sceneEl.addEventListener("arError", (event) => {
            console.error("MindAR failed to start");
        });

        // Load data from JSON and dynamically generate content
        fetch(json_path)
            .then((response) => response.json())
            .then((data) => {
                const assetsEl = document.createElement("a-assets");
                sceneEl.appendChild(assetsEl);

                data.forEach((item) => {
                    // Create image asset
                    const imgEl = document.createElement("img");
                    imgEl.id = `${item.id}-img`;
                    imgEl.src = `images/2D/${item.id}_static.png`;
                    assetsEl.appendChild(imgEl);

                    // Create 3D model asset
                    const assetEl = document.createElement("a-asset-item");
                    assetEl.id = `${item.id}-asset`;
                    assetEl.src = `images/3D/${item.id}/scene.gltf`;
                    assetsEl.appendChild(assetEl);

                    // Create info div
                    const infoDiv = document.createElement("div");
                    infoDiv.id = `info_${item.id}`;
                    infoDiv.className = "info-block"; // Apply the CSS class
                    infoDiv.innerHTML = `
                        <img width=50 src="images/2D/${item.id}_static.png"/>
                        <h5>${item.name}</h5>
                        <p><b>Place:</b> ${item.place}</p>
                        <p><b>Characteristic:</b> ${item.characteristic}</p>
                        <p>
                            Click <a href="all.html#${item.id}">here</a> or click
                            the illustration to learn more.
                        </p>
                    `;
                    document.body.appendChild(infoDiv);

                    // Create a-entity
                    const entity = document.createElement("a-entity");
                    entity.id = `${item.id}-target`;
                    entity.setAttribute("mindar-image-target", `targetIndex: ${item.targetIndex}`);
                    entity.innerHTML = `
                        <a-plane
                            id="${item.id}-plane"
                            class="clickable"
                            src="#${item.id}-img"
                            position="0 0 0"
                            height="1"
                            width="1"
                            rotation="0 0 0"
                            scale="1.5 1.5 1.5"
                            transparent="true"
                        ></a-plane>
                        <a-text
                            value="${item.name}"
                            position="0 -0.1 0.3"
                            align="center"
                            color="#FFFFFF"
                            scale="0.4 0.4 0.4"
                        ></a-text>
                        // <a-gltf-model
                        //     id="${item.id}-gltf"
                        //     class="clickable"
                        //     rotation="0 0 0"
                        //     position="0 -0.25 0"
                        //     scale="0.05 0.05 0.05"
                        //     src="#${item.id}-asset"
                        //     animation-mixer
                        // ></a-gltf-model>
                    `;
                    sceneEl.appendChild(entity);

                    // Set up event listeners
                    setupTarget(`#${item.id}-target`, `#${item.id}-plane`, `#${item.id}-gltf`, `#info_${item.id}`, `all.html#${item.id}`);
                });
            });

        // Function to set up event listeners for a target
        function setupTarget(targetId, planeId, gltfId, infoDivId, url) {
            const target = document.querySelector(targetId);
            const plane = document.querySelector(planeId);
            const gltf = document.querySelector(gltfId);
            const infoDiv = document.querySelector(infoDivId);

            target.addEventListener("targetFound", () => {
                console.log("target found");
                infoDiv.style.display = "block"; // Show the infoDiv
            });

            target.addEventListener("targetLost", () => {
                console.log("target lost");
                infoDiv.style.display = "none"; // Hide the infoDiv
            });

            plane.addEventListener("click", () => {
                console.log("plane click");
                window.location.href = url;
            });

            gltf.addEventListener("click", () => {
                console.log("gltf click");
                window.location.href = url;
            });
        }
    });
}