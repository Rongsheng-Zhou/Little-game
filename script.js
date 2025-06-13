// Game main object
const game = {
    // Game status
    state: {
        level: 1,
        killed: 0,
        weaponLevel: 1,
        coins: 0,
        enemies: [],
        enemyCount: 0,
        gameActive: true,
        playerX: 150
    },
    
    // Level configuration
    levels: [
        { enemies: 5, enemyHealth: 20, enemySpeed: 1.5, spawnRate: 2000 },
        { enemies: 10, enemyHealth: 50, enemySpeed: 2.0, spawnRate: 1800 },
        { enemies: 15, enemyHealth: 80, enemySpeed: 2.5, spawnRate: 1500 },
        { enemies: 20, enemyHealth: 120, enemySpeed: 3.0, spawnRate: 1200 },
        { enemies: 25, enemyHealth: 200, enemySpeed: 3.5, spawnRate: 1000 }
    ],
    
    // Weapon configuration
    weapons: [
        { damage: 10, range: 100, color: "#7f8c8d", name: "木棍" },
        { damage: 20, range: 120, color: "#95a5a6", name: "铁剑" },
        { damage: 30, range: 140, color: "#3498db", name: "钢剑" },
        { damage: 45, range: 160, color: "#9b59b6", name: "魔法剑" },
        { damage: 60, range: 180, color: "#f1c40f", name: "圣剑" }
    ],
    
    // Initialize the game
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.resetGame();
    },
    
    // Cache DOM elements
    cacheElements() {
        this.elements = {
            player: document.getElementById('player'),
            enemiesContainer: document.getElementById('enemies-container'),
            attackBtn: document.getElementById('attack-btn'),
            upgradeBtn: document.getElementById('upgrade-btn'),
            levelDisplay: document.getElementById('level'),
            killedDisplay: document.getElementById('killed'),
            weaponLevelDisplay: document.getElementById('weapon-level'),
            coinsDisplay: document.getElementById('coins'),
            currentLevelDisplay: document.getElementById('current-level'),
            attackEffect: document.getElementById('attack-effect'),
            levelUp: document.getElementById('level-up'),
            gameOverScreen: document.getElementById('game-over'),
            levelCompleteScreen: document.getElementById('level-complete'),
            finalLevelDisplay: document.getElementById('final-level'),
            totalKilledDisplay: document.getElementById('total-killed'),
            completedLevelDisplay: document.getElementById('completed-level'),
            restartBtn: document.getElementById('restart-btn'),
            startBtn: document.getElementById('start-btn'),
            nextLevelBtn: document.getElementById('next-level-btn')
        };
    },
    
    // Set event listening
    setupEventListeners() {
        this.elements.attackBtn.addEventListener('click', () => this.attack());
        this.elements.upgradeBtn.addEventListener('click', () => this.upgradeWeapon());
        this.elements.startBtn.addEventListener('click', () => this.reloadGame());
        this.elements.restartBtn.addEventListener('click', () => this.reloadGame());
        this.elements.nextLevelBtn.addEventListener('click', () => this.nextLevel());
    },
    
    // Attack action
    attack() {
        // Display the attack animation
        this.elements.player.classList.add('attacking');
        
        // Display attack effects
        const effect = this.elements.attackEffect;
        effect.style.left = (this.state.playerX + 180) + 'px';
        effect.style.top = '200px';
        effect.style.opacity = '1';
        effect.style.width = this.weapons[this.state.weaponLevel - 1].range + 'px';
        effect.style.height = this.weapons[this.state.weaponLevel - 1].range + 'px';
        
        // Play the attack sound effect
        this.playSound('attack');
        
        // Detect the enemies within the attack range
        const playerRight = this.state.playerX + 180;
        const attackRange = this.weapons[this.state.weaponLevel - 1].range;
        
        this.state.enemies.forEach(enemy => {
            const enemyLeft = enemy.x;
            
            if (enemyLeft > playerRight && enemyLeft < playerRight + attackRange) {
                // The enemy has received damage.
                enemy.health -= this.weapons[this.state.weaponLevel - 1].damage;
                
                // Update the blood bar
                const healthBar = enemy.element.querySelector('.health-fill');
                const healthPercent = Math.max(0, enemy.health / enemy.maxHealth * 100);
                healthBar.style.width = healthPercent + '%';
                
                // Enemy injury effect
                enemy.element.style.transform = 'translateX(-5px)';
                setTimeout(() => {
                    enemy.element.style.transform = 'translateX(0)';
                }, 100);
                
                // If the enemy dies
                if (enemy.health <= 0 && !enemy.isDead) {
                    enemy.isDead = true;
                    this.killEnemy(enemy);
                    
                    // Check whether all the enemies in the level have been eliminated
                    if (this.state.killed >= this.levels[this.state.level - 1].enemies) {
                        this.showLevelComplete();
                    }
                }
            }
        });
        
        // Remove the attack animation
        setTimeout(() => {
            this.elements.player.classList.remove('attacking');
            effect.style.opacity = '0';
        }, 300);
    },
    
    // Upgrade weapons
    upgradeWeapon() {
        if (this.state.weaponLevel < 5 && this.state.coins >= 10) {
            this.state.weaponLevel++;
            this.state.coins -= 10;
            
            // Update weapon display
            const weapon = this.elements.player.querySelector('.weapon');
            weapon.style.background = this.weapons[this.state.weaponLevel - 1].color;
            //weapon.querySelector('.weapon-level').textContent = `Lv.${this.state.weaponLevel}`;
            weapon.querySelector('.weapon-level').textContent = this.weapons[this.state.weaponLevel - 1].name;
            this.elements.weaponLevelDisplay.textContent = this.state.weaponLevel;
            
            // Display the upgrade effect
            this.elements.levelUp.style.opacity = '1';
            this.playSound('upgrade');
            
            setTimeout(() => {
                this.elements.levelUp.style.opacity = '0';
            }, 2000);
        }
    },
    
    // Generate enemies
    spawnEnemy() {
        if (!this.state.gameActive) return;
        
        const levelConfig = this.levels[this.state.level - 1];
        
        // Create enemy elements
        const enemy = document.createElement('div');
        enemy.className = 'enemy ' + this.getEnemyColor();
        
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        const healthFill = document.createElement('div');
        healthFill.className = 'health-fill';
        healthFill.style.width = '100%';
        healthBar.appendChild(healthFill);
        
        const enemyBody = document.createElement('div');
        enemyBody.className = 'enemy-body';
        
        const enemyEyes = document.createElement('div');
        enemyEyes.className = 'enemy-eyes';
        const eye1 = document.createElement('div');
        eye1.className = 'enemy-eye';
        const eye2 = document.createElement('div');
        eye2.className = 'enemy-eye';
        enemyEyes.appendChild(eye1);
        enemyEyes.appendChild(eye2);
        
        const enemyLegs = document.createElement('div');
        enemyLegs.className = 'enemy-legs';
        const leg1 = document.createElement('div');
        leg1.className = 'enemy-leg';
        const leg2 = document.createElement('div');
        leg2.className = 'enemy-leg';
        enemyLegs.appendChild(leg1);
        enemyLegs.appendChild(leg2);
        
        enemyBody.appendChild(enemyEyes);
        enemyBody.appendChild(enemyLegs);
        enemy.appendChild(healthBar);
        enemy.appendChild(enemyBody);
        
        this.elements.enemiesContainer.appendChild(enemy);
        
        // Set the initial position and attributes of the enemy
        const enemyObj = {
            element: enemy,
            x: 900,
            speed: levelConfig.enemySpeed + Math.random() * 0.5,
            health: levelConfig.enemyHealth,
            maxHealth: levelConfig.enemyHealth,
            isDead: false
        };
        
        this.state.enemies.push(enemyObj);
        
        // The enemy moves.
        const moveEnemy = () => {
            if (!this.state.gameActive) return;
            
            enemyObj.x -= enemyObj.speed;
            enemy.style.left = enemyObj.x + 'px';
            
            // Check whether the enemy has reached the player's position
            if (enemyObj.x < this.state.playerX + 80) {
                this.playerHit();
                this.removeEnemy(enemyObj);
                return;
            }
            
            // Keep moving
            if (enemyObj.x > -100) {
                requestAnimationFrame(moveEnemy);
            } else {
                this.removeEnemy(enemyObj);
            }
        };
        
        moveEnemy();
        
        // Update the enemy count
        this.state.enemyCount++;
        
        // Check whether more enemies need to be generated
        if (this.state.enemyCount < levelConfig.enemies) {
            setTimeout(() => this.spawnEnemy(), levelConfig.spawnRate);
        }
    },
    
    // Obtain the color of the enemy
    getEnemyColor() {
        const colors = ['blue', 'green', 'red', 'purple', 'gold'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // Remove the enemy
    removeEnemy(enemy) {
        this.state.enemies = this.state.enemies.filter(e => e !== enemy);
        if (enemy.element.parentNode) {
            enemy.element.parentNode.removeChild(enemy.element);
        }
    },
    
    // Kill the enemy
    killEnemy(enemy) {
        this.state.killed++;
        this.state.coins += 4; // Change the gold coin reward to 4
        
        this.elements.killedDisplay.textContent = this.state.killed;
        this.elements.coinsDisplay.textContent = this.state.coins;
        
        // Play the death sound effect
        this.playSound('kill');
        
        // Enemy death animation
        enemy.element.style.transform = 'scale(1.2)';
        enemy.element.style.opacity = '0.5';
        
        setTimeout(() => {
            this.removeEnemy(enemy);
        }, 200);
        
        // Check whether the current level has been completed
        const levelConfig = this.levels[this.state.level - 1];
        if (this.state.killed >= levelConfig.enemies && this.state.enemies.length === 0) {
            this.completeLevel();
        }
    },
    
    // The player was hit.
    playerHit() {
        if (!this.state.gameActive) return;
        
        // Play the sound effect of injury
        this.playSound('hit');
        
        // Animation of player injury
        this.elements.player.style.transform = 'translateX(-10px)';
        setTimeout(() => {
            this.elements.player.style.transform = 'translateX(0)';
        }, 100);
        
        // More accurate collision detection
        const playerRect = this.elements.player.getBoundingClientRect();
        const enemyRect = this.state.enemies[0].element.getBoundingClientRect();
        
        if (playerRect.right > enemyRect.left  && 
            playerRect.left < enemyRect.right ) {
            // Game over
            this.gameOver();
        }
    },
    
    // Complete the level
    completeLevel() {
        this.state.gameActive = false;
        
        // Display the level completion interface
        this.elements.completedLevelDisplay.textContent = this.state.level;
        this.elements.levelCompleteScreen.classList.add('active');
    },
    
    // Enter the next level
    showLevelComplete() {
        // Display the prompt for level completion
        this.elements.levelCompleteScreen.classList.add('active');
        this.elements.completedLevelDisplay.textContent = this.state.level;
        // Set button event
        this.elements.nextLevelBtn.onclick = () => {
            this.elements.levelCompleteScreen.classList.remove('active');
            this.state.level++; // Move the level increment to here

            // Ensure that the weapon levels are retained correctly
            const weapon = this.elements.player.querySelector('.weapon');
            weapon.style.background = this.weapons[this.state.weaponLevel - 1].color;
            weapon.querySelector('.weapon-level').textContent = this.weapons[this.state.weaponLevel - 1].name;
            
            this.nextLevel();
        };
    },
    
    nextLevel() {
        if (this.state.level > 5) {
            //this.state.level = 1;
            return this.gameOver();
        }
        
        // Make sure the level display is updated correctly
        this.elements.currentLevelDisplay.textContent = this.state.level;
        this.resetGame();
    },
    
    // Game over
    gameOver() {
        this.state.gameActive = false;
        
        // Display the game end interface
        this.elements.finalLevelDisplay.textContent = this.state.level - 1;
        this.elements.totalKilledDisplay.textContent = this.state.killed;
        this.elements.gameOverScreen.classList.add('active');
    },
    
    // Reset the game
    resetGame() {
        // Clear the anamy
        this.state.enemies.forEach(enemy => {
            if (enemy.element.parentNode) {
                enemy.element.parentNode.removeChild(enemy.element);
            }
        });
        
        // Reset the game state
        this.state = {
            level: this.state.level,
            killed: 0,
            weaponLevel: this.state.weaponLevel, // Retain the current weapon level
            coins: this.state.coins, // Retain the current number of gold coins
            enemies: [],
            enemyCount: 0,
            gameActive: true,
            playerX: 150
        };
        
        // Update weapon display
        const weapon = this.elements.player.querySelector('.weapon');
        weapon.style.background = this.weapons[this.state.weaponLevel - 1].color;
        weapon.querySelector('.weapon-level').textContent = this.weapons[this.state.weaponLevel - 1].name;
        
        // Update UI
        this.elements.levelDisplay.textContent = `${this.state.level}/5`;
        this.elements.killedDisplay.textContent = '0';
        this.elements.weaponLevelDisplay.textContent = this.state.weaponLevel;
        this.elements.coinsDisplay.textContent = this.state.coins;
        this.elements.currentLevelDisplay.textContent = this.state.level;
        
        // Hide the end interface of the game
        this.elements.gameOverScreen.classList.remove('active');
        this.elements.levelCompleteScreen.classList.remove('active');
        
        // Start generating enemies
        this.spawnEnemy();
    },
    reloadGame() {
        // Reload the page
        location.reload();
    },
    
    // Play the sound effect
    playSound(type) {
        console.log(`Play the sound effect: ${type}`);
    }
};

// Initialize the game
game.init();