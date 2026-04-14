const StatCard = ({ title, value }) => {
  return (
    <div style={{
      padding: "20px",
      borderRadius: "12px",
      background: "#f3f4f6",
      width: "200px",
      textAlign: "center"
    }}>
      <h3>{title}</h3>
      <h2>{value}</h2>
    </div>
  );
};

export default StatCard;