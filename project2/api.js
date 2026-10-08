const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadButton = document.getElementById("load-btn");
const status = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitButton = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");

let notes = [];

function setStatus(message, type = "") {
  status.textContent = message;
  status.className = `status ${type}`.trim();
}

async function request(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

function renderNotes() {
  notesList.innerHTML = "";

  if (notes.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = "No notes available.";
    notesList.appendChild(emptyMessage);
    return;
  }

  notes.forEach((note) => {
    const listItem = document.createElement("li");
    listItem.className = "note-card";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const body = document.createElement("p");
    body.textContent = note.body || "No note body.";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", () => {
      deleteNote(note.id, deleteButton);
    });

    listItem.appendChild(title);
    listItem.appendChild(body);
    listItem.appendChild(deleteButton);

    notesList.appendChild(listItem);
  });
}

async function loadNotes() {
  loadButton.disabled = true;
  setStatus("Loading notes...", "loading");

  try {
    notes = await request(`${API_URL}?_limit=10`);
    renderNotes();

    if (notes.length === 0) {
      setStatus("No notes were returned by the server.", "success");
    } else {
      setStatus(
        `Loaded ${notes.length} notes from the server.`,
        "success"
      );
    }
  } catch (error) {
    setStatus(
      "Unable to load notes. Please try again.",
      "error"
    );
    console.error("GET /posts failed:", error);
  } finally {
    loadButton.disabled = false;
  }
}

async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title) {
    setStatus("A title is required.", "error");
    titleInput.focus();
    return;
  }

  if (title.length > 100) {
    setStatus(
      "The title must be 100 characters or fewer.",
      "error"
    );
    titleInput.focus();
    return;
  }

  submitButton.disabled = true;
  setStatus("Creating note...", "loading");

  try {
    const newNote = await request(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        userId: 1
      })
    });

    notes.unshift(newNote);
    renderNotes();

    setStatus(
      `Note created (status 201, id ${newNote.id}).`,
      "success"
    );

    noteForm.reset();
  } catch (error) {
    setStatus(
      "Unable to create the note. Please try again.",
      "error"
    );
    console.error("POST /posts failed:", error);
  } finally {
    submitButton.disabled = false;
  }
}

async function deleteNote(id, deleteButton) {
  deleteButton.disabled = true;
  setStatus("Deleting note...", "loading");

  try {
    await request(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    /*
      JSONPlaceholder simulates DELETE requests but does not
      permanently remove data from its server. We therefore
      remove the note from our local array and UI so the
      client behaves correctly for this practice project.
    */
    notes = notes.filter((note) => note.id !== id);
    renderNotes();

    setStatus(`Note ${id} deleted successfully.`, "success");
  } catch (error) {
    setStatus(
      "Unable to delete the note. Please try again.",
      "error"
    );
    console.error("DELETE /posts/:id failed:", error);
  } finally {
    deleteButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);

renderNotes();
