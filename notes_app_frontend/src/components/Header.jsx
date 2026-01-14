import React from "react";

// PUBLIC_INTERFACE
export default function Header({ onAddNote }) {
  /** Application header containing the app title and primary action. */
  return (
    <header className="Header" role="banner">
      <div className="Header__left">
        <h1 className="Header__title">Notes</h1>
        <p className="Header__subtitle">Lightweight, local-first notes.</p>
      </div>

      <div className="Header__right">
        <button className="Button Button--primary" type="button" onClick={onAddNote}>
          Add Note
        </button>
      </div>
    </header>
  );
}
