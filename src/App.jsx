// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Компоненти, дані та утиліти
import ClickerButton from './features/Clicker/ClickerButton';
import UpgradeItem from './features/Upgrades/UpgradeItem';
import CaseItem from './features/Cases/CaseItem';
import PrestigeSystem from './features/Prestige/PrestigeSystem';
import SkinItem from './features/Skins/SkinItem';
import skinPanelStyles from './features/Skins/Skins.module.scss';
import ToastManager from './features/Notifications/ToastManager';
import { upgradesList, calculateUpgradeCost, UPGRADE_TYPES } from './utils/upgradesData';
import { purchasableCases, getRandomCaseReward, CASE_REWARD_INTERNAL_TYPES } from './utils/casesData';
import { PRESTIGE_SETTINGS } from './utils/gameConfig';
import { skinsList, SKIN_UNLOCK_TYPE } from './utils/skinsData';
import { saveGameState, loadGameState } from './db/indexedDB';
import { playSound } from './utils/audioManager';
import { formatNumber } from './utils/formatNumber';
import './styles/global.scss';

// Константи
const INITIAL_CREDITS = 0;
const BASE_CLICK_VALUE = 1;
const GAME_STATE_KEY_IDB = 'mainGameState';

const PANEL_TYPES = {
  UPGRADES: 'upgrades',
  CASES: 'cases',
  PRESTIGE: 'prestige',
  SKINS: 'skins',
};

