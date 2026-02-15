# Quantum Password Manager

A secure, Electron-based password manager with Post-Quantum Encryption.

## Features

- **Post-Quantum Encryption:** Using CRYSTALS-Kyber for key encapsulation and AES-256-GCM for symmetric encryption, provided by the `@skairipaapps/pqc-encryption` library.
- **Secure Data Storage:** Encrypted data is stored locally on your machine using `electron-store`.
- **Master Password:** The application is protected by a master password. The encryption key is derived from the master password using Argon2.
- **Vault Functionality:** Organize your passwords and notes into different vaults.
- **Core Features:** Add, edit, and delete entries.
- **Clipboard Integration:** Copy passwords to the clipboard.
- **Password Visibility:** Toggle the visibility of passwords.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)

### Installation and Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/quantum-password-manager.git
    cd quantum-password-manager
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application in development mode:**
    ```bash
    npm run dev
    ```

## Technologies Used

- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [@skairipaapps/pqc-encryption](https://www.npmjs.com/package/@skairipaapps/pqc-encryption) for Post-Quantum Cryptography.
- [argon2-browser](https://www.npmjs.com/package/argon2-browser) for key derivation.
- [electron-store](https://www.npmjs.com/package/electron-store) for data persistence.

## Limitations and Future Improvements

This application is a prototype and has some limitations:

- **Salt:** A hardcoded salt is used for key derivation. In a production environment, a unique salt should be generated for each user and stored with the hash.
- **Error Handling:** The error handling is minimal.
- **UI/UX:** The user interface is basic and can be improved.

Future improvements could include:
- Generating a unique salt for each user.
- Adding more robust error handling.
- Improving the UI/UX with features like search, filtering, and a more polished design.
- Adding support for importing and exporting data.
- Adding automatic updates.
- Building and packaging the application for different platforms.
