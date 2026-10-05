import { useEffect, useRef, useState } from 'react';
import { MAX_ACCOUNTS, type WhiteoutAccount } from '../../hooks/useWhiteoutInventory';
import classes from './WhiteoutCalculator.module.css';

interface AccountSwitcherProps {
  accounts: WhiteoutAccount[];
  activeId: string;
  canAdd: boolean;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

/**
 * Quick swap between saved accounts.
 *
 * Players who run alts keep a separate stock on each, and the whole calculator
 * reads from one inventory, so switching account has to swap the lot at once.
 * Each account is its own tab; the active one can be renamed in place by
 * clicking its name, which avoids a settings panel for what is a single field.
 */
export const AccountSwitcher = ({
  accounts,
  activeId,
  canAdd,
  onSelect,
  onAdd,
  onRename,
  onRemove,
}: AccountSwitcherProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirming, setConfirming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  // Switching account drops a half-pressed delete, so the confirm never carries
  // over to a different account than the one it was aimed at.
  useEffect(() => setConfirming(false), [activeId]);

  const active = accounts.find(a => a.id === activeId) ?? accounts[0];

  const commit = () => {
    onRename(active.id, draft);
    setEditing(false);
  };

  return (
    <section className={classes.accounts} aria-label="Account">
      <span className={classes.accountsLabel}>Account</span>

      <div className={classes.accountTabs}>
        {accounts.map(account =>
          account.id === activeId && editing ? (
            <input
              key={account.id}
              ref={inputRef}
              className={classes.accountRename}
              value={draft}
              maxLength={24}
              autoComplete="off"
              aria-label="Account name"
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={e => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setEditing(false);
              }}
            />
          ) : (
            <button
              key={account.id}
              type="button"
              className={`${classes.accountTab} ${
                account.id === activeId ? classes.accountTabActive : ''
              }`}
              title={
                account.id === activeId ? 'Click again to rename' : `Switch to ${account.name}`
              }
              onClick={() => {
                if (account.id !== activeId) {
                  onSelect(account.id);
                  return;
                }
                setDraft(account.name);
                setEditing(true);
              }}
            >
              {account.name}
            </button>
          )
        )}

        {canAdd && (
          <button
            type="button"
            className={classes.accountAdd}
            title={`Add an account, up to ${MAX_ACCOUNTS}`}
            onClick={() => onAdd(`Account ${accounts.length + 1}`)}
          >
            + Add
          </button>
        )}
      </div>

      {accounts.length > 1 && (
        <button
          type="button"
          className={`${classes.accountRemove} ${confirming ? classes.accountRemoveArmed : ''}`}
          title={`Delete ${active.name} and everything saved on it`}
          onClick={() => {
            // Two presses, because this throws away an entire saved inventory.
            if (!confirming) {
              setConfirming(true);
              return;
            }
            onRemove(active.id);
            setConfirming(false);
          }}
          onBlur={() => setConfirming(false)}
        >
          {confirming ? `Really delete ${active.name}?` : `Delete ${active.name}`}
        </button>
      )}
    </section>
  );
};
