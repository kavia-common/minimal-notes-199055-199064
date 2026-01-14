import React, { useEffect, useMemo, useRef, useState } from "react";

// PUBLIC_INTERFACE
export default function Editor({
  note,
  onSave,
  onCancel,
  onDelete,
  canDelete = true,
}) {
  /** Editor panel for a selected note; supports keyboard shortcuts and controlled inputs. */

  const [draftTitle, setDraftTitle] = useState(note?.title || "");
  const [draftContent, setDraftContent] = useState(note?.content || "");

  const titleRef = useRef(null);
  const contentRef = useRef(null);

  // Reset drafts when switching notes
  useEffect(() => {
    setDraftTitle(note?.title || "");
    setDraftContent(note?.content || "");
  }, [note?.id]); // only when note identity changes

  // Focus management when a note becomes available
  useEffect(() => {
    if (!note) return;
    // Prefer focusing title for quick rename.
    titleRef.current?.focus();
  }, [note?.id]);

  const isDirty = useMemo(() => {
    if (!note) return false;
    return (draftTitle || "") !== (note.title || "") || (draftContent || "") !== (note.content || "");
  }, [note, draftTitle, draftContent]);

  const handleSave = () => {
    if (!note) return;
    onSave({
      ...note,
      title: draftTitle,
      content: draftContent,
      updatedAt: Date.now(),
    });
  };

  const handleCancel = () => {
    if (!note) return;
    setDraftTitle(note.title || "");
    setDraftContent(note.content || "");
    onCancel?.();
  };

  const handleKeyDown = (e) => {
    // Esc cancels edits (revert draft)
    if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
      return;
    }

    // Cmd/Ctrl+S saves
    const isSaveCombo = (e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S");
    if (isSaveCombo) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!note) {
    return (
      <section className="Editor" aria-label="Note editor">
        <div className="Editor__empty" role="status" aria-live="polite">
          <div className="Editor__emptyTitle">Select a note</div>
          <div className="Editor__emptyText">Choose a note from the list, or add a new one.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="Editor" aria-label="Note editor" onKeyDown={handleKeyDown}>
      <div className="Editor__header">
        <div className="Editor__headerLeft">
          <h2 className="Editor__title">Editor</h2>
          <div className="Editor__hint">
            <kbd className="Kbd">Ctrl</kbd>/<kbd className="Kbd">Cmd</kbd>+<kbd className="Kbd">S</kbd>{" "}
            to save · <kbd className="Kbd">Esc</kbd> to cancel
          </div>
        </div>

        <div className="Editor__actions">
          {canDelete ? (
            <button
              className="Button Button--danger"
              type="button"
              onClick={() => onDelete(note.id)}
            >
              Delete
            </button>
          ) : null}

          <button
            className="Button Button--secondary"
            type="button"
            onClick={handleCancel}
            disabled={!isDirty}
          >
            Cancel
          </button>

          <button
            className="Button Button--success"
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
          >
            Save
          </button>
        </div>
      </div>

      <div className="Editor__body">
        <label className="Field">
          <span className="Field__label">Title</span>
          <input
            ref={titleRef}
            className="Input"
            type="text"
            value={draftTitle}
            placeholder="Untitled"
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={(e) => {
              // Enter in title saves and moves focus to content
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
                contentRef.current?.focus();
              }
            }}
          />
        </label>

        <label className="Field Field--grow">
          <span className="Field__label">Content</span>
          <textarea
            ref={contentRef}
            className="Textarea"
            value={draftContent}
            placeholder="Write your note..."
            onChange={(e) => setDraftContent(e.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
