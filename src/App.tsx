import { useState, useEffect } from 'react';
import './index.css';
import { encrypt, decrypt } from './encryption';
import * as argon2 from 'argon2-browser';

// Define the electron object on the window
declare global {
  interface Window {
    electron: {
      store: {
        getEntries: () => Promise<any[]>;
        setEntries: (entries: any[]) => void;
        getVaults: () => Promise<string[]>;
        setVaults: (vaults: string[]) => void;
        getMasterHash: () => Promise<string | null>;
        setMasterHash: (hash: string) => void;
      };
    };
  }
}

function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [masterHash, setMasterHash] = useState<string | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<Uint8Array | null>(null);

  const [entries, setEntries] = useState([]);
  const [decryptedEntries, setDecryptedEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [vaults, setVaults] = useState(['Default']);
  const [selectedVault, setSelectedVault] = useState('Default');
  const [newVault, setNewVault] = useState('');

  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    window.electron.store.getMasterHash().then(setMasterHash);
  }, []);

  const handleUnlock = async () => {
    if (masterHash) {
      try {
        const key = await argon2.hash({
          pass: masterPassword,
          salt: 'somesalt', // In a real app, use a unique salt for each user
          time: 1,
          mem: 1024,
          hashLen: 32,
          parallelism: 1,
          type: argon2.ArgonType.Argon2id,
        });
        if (key.hashString === masterHash) {
          setEncryptionKey(key.hash);
          setIsLocked(false);
        } else {
          alert('Wrong password');
        }
      } catch (e) {
        console.error(e);
        alert('Error unlocking');
      }
    } else {
      // First time use, set master password
      try {
        const key = await argon2.hash({
          pass: masterPassword,
          salt: 'somesalt',
          time: 1,
          mem: 1024,
          hashLen: 32,
          parallelism: 1,
          type: argon2.ArgonType.Argon2id,
        });
        setMasterHash(key.hashString);
        window.electron.store.setMasterHash(key.hashString);
        setEncryptionKey(key.hash);
        setIsLocked(false);
      } catch (e) {
        console.error(e);
        alert('Error setting master password');
      }
    }
  };

  useEffect(() => {
    if (!isLocked) {
      window.electron.store.getEntries().then(setEntries);
      window.electron.store.getVaults().then(setVaults);
    }
  }, [isLocked]);

  useEffect(() => {
    if (!isLocked) {
      window.electron.store.setEntries(entries);
    }
  }, [entries, isLocked]);

  useEffect(() => {
    if (!isLocked) {
      window.electron.store.setVaults(vaults);
    }
  }, [vaults, isLocked]);

  const handleAddVault = () => {
    if (newVault && !vaults.includes(newVault)) {
      setVaults([...vaults, newVault]);
      setNewVault('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !encryptionKey) return;
    const encryptedPassword = await encrypt(password, encryptionKey);
    const encryptedNotes = await encrypt(notes, encryptionKey);
    const newEntry = { title, password: encryptedPassword, notes: encryptedNotes, vault: selectedVault };
    setEntries([...entries, newEntry]);
    setTitle('');
    setPassword('');
    setNotes('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingEntry || !encryptionKey) return;
    const encryptedPassword = await encrypt(editingEntry.password, encryptionKey);
    const encryptedNotes = await encrypt(editingEntry.notes, encryptionKey);
    const updatedEntry = { ...editingEntry, password: encryptedPassword, notes: encryptedNotes };
    const updatedEntries = entries.map((entry) =>
      entry.title === updatedEntry.title ? updatedEntry : entry
    );
    setEntries(updatedEntries);
    setEditingEntry(null);
  };

  const handleDelete = (entryToDelete) => {
    const updatedEntries = entries.filter((entry) => entry.title !== entryToDelete.title);
    setEntries(updatedEntries);
  };

  useEffect(() => {
    if (!encryptionKey) return;
    const decryptEntries = async () => {
      const decrypted = await Promise.all(
        entries
          .filter((entry) => entry.vault === selectedVault)
          .map(async (entry) => {
            const decryptedPassword = await decrypt(entry.password, encryptionKey);
            const decryptedNotes = await decrypt(entry.notes, encryptionKey);
            return { title: entry.title, password: decryptedPassword, notes: decryptedNotes, vault: entry.vault };
          })
      );
      setDecryptedEntries(decrypted);
    };
    decryptEntries();
  }, [entries, selectedVault, encryptionKey]);

  if (isLocked) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-screen">
        <div className="w-full max-w-xs">
          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Master Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="******************"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={handleUnlock}
              >
                {masterHash ? 'Unlock' : 'Set Master Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quantum Password Manager</h1>

      <div className="flex items-center mb-4">
        <label className="mr-2">Vault:</label>
        <select
          value={selectedVault}
          onChange={(e) => setSelectedVault(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {vaults.map((vault) => (
            <option key={vault} value={vault}>
              {vault}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newVault}
          onChange={(e) => setNewVault(e.target.value)}
          className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="New vault name"
        />
        <button
          onClick={handleAddVault}
          className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Vault
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Add New Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Entry
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Entries in {selectedVault}</h2>
          <div className="space-y-2">
            {decryptedEntries.map((entry, index) => (
              <div key={index} className="p-4 rounded-md border border-gray-200">
                <h3 className="font-semibold">{entry.title}</h3>
                <div className="flex items-center">
                  <p>Password: {showPassword ? entry.password : '********'}</p>
                  <button onClick={() => setShowPassword(!showPassword)} className="ml-2">
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(entry.password)}
                    className="ml-2"
                  >
                    Copy
                  </button>
                </div>
                <p>Notes: {entry.notes}</p>
                <button
                  onClick={() => setEditingEntry(entry)}
                  className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(entry)}
                  className="ml-2 mt-2 inline-flex justify-center rounded-md border border-transparent bg-red-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingEntry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Entry</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={editingEntry.title}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={editingEntry.password}
                  onChange={(e) => setEditingEntry({ ...editingEntry, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={editingEntry.notes}
                  onChange={(e) => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="items-center px-4 py-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingEntry(null)}
                  className="mt-2 px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
