import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Appetizers',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Main Course',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Drinks',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Desserts',
        order: 4,
      },
    }),
  ])

  console.log(`Created ${categories.length} categories`)

  // Create some tables
  const tables = await Promise.all([
    prisma.table.create({ data: { number: 1, seats: 2 } }),
    prisma.table.create({ data: { number: 2, seats: 4 } }),
    prisma.table.create({ data: { number: 3, seats: 4 } }),
    prisma.table.create({ data: { number: 4, seats: 6 } }),
    prisma.table.create({ data: { number: 5, seats: 8 } }),
  ])

  console.log(`Created ${tables.length} tables`)

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
