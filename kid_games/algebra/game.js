class AlgebraGame {
    constructor() {
        this.score = 0;
        this.currentLevel = null;
        this.currentProblem = null;
        this.operators = ['+', '-'];
        this.problemCount = 0;
        this.maxProblems = 10;
        this.hasShownSolution = false;
        this.activeInput = null;
        
        // Initialize UI elements
        this.levelBtns = document.querySelectorAll('.level-btn');
        this.problemContainer = document.getElementById('problem');
        this.inputContainer = document.getElementById('inputContainer');
        this.submitBtn = document.getElementById('submitBtn');
        this.showSolutionBtn = document.getElementById('showSolutionBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.scoreElement = document.getElementById('score');
        this.feedbackElement = document.getElementById('feedback');
        this.solutionContainer = document.getElementById('solutionContainer');
        this.solutionSteps = document.getElementById('solutionSteps');
        this.problemCounterElement = document.getElementById('problemCounter');

        // Add event listeners
        this.levelBtns.forEach(btn => {
            btn.addEventListener('click', () => this.setLevel(btn.dataset.level));
        });
        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.showSolutionBtn.addEventListener('click', () => {
            this.hasShownSolution = true;
            this.showSolution();
            this.checkAnswer(true);
        });
        this.nextBtn.addEventListener('click', () => {
            if (this.problemCount < this.maxProblems) {
                this.generateProblem();
                this.resetUI();
            }
        });
        this.restartBtn.addEventListener('click', () => this.restart());

        // Number pad event listeners
        document.querySelectorAll('.number').forEach(btn => {
            btn.addEventListener('click', () => this.handleNumberInput(btn.textContent));
        });
        document.querySelector('.clear').addEventListener('click', () => this.clearInput());
        document.querySelector('.backspace').addEventListener('click', () => this.handleBackspace());

        // Input field click handlers
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('click', () => this.setActiveInput(input));
            input.addEventListener('focus', () => this.setActiveInput(input));
            input.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
        });

        // Global keyboard handler
        document.addEventListener('keydown', (e) => {
            if (document.activeElement.tagName !== 'INPUT') {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            }
        });
    }

    handleKeyboardInput(e) {
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', 'Backspace', 'Delete', 'Enter', 'Tab', 'ArrowLeft', 'ArrowRight'];
        
        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            this.checkAnswer();
            return;
        }

        // Allow tab to work normally for navigation
        if (e.key === 'Tab') {
            return;
        }

        // Handle arrow keys
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            return;
        }

        // Handle backspace and delete
        if (e.key === 'Backspace' || e.key === 'Delete') {
            return;
        }

        // Only allow one minus sign at the start
        if (e.key === '-' && (e.target.value.includes('-') || e.target.selectionStart !== 0)) {
            e.preventDefault();
            return;
        }
    }

    setActiveInput(input) {
        document.querySelectorAll('input').forEach(inp => 
            inp.classList.remove('active-input'));
        input.classList.add('active-input');
        this.activeInput = input;
    }

    handleNumberInput(value) {
        if (!this.activeInput) return;
        
        // Handle minus sign
        if (value === '-') {
            if (!this.activeInput.value.includes('-') && this.activeInput.selectionStart === 0) {
                this.activeInput.value = '-' + this.activeInput.value;
            }
            return;
        }

        const cursorPos = this.activeInput.selectionStart;
        const currentValue = this.activeInput.value;
        this.activeInput.value = currentValue.slice(0, cursorPos) + value + currentValue.slice(cursorPos);
        this.activeInput.setSelectionRange(cursorPos + 1, cursorPos + 1);
    }

    clearInput() {
        if (!this.activeInput) return;
        this.activeInput.value = '';
        this.activeInput.focus();
    }

    handleBackspace() {
        if (!this.activeInput) return;
        const cursorPos = this.activeInput.selectionStart;
        const currentValue = this.activeInput.value;
        if (cursorPos > 0) {
            this.activeInput.value = currentValue.slice(0, cursorPos - 1) + currentValue.slice(cursorPos);
            this.activeInput.setSelectionRange(cursorPos - 1, cursorPos - 1);
        }
        this.activeInput.focus();
    }

    setLevel(level) {
        this.currentLevel = level;
        this.levelBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.level === level);
        });
        this.restart();
    }

    restart() {
        this.score = 0;
        this.problemCount = 0;
        this.hasShownSolution = false;
        this.scoreElement.textContent = '0';
        this.problemCounterElement.textContent = '0';
        this.resetUI();
        this.generateProblem();
    }

    generateProblem() {
        switch(this.currentLevel) {
            case 'easy':
                this.generateEasyProblem();
                break;
            case 'medium':
                this.generateMediumProblem();
                break;
            case 'hard':
                this.generateHardProblem();
                break;
        }
    }

    generateEasyProblem() {
        const x = Math.floor(Math.random() * 10) + 1;
        const num = Math.floor(Math.random() * 10) + 1;
        const coef = Math.floor(Math.random() * 5) + 1;
        const operator = this.operators[Math.floor(Math.random() * this.operators.length)];
        const xOnRight = Math.random() < 0.5;
        
        let equation, result, solution;

        if (xOnRight) {
            switch(operator) {
                case '+': 
                    result = num + coef * x;
                    equation = `${result} = ${num} + ${coef}x`;
                    solution = [
                        `${result} = ${num} + ${coef}x`,
                        `${result} - ${num} = ${coef}x`,
                        `${(result - num)} = ${coef}x`,
                        `x = ${x}`
                    ];
                    break;
                case '-': 
                    result = num - coef * x;
                    equation = `${result} = ${num} - ${coef}x`;
                    solution = [
                        `${result} = ${num} - ${coef}x`,
                        `${result} - ${num} = -${coef}x`,
                        `${(num - result)} = ${coef}x`,
                        `x = ${x}`
                    ];
                    break;
            }
        } else {
            switch(operator) {
                case '+': 
                    result = coef * x + num;
                    equation = `${coef}x + ${num} = ${result}`;
                    solution = [
                        `${coef}x + ${num} = ${result}`,
                        `${coef}x = ${result} - ${num}`,
                        `${coef}x = ${result - num}`,
                        `x = ${x}`
                    ];
                    break;
                case '-': 
                    result = coef * x - num;
                    equation = `${coef}x - ${num} = ${result}`;
                    solution = [
                        `${coef}x - ${num} = ${result}`,
                        `${coef}x = ${result} + ${num}`,
                        `${coef}x = ${result + num}`,
                        `x = ${x}`
                    ];
                    break;
            }
        }

        this.currentProblem = {
            equation: equation,
            variables: { x: x },
            display: equation,
            solution: solution
        };

        this.updateUI(['x']);
    }

    generateMediumProblem() {
        const x = Math.floor(Math.random() * 10) + 1;
        const num1 = Math.floor(Math.random() * 10) + 1;
        const coef1 = Math.floor(Math.random() * 3) + 1;
        const coef2 = Math.floor(Math.random() * 3) + 1;
        const xOnRight = Math.random() < 0.5;
        
        let equation, solution;

        if (xOnRight) {
            const result = num1 + coef1 * x - coef2 * x;
            equation = `${result} = ${num1} + ${coef1}x - ${coef2}x`;
            solution = [
                `Let's combine like terms on the right side:`,
                `${result} = ${num1} + ${coef1}x - ${coef2}x`,
                `${result} = ${num1} + ${coef1 - coef2}x`,
                `${result} - ${num1} = ${coef1 - coef2}x`,
                `x = ${x}`
            ];
        } else {
            const result = coef1 * x + num1 + coef2 * x;
            equation = `${coef1}x + ${num1} + ${coef2}x = ${result}`;
            solution = [
                `Let's combine like terms on the left side:`,
                `${coef1}x + ${num1} + ${coef2}x = ${result}`,
                `${coef1 + coef2}x + ${num1} = ${result}`,
                `${coef1 + coef2}x = ${result - num1}`,
                `x = ${x}`
            ];
        }

        this.currentProblem = {
            equation: equation,
            variables: { x: x },
            display: equation,
            solution: solution
        };

        this.updateUI(['x']);
    }

    generateHardProblem() {
        const x = Math.floor(Math.random() * 10) + 1;
        const y = Math.floor(Math.random() * 10) + 1;
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const coef1 = Math.floor(Math.random() * 3) + 1;
        const coef2 = Math.floor(Math.random() * 3) + 1;
        const coef3 = Math.floor(Math.random() * 3) + 1;
        const coef4 = Math.floor(Math.random() * 3) + 1;
        const varsOnRight = Math.random() < 0.5;

        let equations, solution;

        if (varsOnRight) {
            const result1 = coef1 * x + coef2 * y + num1;
            const result2 = coef3 * x - coef4 * y + num2;
            equations = [
                `${result1} = ${coef1}x + ${coef2}y + ${num1}`,
                `${result2} = ${coef3}x - ${coef4}y + ${num2}`
            ];
            solution = [
                "Using elimination method:",
                `1) First equation: ${equations[0]}`,
                `2) Second equation: ${equations[1]}`,
                `3) Move all terms to one side in both equations`,
                `4) Multiply first equation by ${coef4}`,
                `5) Multiply second equation by ${coef2}`,
                `6) Add equations to eliminate y`,
                `7) Solve for x: x = ${x}`,
                `8) Substitute back to find y: y = ${y}`
            ];
        } else {
            const result1 = coef1 * x + coef2 * y + num1;
            const result2 = coef3 * x - coef4 * y + num2;
            equations = [
                `${coef1}x + ${coef2}y + ${num1} = ${result1}`,
                `${coef3}x - ${coef4}y + ${num2} = ${result2}`
            ];
            solution = [
                "Using elimination method:",
                `1) First equation: ${equations[0]}`,
                `2) Second equation: ${equations[1]}`,
                `3) Multiply first equation by ${coef4}`,
                `4) Multiply second equation by ${coef2}`,
                `5) Add equations to eliminate y`,
                `6) Solve for x: x = ${x}`,
                `7) Substitute back to find y: y = ${y}`
            ];
        }

        this.currentProblem = {
            equation: equations,
            variables: { x: x, y: y },
            display: equations.join('<br>'),
            solution: solution
        };

        this.updateUI(['x', 'y']);
    }

    updateUI(variables) {
        this.problemContainer.innerHTML = this.currentProblem.display;
        
        // Create input fields for variables
        const inputHTML = variables.map(v => `
            <div class="input-group">
                ${v} = <input type="text" id="input_${v}">
            </div>
        `).join('');
        
        // Update input container without affecting number pad
        this.inputContainer.innerHTML = inputHTML;

        // Add event listeners to new inputs
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('click', () => this.setActiveInput(input));
            input.addEventListener('focus', () => this.setActiveInput(input));
            input.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
        });

        // Set first input as active
        const firstInput = document.querySelector('input');
        if (firstInput) {
            this.setActiveInput(firstInput);
            firstInput.focus();
        }
    }

    resetUI() {
        this.solutionContainer.classList.remove('show');
        this.nextBtn.classList.remove('show');
        this.showSolutionBtn.style.display = 'inline-block';
        this.submitBtn.style.display = 'inline-block';
        this.nextBtn.style.display = 'none';
        this.feedbackElement.textContent = '';
        this.solutionSteps.innerHTML = '';
        this.hasShownSolution = false;
    }

    showSolution() {
        if (!this.currentProblem || !this.currentProblem.solution) return;
        
        this.solutionSteps.innerHTML = this.currentProblem.solution
            .map(step => `<div>${step}</div>`)
            .join('');
        
        this.solutionContainer.classList.add('show');
        this.showSolutionBtn.style.display = 'none';
        this.nextBtn.style.display = 'inline-block';
    }

    checkAnswer(fromSolutionButton = false) {
        if (!this.currentProblem) return;

        const answers = {};
        let correct = true;

        // Collect answers for all variables
        Object.keys(this.currentProblem.variables).forEach(variable => {
            const input = document.getElementById(`input_${variable}`);
            answers[variable] = parseFloat(input.value);
            if (answers[variable] !== this.currentProblem.variables[variable]) {
                correct = false;
            }
        });

        // If showing solution was clicked, count as incorrect
        if (fromSolutionButton) {
            correct = false;
        }

        // Update score and feedback
        if (correct) {
            this.score += this.currentLevel === 'easy' ? 1 : 
                         this.currentLevel === 'medium' ? 2 : 3;
            this.feedbackElement.textContent = 'Correct!';
            this.feedbackElement.className = 'feedback correct';
            
            // Save score to localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                const gameHistory = JSON.parse(localStorage.getItem(`gameHistory_${currentUser.username}`) || '[]');
                gameHistory.push({
                    game: 'Algebra',
                    score: this.score,
                    date: new Date().toISOString()
                });
                localStorage.setItem(`gameHistory_${currentUser.username}`, JSON.stringify(gameHistory));
            }
        } else {
            this.feedbackElement.textContent = 'Incorrect. Here\'s the solution:';
            this.feedbackElement.className = 'feedback incorrect';
            this.showSolution();
        }

        this.problemCount++;
        this.problemCounterElement.textContent = this.problemCount;
        
        if (this.problemCount >= this.maxProblems) {
            this.feedbackElement.textContent = 'Game Complete! Click Restart to play again.';
            this.submitBtn.style.display = 'none';
            this.showSolutionBtn.style.display = 'none';
            this.nextBtn.style.display = 'none';
            return;
        }

        // Show next problem button
        this.submitBtn.style.display = 'none';
        this.showSolutionBtn.style.display = 'none';
        this.nextBtn.style.display = 'inline-block';

        this.scoreElement.textContent = this.score;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new AlgebraGame();
});
