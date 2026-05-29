import { WorkspaceAuthShell } from "@/components/auth/workspace-auth-shell";

export const dynamic = "force-dynamic";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <WorkspaceAuthShell>{children}</WorkspaceAuthShell>;
}
