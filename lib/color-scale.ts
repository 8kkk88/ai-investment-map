export function getReturnTileStyle(returnPct: number) {
  if (returnPct >= 5) {
    return {
      background: "linear-gradient(135deg, #16a34a 0%, #047857 100%)",
      borderColor: "rgba(134, 239, 172, 0.65)"
    };
  }

  if (returnPct > 0) {
    return {
      background: "linear-gradient(135deg, #14532d 0%, #064e3b 100%)",
      borderColor: "rgba(74, 222, 128, 0.38)"
    };
  }

  if (returnPct === 0) {
    return {
      background: "linear-gradient(135deg, #334155 0%, #1f2937 100%)",
      borderColor: "rgba(148, 163, 184, 0.32)"
    };
  }

  if (returnPct > -5) {
    return {
      background: "linear-gradient(135deg, #7f1d1d 0%, #581c1c 100%)",
      borderColor: "rgba(248, 113, 113, 0.38)"
    };
  }

  return {
    background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    borderColor: "rgba(252, 165, 165, 0.65)"
  };
}

export const legendItems = [
  { label: "+5% or more", value: 6 },
  { label: "0% to +5%", value: 2 },
  { label: "0%", value: 0 },
  { label: "0% to -5%", value: -2 },
  { label: "-5% or less", value: -6 }
];
