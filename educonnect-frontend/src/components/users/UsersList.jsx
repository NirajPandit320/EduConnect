function generateRandomUsers(count = 20) {
  const firstNames = [
    "Alex", "Jordan", "Taylor", "Sam", "Chris",
    "Morgan", "Jamie", "Casey", "Riley", "Avery",
  ];

  const lastNames = [
    "Smith", "Johnson", "Brown", "Williams", "Jones",
    "Garcia", "Miller", "Davis", "Martinez", "Wilson",
  ];

  return Array.from({ length: count }, (_, index) => {
    const firstName =
      firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName =
      lastNames[Math.floor(Math.random() * lastNames.length)];

    return {
      id: index + 1,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(
        Math.random() * 1000
      )}@example.com`,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(
        Math.random() * 70
      )}`,
    };
  });
}

const UsersList = () => {
  const users = generateRandomUsers();
  return (
    <div className="users-list">
      {users.map((user) => (
        <div key={user.id} className="user-item">
          <img src={user.avatar} alt={user.name} className="avatar" />
          <div className="user-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
          <div className="user-actions">
            <button className="icon">M</button>
            <button className="icon">D</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersList;