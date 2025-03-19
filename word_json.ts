import { db } from "@/db/dbclient";
import { UserRoleEnum, userRoles } from "@/db/schema";

const userToAdmin = async (userid: string) => {
  try{
     await db.insert(userRoles).values({
    userId: userid,
    role: UserRoleEnum.ADMIN,
  });
  }catch(err){
    console.log(err);
  }
 
};

await userToAdmin("578ba444-3ca2-4b74-9566-9e9504f64743");