function App() {
  // --- Стани ---
  const [credits, setCredits] = useState(INITIAL_CREDITS);
  const [upgrades, setUpgrades] = useState({});
  const [totalClicks, setTotalClicks] = useState(0);
  const [unlockedSkins, setUnlockedSkins] = useState(['neon_crystal']);
  const [activeSkinId, setActiveSkinId] = useState('neon_crystal');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePanel, setActivePanel] = useState(null);

  const clickerButtonRef = useRef(null);

  // --- Розрахунки ---
  const prestigeIncomeMultiplier = useMemo(() => (1 + (0 * PRESTIGE_SETTINGS.INCOME_BONUS_PER_DUIKTCOIN)), []);
  const { clickValue, autoCPS, passivePips } = useMemo(() => {
    let cV = BASE_CLICK_VALUE, aCPS = 0, pP = 0;
    Object.entries(upgrades).forEach(([id, lvl]) => {
      const u = upgradesList.find(up => up.id === id);
      if (u && lvl > 0) {
        if (u.type === UPGRADE_TYPES.CLICK_BOOST) cV += u.baseEffect * lvl;
        if (u.type === UPGRADE_TYPES.AUTO_CLICKER) aCPS += u.baseEffect * lvl;
        if (u.type === UPGRADE_TYPES.PASSIVE_INCOME) pP += u.baseEffect * lvl;
      }
    });
    return { clickValue: cV, autoCPS: aCPS, passivePips: pP };
  }, [upgrades]);
  const currentClickValue = useMemo(() => Math.max(1, Math.round(clickValue * prestigeIncomeMultiplier)), [clickValue, prestigeIncomeMultiplier]);
  const effectiveCPS = useMemo(() => (Math.round((autoCPS * currentClickValue + passivePips) * prestigeIncomeMultiplier)), [autoCPS, passivePips, currentClickValue, prestigeIncomeMultiplier]);

  // --- Дії ---
  const addNotification = useCallback((nP) => { setNotifications(p => [{ id: Date.now(), ...nP }, ...p.slice(0, 4)]); }, []);
  const dismissNotification = useCallback((id) => { setNotifications(p => p.filter(n => n.id !== id)); }, []);
  
  const handleManualClick = useCallback(() => {
    playSound('click');
    setCredits(p => p + currentClickValue);
    setTotalClicks(p => p + 1);
  }, [currentClickValue]);

  const handlePurchaseUpgrade = useCallback((upgradeId, cost) => {
    const upgrade = upgradesList.find(u => u.id === upgradeId);
    const currentLevel = upgrades[upgradeId] || 0;
    if (credits >= cost && currentLevel < upgrade.maxLevel) {
      playSound('upgrade');
      setCredits(p => p - cost);
      setUpgrades(p => ({ ...p, [upgradeId]: currentLevel + 1 }));
      addNotification({ type: 'success', message: `"${upgrade.name}" покращено!`, icon: upgrade.icon });
    }
  }, [credits, upgrades, addNotification]);
  
  const handlePurchaseAndOpenCase = useCallback((caseId, cost) => {
    if (credits < cost) {
      addNotification({ type: 'warning', title: 'Мало коштів!', message: `Потрібно ${formatNumber(cost)} кредитів.` });
      return;
    }
    playSound('upgrade');
    setCredits(p => p - cost);
    const reward = getRandomCaseReward();
    addNotification({ type: 'success', title: `З кейса: ${reward.name}!`, message: typeof reward.getDescription === 'function' ? reward.getDescription(reward.currentValue) : '', icon: reward.icon || '🎉', duration: 7000 });
    if (reward.type === CASE_REWARD_INTERNAL_TYPES.INSTANT_CREDITS) {
      const value = reward.currentValue || 0;
      setCredits(p => p + value);
    }
  }, [credits, addNotification]);

  const handleUnlockSkin = useCallback((skinId) => {
    const skin = skinsList.find(s => s.id === skinId);
    if (!skin || unlockedSkins.includes(skinId)) return;
    if (skin.unlockType === SKIN_UNLOCK_TYPE.CREDITS && credits >= skin.unlockValue) {
      setCredits(prev => prev - skin.unlockValue);
      setUnlockedSkins(prev => [...prev, skinId]);
      playSound('upgrade');
      addNotification({ type: 'success', title: 'Скін розблоковано!', message: `"${skin.name}" тепер ваш.`, icon: '🎨' });
    } else {
      addNotification({ type: 'warning', title: 'Недостатньо коштів!', message: `Потрібно ${formatNumber(skin.unlockValue)} кредитів.`, icon: '⚠️' });
    }
  }, [credits, unlockedSkins, addNotification]);

  const handleSelectSkin = useCallback((skinId) => {
    if (unlockedSkins.includes(skinId)) {
      setActiveSkinId(skinId);
      const skin = skinsList.find(s => s.id === skinId);
      addNotification({ type: 'info', message: `Скін "${skin?.name}" активовано.`, icon: '✔️' });
    }
  }, [unlockedSkins, addNotification]);
  
  const togglePanel = useCallback((panelName) => { setActivePanel(prev => (prev === panelName ? null : panelName)); }, []);

  // --- Життєвий цикл ---
  useEffect(() => {
    const loadGame = async () => {
      setIsLoading(true);
      try {
        const savedData = await loadGameState(GAME_STATE_KEY_IDB);
        if (savedData) {
          setCredits(savedData.credits || INITIAL_CREDITS);
          setUpgrades(savedData.upgrades || {});
          setTotalClicks(savedData.totalClicks || 0);
          const savedUnlocked = savedData.unlockedSkins || ['neon_crystal'];
          setUnlockedSkins(savedUnlocked);
          setActiveSkinId(savedUnlocked.includes(savedData.activeSkinId) ? savedData.activeSkinId : 'neon_crystal');
        }
      } catch (error) { console.error("Помилка завантаження гри:", error); }
      finally { setIsLoading(false); }
    };
    loadGame();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const handler = setTimeout(() => {
      saveGameState({ credits, upgrades, totalClicks, unlockedSkins, activeSkinId }, GAME_STATE_KEY_IDB);
    }, 1000);
    return () => clearTimeout(handler);
  }, [credits, upgrades, totalClicks, unlockedSkins, activeSkinId, isLoading]);

  useEffect(() => {
    const skin = skinsList.find(s => s.id === activeSkinId);
    if (skin?.themeVariables) {
      Object.entries(skin.themeVariables).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    }
  }, [activeSkinId]);

  useEffect(() => {
    const interval = setInterval(() => { if (effectiveCPS > 0) { setCredits(prev => prev + effectiveCPS); } }, 1000);
    return () => clearInterval(interval);
  }, [effectiveCPS]);

  // --- Рендер ---
  if (isLoading) { return <div className="loading-screen">Завантаження гри...</div>; }

  return (
    <div className="app-container">
      <main className={`game-layout ${activePanel ? 'panel-view-active' : ''}`}>
        <div className="left-column">
          <header className="app-header">
            <h1>Клікер Манія</h1>
            <div className="stats-display">
              <p className="credits-stat">Кредити: <span>{formatNumber(credits)}</span></p>
              <p>Клік: <span>+{formatNumber(currentClickValue)}</span></p>
              {effectiveCPS > 0 && <p>Дохід/сек: <span>+{formatNumber(effectiveCPS)}</span></p>}
            </div>
          </header>
          <section className="clicker-section">
            <div ref={clickerButtonRef}>
              <ClickerButton onClick={handleManualClick} clickValue={formatNumber(currentClickValue)} />
            </div>
          </section>
        </div>
        <div className="right-column">
          <nav className="panel-toggle-nav">
            <button onClick={() => togglePanel(PANEL_TYPES.UPGRADES)} className={activePanel === PANEL_TYPES.UPGRADES ? 'active-toggle' : ''}>Покращення</button>
            <button onClick={() => togglePanel(PANEL_TYPES.CASES)} className={activePanel === PANEL_TYPES.CASES ? 'active-toggle' : ''}>Кейси</button>
            <button onClick={() => togglePanel(PANEL_TYPES.PRESTIGE)} className={activePanel === PANEL_TYPES.PRESTIGE ? 'active-toggle' : ''}>Престиж</button>
            <button onClick={() => togglePanel(PANEL_TYPES.SKINS)} className={activePanel === PANEL_TYPES.SKINS ? 'active-toggle' : ''}>Скіни</button>
          </nav>
          <div className="panel-content">
            <AnimatePresence mode="wait">
              {activePanel && (
                <motion.div key={activePanel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="panel-header">
                    <h2 className="panel-title">
                      {activePanel === PANEL_TYPES.UPGRADES && 'Покращення'}
                      {activePanel === PANEL_TYPES.CASES && 'Магазин Кейсів'}
                      {activePanel === PANEL_TYPES.PRESTIGE && 'Система Престижу'}
                      {activePanel === PANEL_TYPES.SKINS && 'Вибір Скіна'}
                    </h2>
                    <button className="back-button" onClick={() => togglePanel(activePanel)}>
                      ← Назад до гри
                    </button>
                  </div>
                  
                  {activePanel === PANEL_TYPES.UPGRADES && (
                    <div>{upgradesList.map((u) => <UpgradeItem key={u.id} upgrade={u} level={upgrades[u.id] || 0} onPurchase={handlePurchaseUpgrade} credits={credits} canAfford={credits >= calculateUpgradeCost(u, upgrades[u.id] || 0) && (upgrades[u.id] || 0) < u.maxLevel} />)}</div>
                  )}
                  {activePanel === PANEL_TYPES.CASES && (
                    <div>{purchasableCases.map(c => <CaseItem key={c.id} caseInfo={c} onPurchase={handlePurchaseAndOpenCase} credits={credits} />)}</div>
                  )}
                  {activePanel === PANEL_TYPES.PRESTIGE && (
                    <div><PrestigeSystem creditsEarnedThisPrestige={0} currentCredits={credits} duiktcoins={0} onPrestige={()=>{}} /></div>
                  )}
                  {activePanel === PANEL_TYPES.SKINS && (
                     <div className={skinPanelStyles.skinsPanelContainer}>
                       <div className={skinPanelStyles.skinsList}>
                          {skinsList.map((s) => (
                            <SkinItem key={s.id} skin={s} isUnlocked={unlockedSkins.includes(s.id)} isActive={activeSkinId === s.id} canUnlock={!unlockedSkins.includes(s.id) && s.unlockType === 'CREDITS' && credits >= s.unlockValue} onSelect={handleSelectSkin} onUnlock={handleUnlockSkin} currentCredits={credits} currentDuiktcoins={0} />
                          ))}
                       </div>
                     </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <ToastManager notifications={notifications} dismissNotification={dismissNotification} />
    </div>
  );
}

export default App;