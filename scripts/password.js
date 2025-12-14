const STORED_SALT = "c4bbeb23ef1baca96f45a4448cc614ac";
const STORED_HASH = "c3583eab1f0f87ceb0ad68c4a652e2d5ebbf0afcf3c5acaef15c43ba41282d44";

async function verifyPassword(inputPassword) {
    const encoder = new TextEncoder();

    const salt = new Uint8Array(
        STORED_SALT.match(/.{1,2}/g).map(b => parseInt(b, 16))
    );

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(inputPassword),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: 150000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    const hashHex = Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    return hashHex === STORED_HASH;
}

function unlockApp() {
    document.getElementById("password-overlay").style.display = "none";
    sessionStorage.setItem("authenticated", "true");
}

async function handlePasswordSubmit() {
    const input = document.getElementById("password-input");
    const error = document.getElementById("password-error");

    const ok = await verifyPassword(input.value);

    if (ok) {
        unlockApp();
    } else {
        error.textContent = "Onjuist wachtwoord";
        input.value = "";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("authenticated") === "true") {
        unlockApp();
        return;
    }

    document
        .getElementById("password-button")
        .addEventListener("click", handlePasswordSubmit);

    document
        .getElementById("password-input")
        .addEventListener("keydown", e => {
            if (e.key === "Enter") handlePasswordSubmit();
        });
});