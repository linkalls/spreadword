export interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  id?: string | null;
}

export interface AuthButtonsProps {
  user: SessionUser | null;
}
