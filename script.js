const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

const assetForm = document.getElementById("assetForm");
const userForm = document.getElementById("userForm");

const assetList = document.getElementById("assetList");
const userList = document.getElementById("userList");
const dashboardAssets = document.getElementById("dashboardAssets");

const assetSearch = document.getElementById("assetSearch");
const userSearch = document.getElementById("userSearch");
const assignedTo = document.getElementById("assignedTo");

let users = JSON.parse(localStorage.getItem("users")) || [
  {
    id: 1,
    name: "Alex Morgan",
    email: "alex.morgan@company.com",
    role: "Employee",
    department: "HR"
  },
  {
    id: 2,
    name: "Jamie Chen",
    email: "jamie.chen@company.com",
    role: "Linux Admin",
    department: "IT"
  },
  {
    id: 3,
    name: "Taylor Smith",
    email: "taylor.smith@company.com",
    role: "IT Support",
    department: "Service Desk"
  }
];

let assets = JSON.parse(localStorage.getItem("assets")) || [
  {
    id: 1,
    name: "Dell Latitude 5440",
    serial: "DL-5440-001",
    type: "Laptop",
    status: "Assigned",
    location: "Office A",
    assignedTo: 2
  },
  {
    id: 2,
    name: "HP EliteDisplay E24",
    serial: "HP-E24-104",
    type: "Monitor",
    status: "Available",
    location: "Storage Room",
    assignedTo: ""
  },
  {
    id: 3,
    name: "Ubuntu Server Node",
    serial: "SRV-LNX-009",
    type: "Server",
    status: "Assigned",
    location: "Server Room",
    assignedTo: 2
  }
];

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
  });
});

assetForm.addEventListener("submit", event => {
  event.preventDefault();

  const newAsset = {
    id: Date.now(),
    name: document.getElementById("assetName").value,
    serial: document.getElementById("serialNumber").value,
    type: document.getElementById("assetType").value,
    status: document.getElementById("assetStatus").value,
    location: document.getElementById("assetLocation").value,
    assignedTo: assignedTo.value ? Number(assignedTo.value) : ""
  };

  if (newAsset.assignedTo) {
    newAsset.status = "Assigned";
  }

  assets.push(newAsset);
  saveData();
  assetForm.reset();
  renderAll();
});

userForm.addEventListener("submit", event => {
  event.preventDefault();

  const newUser = {
    id: Date.now(),
    name: document.getElementById("userName").value,
    email: document.getElementById("userEmail").value,
    role: document.getElementById("userRole").value,
    department: document.getElementById("userDepartment").value
  };

  users.push(newUser);
  saveData();
  userForm.reset();
  renderAll();
});

assetSearch.addEventListener("input", renderAssets);
userSearch.addEventListener("input", renderUsers);

function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("assets", JSON.stringify(assets));
}

function getUserName(userId) {
  const user = users.find(user => user.id === Number(userId));
  return user ? user.name : "Not assigned";
}

function renderUserOptions() {
  assignedTo.innerHTML = `<option value="">Not assigned</option>`;

  users.forEach(user => {
    assignedTo.innerHTML += `
      <option value="${user.id}">${user.name} - ${user.role}</option>
    `;
  });
}

function renderAssets() {
  const searchValue = assetSearch.value.toLowerCase();

  const filteredAssets = assets.filter(asset => {
    return (
      asset.name.toLowerCase().includes(searchValue) ||
      asset.serial.toLowerCase().includes(searchValue) ||
      asset.type.toLowerCase().includes(searchValue) ||
      asset.status.toLowerCase().includes(searchValue) ||
      asset.location.toLowerCase().includes(searchValue) ||
      getUserName(asset.assignedTo).toLowerCase().includes(searchValue)
    );
  });

  assetList.innerHTML = "";

  if (filteredAssets.length === 0) {
    assetList.innerHTML = `<div class="empty">No assets found.</div>`;
    return;
  }

  filteredAssets.forEach(asset => {
    const card = document.createElement("div");
    card.className = "asset-card";

    card.innerHTML = `
      <div class="card-top">
        <div>
          <h3>${asset.name}</h3>
          <small>Serial: ${asset.serial}</small>
        </div>
      </div>

      <div class="badges">
        <span class="badge ${asset.status}">${asset.status}</span>
        <span class="badge">${asset.type}</span>
      </div>

      <p><strong>Location:</strong> ${asset.location}</p>
      <p><strong>Assigned to:</strong> ${getUserName(asset.assignedTo)}</p>

      <div class="actions">
        <button onclick="changeAssetStatus(${asset.id}, 'Available')">Available</button>
        <button onclick="changeAssetStatus(${asset.id}, 'Repair')">Repair</button>
        <button onclick="changeAssetStatus(${asset.id}, 'Retired')">Retired</button>
        <button class="delete-btn" onclick="deleteAsset(${asset.id})">Delete</button>
      </div>
    `;

    assetList.appendChild(card);
  });
}

