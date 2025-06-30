import * as THREE from "./lib/three.module.js";
import { GLTFLoader } from "./lib/GLTFLoader.js";
// import { MindARThree } from "./lib/mindar-face-three.prod.js";
import { MindARThree } from 'mindar-face-three';

let FaceDecorationMeta = null;
const loadFaceDecorationMeta = async () => {
    try {
        const response = await fetch("data/FaceDecoration/FaceDecoration_meta.json");
        if (!response.ok) {
            throw new Error(
                `Failed to load FaceDecoration_meta.json: ${response.statusText}`
            );
        }
        FaceDecorationMeta = await response.json();
        console.log("FaceDecorationMeta loaded:", FaceDecorationMeta);
    } catch (error) {
        console.error("Error loading FaceDecorationMeta:", error);
    }
};
await loadFaceDecorationMeta();

class Avatar {
    constructor() {
        this.gltf = null;
        this.morphTargetMeshes = [];
        this.visible = false; // Avatar starts hidden by default
    }

    async init(modelPath) {
        try {
            const loader = new GLTFLoader();
            const gltf = await new Promise((resolve, reject) => {
                loader.load(modelPath, resolve, undefined, reject);
            });

            gltf.scene.traverse((object) => {
                if (object.isBone && !this.root) {
                    this.root = object;
                }
                if (!object.isMesh) return;
                const mesh = object;
                if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences)
                    return;
                this.morphTargetMeshes.push(mesh);
            });

            this.gltf = gltf;
            this.gltf.scene.visible = this.visible; // Set initial visibility
        } catch (error) {
            console.error("Error initializing avatar:", error);
            throw error; // Re-throw to handle in setup
        }
    }

    updateBlendshapes(blendshapes) {
        try {
            const categories = blendshapes.categories;
            let coefsMap = new Map();
            for (let i = 0; i < categories.length; ++i) {
                coefsMap.set(categories[i].categoryName, categories[i].score);
            }
            for (const mesh of this.morphTargetMeshes) {
                if (
                    !mesh.morphTargetDictionary ||
                    !mesh.morphTargetInfluences
                ) {
                    continue;
                }
                for (const [name, value] of coefsMap) {
                    if (
                        !Object.keys(mesh.morphTargetDictionary).includes(name)
                    ) {
                        continue;
                    }
                    const idx = mesh.morphTargetDictionary[name];
                    mesh.morphTargetInfluences[idx] = value;
                }
            }
        } catch (error) {
            console.error("Error updating blendshapes:", error);
        }
    }

    toggleVisibility() {
        if (this.gltf && this.gltf.scene) {
            this.visible = !this.visible;
            this.gltf.scene.visible = this.visible;
            console.log(`Avatar visibility toggled: ${this.visible}`);
        }
    }
}

let mindarThree = null;
const selectedDecorations = new Map(); // Track selected decorations by section

const setup = async () => {
    try {
        if (!mindarThree) {
            console.log("Initializing MindAR...");
            mindarThree = new MindARThree({
                container: document.querySelector("#container"),
                renderer: {
                    preserveDrawingBuffer: true
                },
            });
            const { renderer, scene, camera } = mindarThree;

            // Add lighting
            const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
            scene.add(light);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
            directionalLight.position.set(0, 5, 5);
            scene.add(directionalLight);

            // Load and add the default head model
            console.log("Loading default head model...");
            const defaultHead = new Avatar();
            await defaultHead.init("../images/3D/Head0_default.glb");
            defaultHead.gltf.scene.scale.set(1, 1, 1); // Adjust scale if needed
            defaultHead.gltf.scene.position.set(0, 0, 0); // Adjust position if needed
            scene.add(defaultHead.gltf.scene);
            console.log("Default head model added to the scene.");

            // Generate the option panel
            generateOptionPanel(scene);
        }
    } catch (error) {
        console.error("Error in setup:", error);
        throw error;
    }
};

// Dynamically generate the option panel
function generateOptionPanel(scene) {
    const sidePanel = document.getElementById("side-panel");
    sidePanel.innerHTML = ""; // Clear existing content

    for (const [section, items] of Object.entries(FaceDecorationMeta)) {
        const sectionDiv = document.createElement("div");
        sectionDiv.classList.add("section");

        const sectionTitle = document.createElement("h3");
        sectionTitle.textContent =
            section.charAt(0).toUpperCase() + section.slice(1);
        sectionDiv.appendChild(sectionTitle);

        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("buttons");

        items.forEach((item) => {
            const button = document.createElement("button");
            button.classList.add("avatar-toggle");
            button.dataset.section = section;
            button.dataset.id = item.id;

            const img = document.createElement("img");
            img.src = item.img_path;
            img.alt = item.title;
            button.appendChild(img);

            button.addEventListener("click", async () => {
                await handleSelection(scene, section, item);
            });
            buttonsDiv.appendChild(button);
        });

        sectionDiv.appendChild(buttonsDiv);
        sidePanel.appendChild(sectionDiv);
    }
}

