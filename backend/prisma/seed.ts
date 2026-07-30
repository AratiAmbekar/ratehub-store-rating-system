import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();


async function createUser(
  email: string,
  name: string,
  address: string,
  role: Role,
  password: string
) {
  return prisma.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      email,
      name,
      address,
      password,
      role,
    },
  });
}


async function main() {

  console.log("🌱 Starting database seeding...");


  // Common password for all test users
  const hashedPassword = await bcrypt.hash(
    "Password123!",
    10
  );


  /*
    1. CREATE ADMIN
  */

  const admin = await createUser(
    "admin@ratings.com",
    "System Administrator Admin",
    "123 Main Admin HQ Street, San Francisco, CA",
    Role.ADMIN,
    hashedPassword
  );


  console.log(
    "✅ Admin created:",
    admin.email
  );



  /*
    2. CREATE STORE OWNERS
  */

  const storeOwners = [];


  // Fixed demo stores
  const demoStores = [
    {
      email:"coffee@ratings.com",
      name:"Gourmet Coffee Roasters Cafe",
      address:"Seattle Washington"
    },
    {
      email:"tech@ratings.com",
      name:"SuperTech Gadget World Store",
      address:"San Jose California"
    },
    {
      email:"market@ratings.com",
      name:"Organic Harvest Food Market",
      address:"Portland Oregon"
    }
  ];


  for(const store of demoStores){

    const createdStore = await createUser(
      store.email,
      store.name,
      store.address,
      Role.STORE_OWNER,
      hashedPassword
    );

    storeOwners.push(createdStore);
  }



  // Generate additional 47 stores

  for(let i=1;i<=47;i++){

    const store = await prisma.user.create({

      data:{
        email:`store${i}@ratings.com`,

        name:
          faker.company.name()
          .slice(0,60),

        address:
          faker.location.streetAddress()
          .slice(0,400),

        password:hashedPassword,

        role:Role.STORE_OWNER
      }

    });


    storeOwners.push(store);
  }


  console.log(
    `✅ ${storeOwners.length} store owners created`
  );




  /*
    3. CREATE NORMAL USERS
  */


  const users=[];


  // Fixed users

  const user1 = await createUser(
    "alex@ratings.com",
    "Alexander Graham Bell Harrison",
    "Boston Massachusetts",
    Role.NORMAL_USER,
    hashedPassword
  );


  const user2 = await createUser(
    "elizabeth@ratings.com",
    "Elizabeth Cady Stanton Smith",
    "New York USA",
    Role.NORMAL_USER,
    hashedPassword
  );


  users.push(user1,user2);



  // Generate 198 users

  for(let i=1;i<=198;i++){

    const user = await prisma.user.create({

      data:{

        email:`user${i}@ratings.com`,

        name:
          faker.person.fullName()
          .slice(0,60),

        address:
          faker.location.streetAddress()
          .slice(0,400),

        password:hashedPassword,

        role:Role.NORMAL_USER

      }

    });


    users.push(user);

  }


  console.log(
    `✅ ${users.length} normal users created`
  );




  /*
    4. CREATE RATINGS
  */


  let ratingCount = 0;


  for(const user of users){


    for(const store of storeOwners){


      // Randomly create ratings
      // around 30% probability

      if(Math.random() < 0.3){


        try{

          await prisma.rating.create({

            data:{

              value:
                Math.floor(
                  Math.random()*5
                ) + 1,


              userId:user.id,


              storeOwnerId:
                store.id

            }

          });


          ratingCount++;


        }
        catch(error){

          // Ignore duplicate ratings
          // because of unique constraint

        }


      }


    }

  }



  console.log(
    `✅ ${ratingCount} ratings created`
  );



  console.log(
    `
    🎉 Database seeding completed

    Admin:
    admin@ratings.com

    Password:
    Password123!

    Total Data:

    Users:
    ${users.length}

    Stores:
    ${storeOwners.length}

    Ratings:
    ${ratingCount}
    `
  );


}



main()

.catch((error)=>{

  console.error(
    "❌ Seeding failed:",
    error
  );

  process.exit(1);

})


.finally(async()=>{

  await prisma.$disconnect();

});