const componentTargets = Array.from(document.querySelectorAll("[data-include]"));
const publicationButtonOrder = ["arxiv", "pdf", "talk", "slides"];

async function loadText(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
    }
    return response.text();
}

async function loadJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
    }
    return response.json();
}

async function renderComponents() {
    await Promise.all(
        componentTargets.map(async (target) => {
            const path = target.dataset.include;
            if (!path) {
                return;
            }

            const markup = await loadText(path);
            target.outerHTML = markup;
        })
    );
}

function createButton(label, url) {
    if (!url) {
        return `<span class="action missing" aria-disabled="true">${label}</span>`;
    }

    return `<a class="action" href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
}

function renderPublication(publication) {
    const venue = publication.venue ? ` • ${publication.venue}` : "";
    const actions = publicationButtonOrder
        .map((label) => createButton(label, publication.links?.[label]))
        .join("");

    return `
        <article class="publication">
            <h3>${publication.title}</h3>
            <p class="publication-meta">${publication.authors}${venue}</p>
            <p class="publication-summary">${publication.summary}</p>
            <div class="publication-actions">${actions}</div>
        </article>
    `;
}

async function renderPublications() {
    const publications = await loadJson("data/publications.json");
    const container = document.querySelector("#publication-list");

    if (!container) {
        return;
    }

    container.innerHTML = publications.map(renderPublication).join("");
}

async function initializePage() {
    try {
        await renderComponents();
        await renderPublications();
    } catch (error) {
        console.error(error);
    }
}

initializePage();