// Handle selection logic
async function handleSelection(scene, section, item) {
    console.log("Handling selection for item:", item); // Debug log

    // Check if there is already a selected decoration in the same section

    if (selectedDecorations.has(section)) {
        const { id: currentId, avatar: currentAvatar } =
            selectedDecorations.get(section);

        // If the same item is selected, toggle its visibility and remove it
        if (currentId === item.id) {
            console.log("Removing existing avatar:", currentAvatar); // Debug log
            currentAvatar.toggleVisibility(); // Toggle visibility off
            scene.remove(currentAvatar.gltf.scene); // Remove the model from the scene
            selectedDecorations.delete(section); // Deselect the current item
            updateMessages();
            return;
        }

        // If a different item is selected, remove the current one
        console.log("Unselecting previous avatar:", currentAvatar); // Debug log
        currentAvatar.toggleVisibility(); // Toggle visibility off
        scene.remove(currentAvatar.gltf.scene); // Remove the model from the scene
        selectedDecorations.delete(section); // Clear the previous selection
    }

    // Load and add the new avatar
    try {
        console.log("Loading new avatar model:", item.model_path); // Debug log
        const avatar = new Avatar();
        await avatar.init(item.model_path);
        console.log("Avatar loaded successfully:", avatar); // Debug log

        // Add an anchor for the model
        const anchor = mindarThree.addAnchor(1); // Use anchor ID 1 (adjust as needed)
        avatar.gltf.scene.scale.set(...item.scale); // Set scale from JSON
        avatar.gltf.scene.position.set(...item.position); // Set position from JSON
        avatar.gltf.scene.rotation.set(
            THREE.MathUtils.degToRad(item.rotation[0]), // Convert degrees to radians
            THREE.MathUtils.degToRad(item.rotation[1]),
            THREE.MathUtils.degToRad(item.rotation[2])
        );
        if (section !== "Head") {
            avatar.gltf.scene.userData.isDecoration = true; // Mark as decoration
        }
        anchor.group.add(avatar.gltf.scene); // Attach the model to the anchor
        avatar.toggleVisibility(); // Toggle visibility on
        console.log("Avatar added to anchor:", avatar.gltf.scene); // Debug log

        // Update the selected decorations map
        selectedDecorations.set(section, { id: item.id, avatar });
    } catch (error) {
        console.error("Error handling selection:", error);
    }

    updateMessages();
}

// Update the messages displayed in the overlay
function updateMessages() {
    const overlayText = document.getElementById("overlay-text");
    overlayText.innerHTML = ""; // Clear existing messages

    selectedDecorations.forEach(({ id }) => {
        const item = Object.values(FaceDecorationMeta)
            .flat()
            .find((decoration) => decoration.id === id);

        if (item) {
            const messageDiv = document.createElement("div");
            messageDiv.innerHTML = `<a href="${item.url}" target="_blank"><img width=50 src="${item.img_path}"/><br/><span style="color:black;">${item.title}:</span> ${item.content}</a><hr/>`;
            overlayText.appendChild(messageDiv);
        }
    });

    overlayText.classList.add("visible");
}

