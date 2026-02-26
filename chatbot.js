// ═══════════════════════════════════════════
//  CHATBOT.JS — Bot motivacional 8-bit
//  CV Diego. Gerardo. Serra
// ═══════════════════════════════════════════

const BOT_NAME = "PIXEL_BOT";

const MOTIVATIONAL_MESSAGES = [
    "¡Bienvenid@ a mi nivel! Aquí cada skill suma XP real. 🎮",
    "PLAYER 1: Diego Serra. ESPECIALIDAD: Hacer que los sistemas funcionen. ¡FIGHT!",
    "No busques un analista funcional. Busca al que convierte el caos en documentación. 📄",
    "¡COMBO x3! SQL + Integraciones REST + Testing E2E = Diego. 🔥",
    "Cada bug encontrado es un enemigo derrotado. ¡MISSION COMPLETE!",
    "Level up desbloqueado: IA Agentiva. La próxima expansión ya está en progreso. 🚀",
    "¿Tu sistema tiene fallas? No te preocupes. Tengo 99 vidas y experiencia en sistemas críticos. 💪",
    "ACHIEVEMENT UNLOCKED: Nexo perfecto entre negocio y desarrollo.",
    "Dato curioso: Mendoza tiene el mejor vino y el mejor analista funcional. Coincidencia? 🍷",
    "INSERT COIN to hire the best Functional Analyst in Argentina. 🪙",
    "GAME OVER para los procesos manuales. Automatización activada. ⚙️",
    "¡Cargando perfil... 100%! Listo para tu próximo proyecto remoto. 📡",
    "HINT: Un buen analista funcional no solo documenta. También entiende, conecta y entrega valor.",
    "Power-up encontrado: Documentación técnica clara. +500 puntos para el equipo. 📋",
    "No importa qué tan complejo sea el sistema. Siempre hay una lógica detrás. Y yo la encuentro. 🔍",
];

// Tipeo caracter por caracter estilo terminal retro
function typeText(element, text, speed = 35) {
    return new Promise((resolve) => {
        element.textContent = "";
        let i = 0;
        const cursor = document.createElement("span");
        cursor.className = "bot-cursor";
        cursor.textContent = "█";
        element.appendChild(cursor);

        const interval = setInterval(() => {
            if (i < text.length) {
                cursor.remove();
                element.textContent += text[i];
                element.appendChild(cursor);
                i++;
            } else {
                clearInterval(interval);
                // Parpadeo del cursor por 2s y luego desaparece
                setTimeout(() => cursor.remove(), 2000);
                resolve();
            }
        }, speed);
    });
}

// Muestra un mensaje aleatorio que no repita el anterior
let lastMessageIndex = -1;
function getRandomMessage() {
    let idx;
    do {
        idx = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
    } while (idx === lastMessageIndex);
    lastMessageIndex = idx;
    return MOTIVATIONAL_MESSAGES[idx];
}

// Inicializa el chatbot al cargar la página
function initChatbot() {
    const bubble = document.getElementById("bot-bubble");
    const textEl = document.getElementById("bot-text");
    const closeBtn = document.getElementById("bot-close");
    const newMsgBtn = document.getElementById("bot-new-msg");
    const botWidget = document.getElementById("bot-widget");

    if (!bubble || !textEl || !botWidget) return;

    // Mostrar burbuja con animación después de 800ms
    setTimeout(() => {
        bubble.classList.add("visible");
        typeText(textEl, getRandomMessage());
    }, 800);

    // Cerrar chatbot
    closeBtn?.addEventListener("click", () => {
        bubble.classList.remove("visible");
        bubble.classList.add("hidden");
    });

    // Abrir chatbot haciendo click en el widget
    botWidget.addEventListener("click", (e) => {
        if (e.target.closest("#bot-bubble")) return;
        if (bubble.classList.contains("hidden")) {
            bubble.classList.remove("hidden");
            bubble.classList.add("visible");
            typeText(textEl, getRandomMessage());
        }
    });

    // Nuevo mensaje
    newMsgBtn?.addEventListener("click", () => {
        typeText(textEl, getRandomMessage());
    });
}

// Arrancar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initChatbot);
