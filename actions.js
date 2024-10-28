document.addEventListener('DOMContentLoaded', () => {
    const termsContainer = document.getElementById('termsContainer');
    const definitionsContainer = document.getElementById('definitionsContainer');
    const feedback = document.getElementById('feedback');
    const scrambleButton = document.getElementById('scrambleButton');
    const uploadCSV = document.getElementById('uploadCSV');

    let draggedTerm = null;

    // Add dragstart and dragend listeners to terms
    function addDragListeners() {
        const terms = document.querySelectorAll('.term');
        const definitions = document.querySelectorAll('.definition');

        terms.forEach(term => {
            term.addEventListener('dragstart', (e) => {
                draggedTerm = term;
                e.dataTransfer.setData('text/plain', term.dataset.match);
                term.classList.add('dragging');
            });

            term.addEventListener('dragend', () => {
                term.classList.remove('dragging');
            });
        });

        definitions.forEach(definition => {
            definition.addEventListener('dragover', (e) => {
                e.preventDefault(); // Allow drop
                definition.classList.add('hovered');
            });

            definition.addEventListener('dragleave', () => {
                definition.classList.remove('hovered');
            });

            definition.addEventListener('drop', (e) => {
                e.preventDefault();
                const matchValue = e.dataTransfer.getData('text/plain');
                const defValue = definition.getAttribute('data-value');

                if (matchValue === defValue) {
                    feedback.textContent = 'Great job!';
                    definition.style.visibility = 'hidden'; // Hide matched definition
                } else {
                    feedback.textContent = 'Not quite. Try again!';
                }

                definition.classList.remove('hovered');
                draggedTerm = null;
            });
        });
    }

    // Scramble function to shuffle definitions
    scrambleButton.addEventListener('click', () => {
        const definitions = Array.from(definitionsContainer.children);
        const shuffledDefinitions = shuffleArray(definitions);

        // Clear the current container and append shuffled definitions
        definitionsContainer.innerHTML = '';
        shuffledDefinitions.forEach(def => definitionsContainer.appendChild(def));
    });

    // Helper function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Handle CSV file upload
    uploadCSV.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const csvData = event.target.result;
                parseCSV(csvData);
            };
            reader.readAsText(file);
        }
    });

    // Parse CSV and create unique terms and definitions
    function parseCSV(data) {
        const rows = data.split('\n');
        const termSet = new Set(); // For unique terms
        const termToDefinitions = {}; // To map terms to definitions

        // Start from index 1 to skip the header row, if present
        for (let i = 1; i < rows.length; i++) {
            const columns = rows[i].split(',');

            // Skip empty rows or malformed rows
            if (columns.length < 2 || !columns[0] || !columns[1]) continue;

            const term = columns[0].trim();
            const definition = columns[1].trim();

            // Add term to set for unique terms
            termSet.add(term);

            // Map definitions to terms
            if (!termToDefinitions[term]) {
                termToDefinitions[term] = [];
            }
            termToDefinitions[term].push(definition);
        }

        // Clear existing terms and definitions
        termsContainer.innerHTML = '';
        definitionsContainer.innerHTML = '';

        // Populate unique terms on the left
        Array.from(termSet).forEach((term, index) => {
            const termElement = document.createElement('div');
            termElement.classList.add('term');
            termElement.setAttribute('data-match', `term${index}`);
            termElement.setAttribute('draggable', 'true');
            termElement.textContent = term;
            termsContainer.appendChild(termElement);
        });

        // Populate definitions on the right
        Array.from(termSet).forEach((term, index) => {
            termToDefinitions[term].forEach((definition) => {
                const definitionElement = document.createElement('div');
                definitionElement.classList.add('definition');
                definitionElement.setAttribute('data-value', `term${index}`);
                definitionElement.textContent = definition;
                definitionsContainer.appendChild(definitionElement);
            });
        });

        // Re-add drag and drop listeners
        addDragListeners();
    }

    // Initialize drag listeners for initial example terms
    addDragListeners();
});
