const API_URL = "http://localhost:5080";

async function request(path, options) {
    
    let response;
    try {
        response = await fetch(API_URL + path, options);
    } catch {
        throw new Error("Can't reach the API at " + API_URL);
    }

    if (!response.ok) {
        let message = "API answered with an error " + response.status;

        try {
            const body = await response.json();
            if (body.error) {
                message = body.error;
            }
        } catch {
            //keep the msg        
        }
        throw new Error(message);
    }

    return response.json();
}

export function getInventory() {
    return request("/inventory");
}

export function matchPanels(panels, settings) {
    return request("/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panels: panels, settings: settings}),
    });
}

export function getCarbonFactor(material) {
    return request("/carbon/" + material);
}