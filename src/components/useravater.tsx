import { auth } from "../auth"
 
export default async function UserAvatar() {
  const session = await auth()
 
  if (!session?.user) return null
 
  return (
    <div>
      <p>name:{session.user!.name}</p>
      <p>email:{session.user!.email}</p>
    </div>
  )
}