function renderUsers() {
  const searchValue = userSearch.value.toLowerCase();

  const filteredUsers = users.filter(user => {
    return (
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue) ||
      user.role.toLowerCase().includes(searchValue) ||
      user.department.toLowerCase().includes(searchValue)
    );
  });

  userList.innerHTML = "";

  if (filteredUsers.length === 0) {
    userList.innerHTML = `<div class="empty">No users found.</div>`;
    return;
  }

  filteredUsers.forEach(user => {
    const userAssets = assets.filter(asset => asset.assignedTo === user.id);

    const card = document.createElement("div");
    card.className = "user-card";

    card.innerHTML = `
      <div class="card-top">
        <div>
          <h3>${user.name}</h3>
          <small>${user.email}</small>
        </div>
      </div>

      <div class="badges">
        <span class="badge role">${user.role}</span>
        <span class="badge">${user.department}</span>
      </div>

      <p><strong>Assigned assets:</strong> ${userAssets.length}</p>

      <div class="actions">
        <button onclick="promoteUser(${user.id}, 'IT Support')">IT Support</button>
        <button onclick="promoteUser(${user.id}, 'Linux Admin')">Linux Admin</button>
        <button onclick="promoteUser(${user.id}, 'Windows Admin')">Windows Admin</button>
        <button onclick="promoteUser(${user.id}, 'Network Admin')">Network Admin</button>
        <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
      </div>
    `;

    userList.appendChild(card);
  });
}

function renderDashboard() {
  document.getElementById("totalAssets").textContent = assets.length;
  document.getElementById("availableAssets").textContent =
    assets.filter(asset => asset.status === "Available").length;
  document.getElementById("assignedAssets").textContent =
    assets.filter(asset => asset.status === "Assigned").length;
  document.getElementById("totalUsers").textContent = users.length;

  dashboardAssets.innerHTML = "";

  if (assets.length === 0) {
    dashboardAssets.innerHTML = `<div class="empty">No equipment added yet.</div>`;
    return;
  }

  assets.forEach(asset => {
    dashboardAssets.innerHTML += `
      <div class="mini-item">
        <strong>${asset.name}</strong> | ${asset.type} | ${asset.status} | ${getUserName(asset.assignedTo)}
      </div>
    `;
  });
}

function changeAssetStatus(id, status) {
  assets = assets.map(asset => {
    if (asset.id === id) {
      return {
        ...asset,
        status,
        assignedTo: status === "Available" ? "" : asset.assignedTo
      };
    }

    return asset;
  });

  saveData();
  renderAll();
}

function promoteUser(id, role) {
  users = users.map(user => {
    if (user.id === id) {
      return {
        ...user,
        role
      };
    }

    return user;
  });

  saveData();
  renderAll();
}

function deleteAsset(id) {
  assets = assets.filter(asset => asset.id !== id);
  saveData();
  renderAll();
}

function deleteUser(id) {
  assets = assets.map(asset => {
    if (asset.assignedTo === id) {
      return {
        ...asset,
        assignedTo: "",
        status: "Available"
      };
    }

    return asset;
  });

  users = users.filter(user => user.id !== id);

  saveData();
  renderAll();
}

function renderAll() {
  renderUserOptions();
  renderAssets();
  renderUsers();
  renderDashboard();
}

renderAll();