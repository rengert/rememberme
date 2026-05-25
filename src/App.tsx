import './App.css';
import { AddItem } from './components/AddItem';
import { RememberList } from './components/RememberList';
import { useRememberMe } from './hooks/useRememberMe';

function App() {
  const { items, filter, setFilter, addItem, toggleItem, deleteItem, clearDone, activeCount, doneCount } =
    useRememberMe();

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">Remember Me</h1>
        <p className="app-subtitle">Things you want to remember</p>
      </header>
      <div className="app-content">
        <AddItem onAdd={addItem} />
        <RememberList
          items={items}
          filter={filter}
          activeCount={activeCount}
          doneCount={doneCount}
          onToggle={toggleItem}
          onDelete={deleteItem}
          onFilterChange={setFilter}
          onClearDone={clearDone}
        />
      </div>
    </main>
  );
}

export default App;
