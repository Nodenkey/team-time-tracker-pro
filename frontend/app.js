(function () {
  const API_BASE_URL = window.API_BASE_URL || "http://localhost:8000";

  const form = document.getElementById("timeEntryForm");
  const userNameInput = document.getElementById("userName");
  const dateInput = document.getElementById("date");
  const activityInput = document.getElementById("activityDescription");
  const hoursInput = document.getElementById("hours");
  const statusEl = document.getElementById("status");
  const entriesTbody = document.getElementById("entries");
  const submitButton = document.getElementById("submitButton");
  const cancelEditButton = document.getElementById("cancelEditButton");

  let currentEditId = null;
  let entriesCache = [];

  function setStatus(message, type = "info") {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.className = "status";
    if (message) {
      statusEl.classList.add(`status--${type}`);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  }

  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return "";
    try {
      const d = new Date(dateTimeStr);
      if (Number.isNaN(d.getTime())) return dateTimeStr;
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch {
      return dateTimeStr;
    }
  }

  function validateForm() {
    const name = userNameInput.value.trim();
    const date = dateInput.value;
    const activity = activityInput.value.trim();
    const hours = parseFloat(hoursInput.value);

    if (!name) {
      return "Name is required.";
    }
    if (!date) {
      return "Date is required.";
    }
    if (!activity) {
      return "Activity description is required.";
    }
    if (Number.isNaN(hours) || hours <= 0) {
      return "Hours must be greater than 0.";
    }
    return null;
  }

  function getPayloadFromForm() {
    return {
      userName: userNameInput.value.trim(),
      date: dateInput.value,
      activityDescription: activityInput.value.trim(),
      hours: parseFloat(hoursInput.value),
    };
  }

  function resetForm() {
    form.reset();
    currentEditId = null;
    submitButton.textContent = "Add Entry";
    cancelEditButton.hidden = true;
  }

  async function handleResponse(response) {
    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      const message =
        (data && (data.detail || data.message || data.error)) ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data;
  }

  async function loadEntries() {
    if (!entriesTbody) return;
    entriesTbody.innerHTML =
      '<tr><td colspan="6" class="empty">Loading entries...</td></tr>';
    setStatus("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/time-entries`);
      const data = await handleResponse(response);
      entriesCache = Array.isArray(data) ? data : [];
      renderEntries();
    } catch (error) {
      console.error("Failed to load entries", error);
      entriesTbody.innerHTML =
        '<tr><td colspan="6" class="empty">Failed to load entries.</td></tr>';
      setStatus(error.message || "Failed to load entries.", "error");
    }
  }

  function renderEntries() {
    if (!entriesTbody) return;

    if (!entriesCache.length) {
      entriesTbody.innerHTML =
        '<tr><td colspan="6" class="empty">No entries yet. Add your first entry above.</td></tr>';
      return;
    }

    const rowsHtml = entriesCache
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((entry) => {
        const safeActivity = (entry.activityDescription || "").replace(
          /</g,
          "&lt;"
        );
        const safeName = (entry.userName || "").replace(/</g, "&lt;");
        return `
          <tr data-id="${entry.id}">
            <td>${safeName}</td>
            <td>${formatDate(entry.date)}</td>
            <td>${safeActivity}</td>
            <td><span class="badge">${entry.hours}</span></td>
            <td>${formatDateTime(entry.updatedAt || entry.createdAt)}</td>
            <td class="actions">
              <button type="button" class="secondary js-edit">Edit</button>
              <button type="button" class="danger js-delete">Delete</button>
            </td>
          </tr>
        `;
      })
      .join("");

    entriesTbody.innerHTML = rowsHtml;
  }

  async function createEntry(event) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setStatus("Creating entry...", "info");
    submitButton.disabled = true;

    try {
      const payload = getPayloadFromForm();
      const response = await fetch(`${API_BASE_URL}/api/time-entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await handleResponse(response);
      resetForm();
      await loadEntries();
      setStatus("Entry created successfully.", "success");
    } catch (error) {
      console.error("Failed to create entry", error);
      setStatus(error.message || "Failed to create entry.", "error");
    } finally {
      submitButton.disabled = false;
    }
  }

  async function updateEntry(id) {
    const validationError = validateForm();
    if (validationError) {
      setStatus(validationError, "error");
      return;
    }

    setStatus("Updating entry...", "info");
    submitButton.disabled = true;

    try {
      const payload = getPayloadFromForm();
      const response = await fetch(`${API_BASE_URL}/api/time-entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await handleResponse(response);
      resetForm();
      await loadEntries();
      setStatus("Entry updated successfully.", "success");
    } catch (error) {
      console.error("Failed to update entry", error);
      setStatus(error.message || "Failed to update entry.", "error");
    } finally {
      submitButton.disabled = false;
    }
  }

  async function deleteEntry(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this entry? This cannot be undone."
    );
    if (!confirmed) return;

    setStatus("Deleting entry...", "info");

    try {
      const response = await fetch(`${API_BASE_URL}/api/time-entries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        await handleResponse(response);
      }

      await loadEntries();
      setStatus("Entry deleted.", "success");
    } catch (error) {
      console.error("Failed to delete entry", error);
      setStatus(error.message || "Failed to delete entry.", "error");
    }
  }

  function startEditEntry(id) {
    const entry = entriesCache.find((e) => e.id === id);
    if (!entry) return;

    currentEditId = id;
    userNameInput.value = entry.userName || "";
    dateInput.value = entry.date || "";
    activityInput.value = entry.activityDescription || "";
    hoursInput.value = entry.hours != null ? String(entry.hours) : "";

    submitButton.textContent = "Update Entry";
    cancelEditButton.hidden = false;
    setStatus("Editing entry. Make your changes and click Update Entry.", "info");

    userNameInput.focus();
  }

  function onTableClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const row = target.closest("tr[data-id]");
    if (!row) return;
    const id = row.getAttribute("data-id");
    if (!id) return;

    if (target.classList.contains("js-edit")) {
      startEditEntry(id);
    } else if (target.classList.contains("js-delete")) {
      deleteEntry(id);
    }
  }

  function onSubmit(event) {
    if (currentEditId) {
      event.preventDefault();
      updateEntry(currentEditId);
    } else {
      createEntry(event);
    }
  }

  function init() {
    if (!form || !entriesTbody) {
      console.error("Time Tracker PRO frontend: required elements not found.");
      return;
    }

    form.addEventListener("submit", onSubmit);
    entriesTbody.addEventListener("click", onTableClick);
    cancelEditButton.addEventListener("click", () => {
      resetForm();
      setStatus("Edit cancelled.");
    });

    loadEntries();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
