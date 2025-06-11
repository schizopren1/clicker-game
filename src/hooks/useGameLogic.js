// src/hooks/useGameLogic.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  INITIAL_CREDITS, INITIAL_DUIKTCOINS, UPGRADES_CONFIG,
  SKINS_CONFIG, CASE_COST, CASE_REWARDS, ANTIBONUS_CONFIG, PRESTIGE_SETTINGS
} from '../utils/constants';
import { calculateUpgradeCost, calculateUpgradeEffect } from '../utils/helpers';
import { saveGameState, loadGameState, clearGameState as clearDBGameState } from '../db/indexedDB';

const useGameLogic = () => {
  const [credits, setCredits] = useState(INITIAL_CREDITS);
  const [duiktcoins, setDuiktcoins] = useState(INITIAL_DUIKTCOINS);
  const [upgrades, setUpgrades] = useState(() =>
    UPGRADES_CONFIG.map(u => ({ ...u, level: 0 }))
  );
  const [activeSkin, setActiveSkin] = useState(SKINS_CONFIG[0].id);
  const [unlockedSkins, setUnlockedSkins] = useState([SKINS_CONFIG[0].id]);
  
  const [activeBonuses, setActiveBonuses] = useState([]); // { id, type, value, duration, expiresAt, name }
  const [activeAntiBonuses, setActiveAntiBonuses] = useState([]); // { id, name, description, effectType, expiresAt }
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState(null);

  // --- MEMOIZED CALCULATIONS ---
  const duiktcoinBonus = useMemo(() => 1 + duiktcoins * PRESTIGE_SETTINGS.duiktcoinBonus, [duiktcoins]);

  const clickPowerUpgrade = useMemo(() => upgrades.find(u => u.type === 'click_value_add'), [upgrades]);
  const clickMultiplierUpgrade = useMemo(() => upgrades.find(u => u.type === 'click_multiplier'), [upgrades]);
  
  const baseClickValue = 1;
  const clickValueFromUpgrades = useMemo(() => {
    return clickPowerUpgrade ? calculateUpgradeEffect(clickPowerUpgrade.baseEffect, clickPowerUpgrade.effectIncrement, clickPowerUpgrade.level, clickPowerUpgrade.type) - clickPowerUpgrade.baseEffect : 0;
  }, [clickPowerUpgrade]);

  const clickMultiplierFromUpgrades = useMemo(() => {
     return clickMultiplierUpgrade ? calculateUpgradeEffect(clickMultiplierUpgrade.baseEffect, clickMultiplierUpgrade.effectIncrement, clickMultiplierUpgrade.level, clickMultiplierUpgrade.type) : 1;
  }, [clickMultiplierUpgrade]);

  const tempClickMultiplier = useMemo(() => {
    return activeBonuses
      .filter(b => b.type === 'temp_boost' && b.boostType === 'click_multiplier')
      .reduce((acc, b) => acc * b.value, 1);
  }, [activeBonuses]);

  const totalClickValue = useMemo(() => {
    const antiBonusDisableClick = activeAntiBonuses.some(ab => ab.effectType === 'disable_click');
    if (antiBonusDisableClick) return 0;
    return (baseClickValue + clickValueFromUpgrades) * clickMultiplierFromUpgrades * tempClickMultiplier * duiktcoinBonus;
  }, [baseClickValue, clickValueFromUpgrades, clickMultiplierFromUpgrades, tempClickMultiplier, duiktcoinBonus, activeAntiBonuses]);

  const autoClickCPS = useMemo(() => {
    const upgrade = upgrades.find(u => u.type === 'auto_click_cps');
    if (!upgrade) return 0;
    let cps = calculateUpgradeEffect(upgrade.baseEffect, upgrade.effectIncrement, upgrade.level, upgrade.type);
     const ddos = activeAntiBonuses.find(ab => ab.effectType === 'reduce_passive_income');
    if (ddos) cps *= (1 - ddos.reductionFactor);
    return cps * duiktcoinBonus;
  }, [upgrades, activeAntiBonuses, duiktcoinBonus]);

  const passiveIncomeCPS = useMemo(() => {
    const upgrade = upgrades.find(u => u.type === 'passive_income_cps');
    if (!upgrade) return 0;
    let cps = calculateUpgradeEffect(upgrade.baseEffect, upgrade.effectIncrement, upgrade.level, upgrade.type);
    const ddos = activeAntiBonuses.find(ab => ab.effectType === 'reduce_passive_income');
    if (ddos) cps *= (1 - ddos.reductionFactor);
    return cps * duiktcoinBonus;
  }, [upgrades, activeAntiBonuses, duiktcoinBonus]);


  // --- GAME LOGIC FUNCTIONS ---
  const handleClick = useCallback(() => {
    if (activeAntiBonuses.some(ab => ab.effectType === 'disable_click')) return;
    
    setCredits(prev => prev + totalClickValue);
    // Try to trigger anti-bonus
    ANTIBONUS_CONFIG.forEach(abConfig => {
        if (Math.random() < abConfig.probability && !activeAntiBonuses.find(ab => ab.id === abConfig.id)) {
            triggerAntiBonus(abConfig.id);
        }
    });
  }, [totalClickValue, activeAntiBonuses]);

  const buyUpgrade = useCallback((upgradeId) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.level >= (upgrade.maxLevel || Infinity)) return;

    const cost = calculateUpgradeCost(upgrade.baseCost, upgrade.costMultiplier, upgrade.level);
    if (credits >= cost) {
      setCredits(prev => prev - cost);
      setUpgrades(prev => prev.map(u => 
        u.id === upgradeId ? { ...u, level: u.level + 1 } : u
      ));
    }
  }, [credits, upgrades]);

  const openCase = useCallback(() => {
    const caseDiscountUpgrade = upgrades.find(u => u.type === 'case_cost_reduction_percentage');
    let currentCaseCost = CASE_COST;
    if (caseDiscountUpgrade) {
        const discount = calculateUpgradeEffect(caseDiscountUpgrade.baseEffect, caseDiscountUpgrade.effectIncrement, caseDiscountUpgrade.level, caseDiscountUpgrade.type);
        currentCaseCost *= (1 - discount);
    }
    currentCaseCost = Math.max(0, Math.floor(currentCaseCost));


    if (credits < currentCaseCost) return { success: false, message: "Недостатньо кредитів!" };

    setCredits(prev => prev - currentCaseCost);

    // Зважений випадковий вибір
    const totalWeight = CASE_REWARDS.reduce((sum, reward) => sum + reward.weight, 0);
    let random = Math.random() * totalWeight;
    let chosenReward;
    for (const reward of CASE_REWARDS) {
      if (random < reward.weight) {
        chosenReward = reward;
        break;
      }
      random -= reward.weight;
    }

    let rewardMessage = "";
    if (chosenReward.type === 'credits') {
      const amount = Math.floor(Math.random() * (chosenReward.max - chosenReward.min + 1)) + chosenReward.min;
      setCredits(prev => prev + amount);
      rewardMessage = `Ви виграли ${amount} кредитів!`;
    } else if (chosenReward.type === 'temp_boost') {
      const newBonus = {
        id: `boost_${Date.now()}`,
        type: 'temp_boost',
        boostType: chosenReward.boostType,
        value: chosenReward.value,
        duration: chosenReward.duration * 1000,
        expiresAt: Date.now() + chosenReward.duration * 1000,
        name: chosenReward.name,
      };
      setActiveBonuses(prev => [...prev, newBonus]);
      rewardMessage = `Активовано бонус: ${chosenReward.name}!`;
    } else if (chosenReward.type === 'skin_unlock') {
        const lockedSkins = SKINS_CONFIG.filter(s => !unlockedSkins.includes(s.id));
        if (lockedSkins.length > 0) {
            const randomSkin = lockedSkins[Math.floor(Math.random() * lockedSkins.length)];
            setUnlockedSkins(prev => [...new Set([...prev, randomSkin.id])]);
            rewardMessage = `Розблоковано скін: ${randomSkin.name}!`;
        } else {
            const fallbackAmount = CASE_COST * 2; // Резервний варіант, якщо немає скінів для розблокування
            setCredits(prev => prev + fallbackAmount);
            rewardMessage = `Всі скіни розблоковано! Отримано ${fallbackAmount} кредитів як компенсацію.`;
        }
    }
    return { success: true, message: rewardMessage, cost: currentCaseCost };
  }, [credits, upgrades, unlockedSkins]);

  const triggerAntiBonus = useCallback((antiBonusId) => {
    const config = ANTIBONUS_CONFIG.find(ab => ab.id === antiBonusId);
    if (!config || activeAntiBonuses.find(ab => ab.id === antiBonusId)) return;

    const newAntiBonus = {
        id: config.id,
        name: config.name,
        description: config.description,
        effectType: config.effectType,
        duration: config.duration,
        expiresAt: Date.now() + config.duration,
        ...(config.reductionFactor && { reductionFactor: config.reductionFactor }),
        ...(config.percentage && { percentage: config.percentage }),
    };

    if (config.effectType === 'lose_credits_percentage') {
        setCredits(prev => Math.floor(prev * (1 - config.percentage)));
        // Цей антибонус миттєвий, його не потрібно додавати до activeAntiBonuses з таймером
        // Можливо, ви захочете показати сповіщення для цього.
        console.log(`Антибонус: ${config.name} - втрачено ${config.percentage*100}% кредитів.`);
        // Додайте до тимчасового списку для відображення, якщо потрібно, або просто використовуйте спливаюче повідомлення/сповіщення
        setActiveAntiBonuses(prev => [...prev, { ...newAntiBonus, expiresAt: Date.now() + 5000 }]); // Показати на 5с
    } else {
        setActiveAntiBonuses(prev => [...prev, newAntiBonus]);
    }
  }, [activeAntiBonuses]);


  const prestige = useCallback(() => {
    const duiktcoinsToGain = Math.floor(
        Math.log(credits / PRESTIGE_SETTINGS.baseRequirement) / Math.log(PRESTIGE_SETTINGS.costScaling)
    );

    if (duiktcoinsToGain <= 0) return { success: false, message: "Недостатньо прогресу для престижу." };
    
    setCredits(INITIAL_CREDITS);
    setDuiktcoins(prev => prev + duiktcoinsToGain);
    setUpgrades(UPGRADES_CONFIG.map(u => ({ ...u, level: 0 })));
    setActiveBonuses([]);
    setActiveAntiBonuses([]);
    // Зберегти розблоковані скіни? Так, зазвичай престиж не скидає косметику.
    // setUnlockedSkins([SKINS_CONFIG[0].id]); // Якщо треба скидати
    
    return { success: true, message: `Ви отримали ${duiktcoinsToGain} Duiktcoin(ів)!`};
  }, [credits]);

  const selectSkin = useCallback((skinId) => {
    if (unlockedSkins.includes(skinId)) {
      setActiveSkin(skinId);
      const skin = SKINS_CONFIG.find(s => s.id === skinId);
      if (skin) {
        Object.entries(skin.theme).forEach(([key, value]) => {
          document.documentElement.style.setProperty(key, value);
        });
      }
    }
  }, [unlockedSkins]);

  // --- EFFECTS ---

  // Завантаження стану гри з IndexedDB
  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      try {
        const savedState = await loadGameState();
        if (savedState) {
          setCredits(savedState.credits ?? INITIAL_CREDITS);
          setDuiktcoins(savedState.duiktcoins ?? INITIAL_DUIKTCOINS);
          // Переконатися, що структура покращень відповідає поточній конфігурації, рівні зберігаються
          const loadedUpgrades = UPGRADES_CONFIG.map(cfg => {
            const savedUpgrade = savedState.upgrades?.find(su => su.id === cfg.id);
            return { ...cfg, level: savedUpgrade?.level ?? 0 };
          });
          setUpgrades(loadedUpgrades);
          setActiveSkin(savedState.activeSkin ?? SKINS_CONFIG[0].id);
          setUnlockedSkins(savedState.unlockedSkins ?? [SKINS_CONFIG[0].id]);
          setActiveBonuses(savedState.activeBonuses?.filter(b => b.expiresAt > Date.now()) ?? []);
          setActiveAntiBonuses(savedState.activeAntiBonuses?.filter(ab => ab.expiresAt > Date.now()) ?? []);
        }
      } catch (error) {
        console.error("Не вдалося завантажити стан гри:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGame();
  }, []);

  // Застосувати обраний скін при завантаженні/зміні
   useEffect(() => {
    selectSkin(activeSkin);
  }, [activeSkin, selectSkin]); // selectSkin мемоізовано

  // Зберігати стан гри в IndexedDB періодично або при значних змінах
  useEffect(() => {
    if (isLoading) return; // Не зберігати під час завантаження

    const gameState = {
      credits, duiktcoins, upgrades, activeSkin, unlockedSkins, activeBonuses, activeAntiBonuses
    };
    
    const save = async () => {
        try {
            await saveGameState(gameState);
            setLastSaveTime(new Date());
            // console.log("Стан гри збережено:", new Date().toLocaleTimeString());
        } catch (error) {
            console.error("Не вдалося зберегти стан гри:", error);
        }
    }

    // Відкладене збереження (debounce)
    const timerId = setTimeout(save, 1000); // Зберігати через 1 секунду після останньої зміни
    return () => clearTimeout(timerId);

  }, [credits, duiktcoins, upgrades, activeSkin, unlockedSkins, activeBonuses, activeAntiBonuses, isLoading]);


  // Інтервал для пасивного доходу, авто-клікерів, таймерів бонусів/антибонусів
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Пасивний дохід та авто-клікер
      const incomeFromPassive = passiveIncomeCPS;
      const incomeFromAutoClick = autoClickCPS * totalClickValue / ((baseClickValue + clickValueFromUpgrades) * clickMultiplierFromUpgrades * tempClickMultiplier || 1) ; // авто-клікер також отримує переваги від множників
      
      setCredits(prev => prev + incomeFromPassive + incomeFromAutoClick);

      // Перевірити та видалити застарілі бонуси
      setActiveBonuses(prev => prev.filter(b => b.expiresAt > Date.now()));
      // Перевірити та видалити застарілі антибонуси
      setActiveAntiBonuses(prev => prev.filter(ab => ab.expiresAt > Date.now()));

      // Розблокування скінів на основі умов
      SKINS_CONFIG.forEach(skin => {
        if (!unlockedSkins.includes(skin.id)) {
            if (skin.unlockCondition.type === 'credits' && credits >= skin.unlockCondition.value) {
                setUnlockedSkins(prev => [...new Set([...prev, skin.id])]);
            } else if (skin.unlockCondition.type === 'duiktcoins' && duiktcoins >= skin.unlockCondition.value) {
                 setUnlockedSkins(prev => [...new Set([...prev, skin.id])]);
            }
        }
      });

    }, 1000); // Кожну секунду

    return () => clearInterval(intervalId);
  }, [passiveIncomeCPS, autoClickCPS, totalClickValue, baseClickValue, clickValueFromUpgrades, clickMultiplierFromUpgrades, tempClickMultiplier, credits, duiktcoins, unlockedSkins]);


  const getDuiktcoinsOnPrestige = useCallback(() => {
     if (credits < PRESTIGE_SETTINGS.baseRequirement) return 0;
    // Спрощено: кожен Duiktcoin коштує baseRequirement * (scaling ^ (поточні_зароблені_duiktcoins))
    // Ця формула потребує ретельного обдумування щодо того, скільки ви *отримаєте*
    // Простіший спосіб: обчислити, скільки разів ви можете "дозволити" собі зростаючу вартість
    let potentialDuiktcoins = 0;
    let currentCredits = credits;
    let costForNext = PRESTIGE_SETTINGS.baseRequirement;
    
    // Це трохи складно, якщо вартість масштабується за дуіткоін *в межах одного престижу*.
    // Давайте поки що використаємо простішу формулу: Загальні кредити / базова вартість престижу (ігноруючи масштабування того, *скільки* ви отримаєте за цей престиж)
    // Поширена формула: floor( C * (загальний_заробіток / P_0)^(1/S) ) - D_поточний
    // Для простоти:
    const gain = Math.floor(Math.max(0, Math.sqrt(credits / PRESTIGE_SETTINGS.baseRequirement * 10) -1 )); // Приклад формули
    return gain > 0 ? gain : 0;

    // Більш точно: скільки очок престижу можна купити за поточні кредити?
    // Це може бути краще:
    // let prestigePoints = 0;
    // if (credits >= PRESTIGE_SETTINGS.baseRequirement) {
    //    prestigePoints = Math.floor(Math.pow(credits / PRESTIGE_SETTINGS.baseRequirement, 1/2.5)); // Приклад
    // }
    // return prestigePoints;
    // Простіший розрахунок наразі, заснований на початкових думках:
    // Кожен Duiktcoin робить *наступний* дорожчим.
    // Скільки можна купити *прямо зараз*?
    // Якщо у мене 10М кредитів, а база 1М, я можу зробити престиж. 
    // Розрахунок для 'duiktcoinsToGain' у prestige() кращий.
    let gainCalc = 0;
    if (credits >= PRESTIGE_SETTINGS.baseRequirement) {
        gainCalc = Math.floor(
           Math.log(credits / PRESTIGE_SETTINGS.baseRequirement + 1) / Math.log(PRESTIGE_SETTINGS.costScaling)
        ); // це більше схоже на правду
         // або простіший:
        gainCalc = Math.floor(credits / (PRESTIGE_SETTINGS.baseRequirement * Math.pow(PRESTIGE_SETTINGS.costScaling, duiktcoins)));
    }
    // Формула в prestige() насправді нормальна, давайте її використаємо.
    const duiktcoinsToGain = Math.floor(
        Math.log(credits / PRESTIGE_SETTINGS.baseRequirement +1) / Math.log(PRESTIGE_SETTINGS.costScaling) // log(1) = 0
    );
     return Math.max(0, duiktcoinsToGain);


  }, [credits, duiktcoins]);


  const clearGameProgress = async () => {
    if (window.confirm("Ви впевнені, що хочете скинути ВЕСЬ прогрес? Це неможливо буде скасувати.")) {
        await clearDBGameState(); // Очистити з БД
        // Скинути змінні стану
        setCredits(INITIAL_CREDITS);
        setDuiktcoins(INITIAL_DUIKTCOINS);
        setUpgrades(UPGRADES_CONFIG.map(u => ({ ...u, level: 0 })));
        setActiveSkin(SKINS_CONFIG[0].id);
        setUnlockedSkins([SKINS_CONFIG[0].id]);
        setActiveBonuses([]);
        setActiveAntiBonuses([]);
        setIsLoading(true); // Примусове перезавантаження/перевірка
        setTimeout(() => setIsLoading(false), 100); // Короткий стан завантаження
        selectSkin(SKINS_CONFIG[0].id); // Повторно застосувати стандартний скін
        alert("Прогрес скинуто.");
    }
  };


  return {
    credits,
    duiktcoins,
    upgrades,
    activeSkin,
    unlockedSkins,
    activeBonuses,
    activeAntiBonuses,
    isLoading,
    lastSaveTime,
    handleClick,
    buyUpgrade,
    openCase,
    prestige,
    selectSkin,
    getDuiktcoinsOnPrestige,
    totalClickValue,
    autoClickCPS,
    passiveIncomeCPS,
    duiktcoinBonus,
    clearGameProgress,
    // Для відображення вартості та ефектів в інтерфейсі
    calculateUpgradeCost,
    calculateUpgradeEffect,
  };
};

export default useGameLogic;