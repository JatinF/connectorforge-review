export type RoleChoice = {
  id: string;
  person: string;
  organization: string;
  role: string;
  summary: string;
};

export const ROLE_CHOICES: RoleChoice[] = [
  {
    id: "publisher",
    person: "Casey",
    organization: "SYN-ORG-NORTH",
    role: "developer",
    summary: "Publish, install, and request approvals.",
  },
  {
    id: "member",
    person: "Mira",
    organization: "SYN-ORG-NORTH",
    role: "member",
    summary: "Install and request approvals. Publishing is refused.",
  },
  {
    id: "admin",
    person: "Elen",
    organization: "SYN-ORG-NORTH",
    role: "admin",
    summary: "Policies, approval decisions, and audit. Tool calls are refused.",
  },
  {
    id: "west",
    person: "Wes",
    organization: "SYN-ORG-WEST",
    role: "member",
    summary: "A separate organization. North installations stay invisible.",
  },
  {
    id: "self",
    person: "Mira",
    organization: "SYN-ORG-NORTH",
    role: "admin scopes on the member subject",
    summary: "Fixture probe. The API refuses when this subject approves its own request.",
  },
];

export function roleChoice(id: string): RoleChoice | undefined {
  return ROLE_CHOICES.find((choice) => choice.id === id);
}
