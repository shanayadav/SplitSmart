const groupForm = document.querySelector("#group-form");
const groupList = document.querySelector("#group-list");
const groupMessage = document.querySelector("#group-message");

function showGroupMessage(text, type) {
  groupMessage.textContent = text;
  groupMessage.className = `message show ${type}`;
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

async function loadGroups() {
  try {
    const groups = await getGroups();

    groupList.innerHTML = groups.length ? groups.map(group => `
      <article class="card group-card">
        <h2>${escapeHtml(group.name)}</h2>
        <p class="member-list">${group.members.map(escapeHtml).join(", ")}</p>
        <p class="group-total">${group.members.length} members</p>
      </article>
    `).join("") : '<p class="muted">No groups have been created.</p>';
  } catch (error) {
    groupList.innerHTML = '<p class="negative">Start the Node server to load groups.</p>';
  }
}

groupForm.addEventListener("submit", async event => {
  event.preventDefault();

  const formData = new FormData(groupForm);
  const members = String(formData.get("members"))
    .split(",")
    .map(member => member.trim())
    .filter(Boolean);

  try {
    const savedGroup = await addGroup({
      name: formData.get("name"),
      members
    });

    groupForm.reset();
    showGroupMessage(`${savedGroup.name} was created successfully.`, "success");
    await loadGroups();
  } catch (error) {
    showGroupMessage(error.message, "error");
  }
});

loadGroups();
