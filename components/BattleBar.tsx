export default function BattleBar(args: any) {
  let red = parseFloat(args.red);
  let blue = parseFloat(args.blue);
  let total = red + blue;
  let redness = (red * 100) / total;
  let blueness = (blue * 100) / total;

  return (
    <div
      className="Widget"
      style={{
        background: "black",
        width: "100%",
        position: "relative",
      }}
    >
      <div
        style={{
          background: "#f06060",
          position: "absolute",
          left: "0px",
          width: `${redness}%`,
          display: "inline-block",
          overflow: "hidden",
          color: "white",
        }}
      >
        {red}
      </div>
      <div
        style={{
          background: "#6060f0",
          position: "absolute",
          left: `${redness}%`,
          width: `${blueness}%`,
          display: "inline-block",
          overflow: "hidden",
          color: "white",
          direction: "rtl",
        }}
      >
        <div>{blue}</div>
      </div>
    </div>
  );
}
