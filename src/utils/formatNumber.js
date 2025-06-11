// src/utils/formatNumber.js

// Масив з позначеннями для великих чисел (K - тисячі, M - мільйони і т.д.)
const SI_SYMBOLS = [
    { value: 1, symbol: "" },
    { value: 1E3, symbol: "K" }, // 1,000
    { value: 1E6, symbol: "M" }, // 1,000,000
    { value: 1E9, symbol: "B" }, // 1,000,000,000
    { value: 1E12, symbol: "T" }, // 1,000,000,000,000
    { value: 1E15, symbol: "P" },
    { value: 1E18, symbol: "E" },
  ];
  
  // Функція, яка приймає число і повертає його у відформатованому вигляді
  export const formatNumber = (number) => {
    // Якщо число менше 1000, просто повертаємо його як є, але з роздільниками
    if (number < 1000) {
      // Math.round для уникнення дробових чисел типу 123.45
      return Math.round(number).toLocaleString();
    }
  
    // Знаходимо відповідний символ для нашого числа (K, M, B...)
    // Ми перебираємо символи з кінця, щоб знайти найбільший відповідний
    const tier = SI_SYMBOLS.slice().reverse().find(t => number >= t.value);
  
    // Якщо символ знайдено
    if (tier) {
      // Ділимо число на значення символу (наприклад, 1,500,000 / 1,000,000 = 1.5)
      const num = number / tier.value;
      // Повертаємо число з двома знаками після коми та символом (наприклад, "1.50M")
      return num.toFixed(2) + tier.symbol;
    }
  
    // Якщо щось пішло не так, просто повертаємо число у стандартному форматі
    return number.toLocaleString();
  };