window.start = async () => {
    
    // Hide the tutorial and show the side panel
    const tutorialDiv = document.querySelector("#tutorial");
    const sidePanel = document.querySelector("#side-panel");
    if (tutorialDiv) tutorialDiv.style.display = "none";
    if (sidePanel) sidePanel.style.display = "block";
    const responsiveControls = document.querySelector(".responsive-controls");
    const downloadBtn = document.getElementById("download-btn");
    const downloadBtnAR = document.getElementById("download-btn-AR");
    if (responsiveControls) responsiveControls.style.display = "block";
    if (downloadBtn) downloadBtn.style.display = "block";
    if (downloadBtnAR) downloadBtnAR.style.display = "block";

    // Show the welcome message for 2 seconds
    const welcomeMessage = document.createElement("div");
    welcomeMessage.innerHTML =
        "Welcome to <strong>Face Decoration</strong> Playground!";
    welcomeMessage.style.position = "absolute";
    welcomeMessage.style.top = "50%";
    welcomeMessage.style.left = "50%";
    welcomeMessage.style.transform = "translate(-50%, -95%)";
    welcomeMessage.style.backgroundColor = "white";
    welcomeMessage.style.padding = "90px";
    welcomeMessage.style.border = "2px solid black";
    welcomeMessage.style.color = "black";
    document.body.appendChild(welcomeMessage);
    setTimeout(() => {
        document.body.removeChild(welcomeMessage);
    }, 2000);

    try {
        if (!mindarThree) {
            await setup();
        }
        await mindarThree.start();
        const { renderer, scene, camera } = mindarThree;
        // const feedVideo = document.querySelector("#video-feed");
        // feedVideo.srcObject = mindarThree.video.srcObject.clone();
        // feedVideo.play();
        renderer.setAnimationLoop(() => {
            const estimate = mindarThree.getLatestEstimate();
            if (estimate && estimate.blendshapes) {
                selectedDecorations.forEach(({ avatar }) => {
                    if (avatar.visible) {
                        avatar.updateBlendshapes(estimate.blendshapes);
                    }
                });
            }
            renderer.render(scene, camera);
            renderer.outputColorSpace = THREE.SRGBColorSpace;
        });
    } catch (error) {
        console.error("Error starting AR:", error);
    }
};

// with AR 3D effect only
document.getElementById("download-btn-AR").addEventListener("click", async () => {
    if (!mindarThree) return;
    const { renderer, scene, camera } = mindarThree;
    const canvas = renderer.domElement;

    // Force a render to ensure the canvas is up-to-date
    renderer.render(scene, camera);

    // Create a new canvas to copy the AR output
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext("2d");

    // Fill the canvas with a black background
    ctx.fillStyle = "#303030";
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Scale the AR content
    const scale = 1;
    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    // Draw the renderer's canvas (which includes camera and AR overlays)
    ctx.drawImage(canvas, 0, 0);

    // Add watermark text
    const texts = [
        "https://library.hkust.edu.hk/ds/project/p004/",
        "Tales from a 1493 World Map: Playing with Augmented Reality (AR)",
        "© HKUST Library - DS CoLab Project"
    ];
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#fff";
    const padding = 10;
    const lineHeight = 20; 
    texts.forEach((text, index) => {
        ctx.fillText(
            text,
            tempCanvas.width - ctx.measureText(text).width - padding,
            tempCanvas.height - padding - index * lineHeight
        );
    });

    // Download
    const link = document.createElement("a");
    link.download = "AR_3D-only.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
});



document.getElementById("download-btn").addEventListener("click", async () => {
    if (!mindarThree) return;
    const { renderer, scene, camera } = mindarThree;
    const canvas = renderer.domElement;

    // Force a render to ensure the canvas is up-to-date
    renderer.render(scene, camera);

    // Find the video element used by MindAR
    const container = document.querySelector("#container");
    const video = container.querySelector("video") || document.querySelector("video");

    // Create a new canvas to combine video and AR overlay
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext("2d");

    // Draw the video feed as background (if available) flipped horizontally
    if (video && video.readyState >= 2) {
        ctx.save(); // Save the current state
        ctx.scale(-1, 1); // Flip horizontally
        ctx.drawImage(video, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height);
        ctx.restore(); // Restore to original state
    }

    // Adjust the X position for the AR overlay (if needed)
    const offsetX = 0; 
    ctx.drawImage(canvas, offsetX, 0, tempCanvas.width, tempCanvas.height);

    // Add watermark text with a transparent black background
    const texts = [
        "https://library.hkust.edu.hk/ds/project/p004/",
        "Tales from a 1493 World Map: Playing with Augmented Reality (AR)__________",
        "© HKUST Library - DS CoLab Project"
    ];
    const padding = 10;
    const lineHeight = 20; 
    const backgroundHeight = texts.length * lineHeight + padding * 2;
    
    // Calculate the maximum width of the text lines
    const maxWidth = Math.max(...texts.map(text => ctx.measureText(text).width));

    // Draw the transparent background
    ctx.fillStyle = "rgba(100, 70, 36, 0.8)"; 
    ctx.fillRect(tempCanvas.width - maxWidth - padding * 2, 
                 tempCanvas.height - backgroundHeight, 
                 maxWidth + padding * 2, 
                 backgroundHeight);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#fff"; // White text
    texts.forEach((text, index) => {
        ctx.fillText(
            text,
            tempCanvas.width - maxWidth - padding,
            tempCanvas.height - padding - index * lineHeight
        );
    });

    // Download
    const link = document.createElement("a");
    link.download = "AR_wBG.png";
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
});