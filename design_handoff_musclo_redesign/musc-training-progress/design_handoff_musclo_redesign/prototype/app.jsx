// App shell — host iPhone frame, screen routing, modals
const { useState } = React;

function App() {
  const [screen, setScreen] = useState('home');
  const [modal, setModal] = useState(null); // null | 'picker' | 'addFood' | { type:'detail', name } | { type:'meal', meal }

  function openExercise(name) { setModal({ type: 'detail', name }); }
  function openPicker() { setModal('picker'); }
  function openMeal(meal) { setModal({ type: 'meal', meal }); }
  function openAdd() { setModal('addFood'); }
  function closeModal() { setModal(null); }

  let inner;
  if (modal === 'picker') {
    inner = <ScreenPicker close={closeModal} onPick={() => closeModal()} />;
  } else if (modal === 'addFood') {
    inner = <ScreenAddFood close={closeModal} />;
  } else if (modal && modal.type === 'detail') {
    inner = <ScreenExerciseDetail name={modal.name} close={closeModal} />;
  } else if (modal && modal.type === 'meal') {
    inner = <ScreenMealDetail meal={modal.meal} close={closeModal} />;
  } else if (screen === 'home')      inner = <ScreenHome go={setScreen} />;
  else if (screen === 'session')     inner = <ScreenSession go={setScreen} openExercise={openExercise} openPicker={openPicker} />;
  else if (screen === 'progress')    inner = <ScreenProgress go={setScreen} />;
  else if (screen === 'nutrition')   inner = <ScreenNutrition openMeal={openMeal} openAdd={openAdd} />;

  // hide bottom nav while in modals
  const showNav = !modal;

  return (
    <IOSDevice dark>
      <div data-screen-label={`${screen}`} style={{
        position: 'absolute', inset: 0, background: '#0a0a0b', overflow: 'hidden',
        paddingTop: 54,
      }}>
        {inner}
        {showNav && <BottomNav screen={screen} setScreen={setScreen} />}
      </div>
    </IOSDevice>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
