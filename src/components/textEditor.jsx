import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./texteditor.css";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { throttle } from "lodash";

const TextEditor = () => {
  const quillRef = useRef(null); // Reference to Quill editor
  const isLocalChange = useRef(false); // Tracks if changes are local
  const documentRef = doc(db, "documents", "sample-doc"); // Firestore document reference
  const [isEditing, setIsEditing] = useState(false); // Tracks if editor is actively being edited

  // Function to save content to Firestore, throttled to prevent frequent writes
  const saveContent = throttle(() => {
    if (quillRef.current && isLocalChange.current) {
      const content = quillRef.current.getEditor().getContents(); // Get current content
      console.log("Saving content to Firestore:", content);

      setDoc(documentRef, { content: content.ops }, { merge: true })
        .then(() => console.log("Content saved successfully"))
        .catch((error) => console.error("Error saving content:", error));

      isLocalChange.current = false; // Reset local change flag
    }
  }, 1000); // Throttle interval: 1 second

  // Function to load initial content from Firestore
  const loadContent = async () => {
    try {
      const docSnap = await getDoc(documentRef);
      if (docSnap.exists()) {
        const savedContent = docSnap.data().content;
        if (savedContent) {
          quillRef.current.getEditor().setContents(savedContent); // Set content in editor
        }
      } else {
        console.log("No document found, starting with an empty editor.");
      }
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };

  // Function to handle real-time Firestore updates
  const handleRealtimeUpdates = () => {
    return onSnapshot(documentRef, (snapshot) => {
      if (snapshot.exists()) {
        const newContent = snapshot.data().content;

        if (!isEditing) {
          const editor = quillRef.current.getEditor();
          const currentCursorPosition = editor.getSelection()?.index || 0; // Get cursor position

          // Update content silently to avoid triggering `text-change`
          editor.setContents(newContent, "silent");

          // Restore cursor position
          editor.setSelection(currentCursorPosition);
        }
      }
    });
  };

  // Effect to initialize editor, load content, and set up listeners
  useEffect(() => {
    if (quillRef.current) {
      // Load initial content
      loadContent();

      // Listen for real-time Firestore updates
      const unsubscribe = handleRealtimeUpdates();

      // Set up local text-change listener
      const editor = quillRef.current.getEditor();
      const handleTextChange = (delta, oldDelta, source) => {
        if (source === "user") {
          isLocalChange.current = true; // Mark change as local
          setIsEditing(true);
          saveContent();

          // Reset editing state after 5 seconds of inactivity
          setTimeout(() => setIsEditing(false), 5000);
        }
      };
      editor.on("text-change", handleTextChange);

      // Cleanup on component unmount
      return () => {
        unsubscribe(); // Stop listening to Firestore updates
        editor.off("text-change", handleTextChange); // Remove local listener
      };
    }
  }, []); // Empty dependency array ensures this runs once

  return (
    <div className="text-editor-container">
      <ReactQuill
        ref={quillRef}
        className="text-editor"
        placeholder="Start typing..."
      />
      {isEditing && <div className="status">Saving...</div>}
    </div>
  );
};

export default TextEditor;
