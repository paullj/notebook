class User {
  name = $state("")
  color: string | null = $state(null)

  constructor(name: string, color: string | null = null) {
    this.name = name;
    if (color === null) {
      this.color = COLORS[Math.floor(Math.random() * 4)]
    } else {
      this.color = color;
    }
  }
}

const NAMES = ["Alice", "Bob", "Charlie", "Dave"] as const;
const COLORS = [
  "#fda4af",
  "#f0abfc",
  "#d8b4fe",
  "#818cf8",
  "#7dd3fc",
  "#99f6e4",
  "#86efac",
  "#fef08a",
  "#fdba74",
  "#fca5a5"
] as const;

const me = new User(NAMES[Math.floor(Math.random() * 4)]);

export { me, User };
