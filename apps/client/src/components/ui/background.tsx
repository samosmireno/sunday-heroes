export default function Background() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{
        backgroundImage:
          "linear-gradient(45deg, rgba(0,0,0,0.2) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2) 75%, transparent 75%, transparent)",
        backgroundSize: "10px 10px",
      }}
    ></div>
  );
}
