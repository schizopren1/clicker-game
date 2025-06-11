// src/utils/audioManager.js

// Створюємо об'єкт для зберігання всіх звуків.
// Шляхи починаються з '/', оскільки вони відносяться до кореневої папки 'public'.
const sounds = {
    click: new Audio('/sounds/click.mp3'),
    upgrade: new Audio('/sounds/upgrade.mp3'),
    bonus: new Audio('/sounds/bonus.mp3'),
    // Додайте сюди інші звуки, якщо потрібно
  };
  
  // Налаштовуємо гучність для кожного звуку, щоб вони не були занадто гучними
  try {
      sounds.click.volume = 0.5;
      sounds.upgrade.volume = 0.4;
      sounds.bonus.volume = 0.6;
  } catch (e) {
      console.error("Не вдалося налаштувати гучність звуків", e);
  }
  
  
  // Функція для відтворення звуку за його назвою
  export const playSound = (soundName) => {
    const sound = sounds[soundName];
  
    // Перевіряємо, чи існує такий звук
    if (sound) {
      // Встановлюємо час відтворення на початок.
      // Це дозволяє відтворювати звук багато разів поспіль (наприклад, швидкі кліки).
      sound.currentTime = 0;
      
      // Відтворюємо звук і перехоплюємо можливу помилку
      // (наприклад, якщо користувач ще не взаємодіяв зі сторінкою)
      sound.play().catch(error => {
        // Цю помилку можна ігнорувати, вона є стандартною для браузерів
        // console.warn(`Не вдалося відтворити звук "${soundName}": ${error}`);
      });
    } else {
      console.warn(`Спроба відтворити неіснуючий звук: "${soundName}"`);
    }
  };