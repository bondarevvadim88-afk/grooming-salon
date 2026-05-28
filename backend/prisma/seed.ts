// prisma/seed.ts
import { PrismaClient, PetType, PetSize } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Services ──────────────────────────────────────────────────────
  const services = await Promise.all([
    prisma.service.upsert({
      where:  { id: 'svc-bath' },
      update: {},
      create: {
        id: 'svc-bath', name: 'Купание', description: 'Шампунь, сушка, расчёска',
        basePrice: 800, durationMin: 60, coefSmall: 0.8, coefMedium: 1.0, coefLarge: 1.5,
      },
    }),
    prisma.service.upsert({
      where:  { id: 'svc-full' },
      update: {},
      create: {
        id: 'svc-full', name: 'Полный груминг', description: 'Купание + стрижка + укладка',
        basePrice: 2000, durationMin: 120, coefSmall: 0.8, coefMedium: 1.0, coefLarge: 1.5,
      },
    }),
    prisma.service.upsert({
      where:  { id: 'svc-trim' },
      update: {},
      create: {
        id: 'svc-trim', name: 'Стрижка', description: 'Модельная или гигиеническая',
        basePrice: 1200, durationMin: 75, coefSmall: 0.8, coefMedium: 1.0, coefLarge: 1.5,
      },
    }),
    prisma.service.upsert({
      where:  { id: 'svc-nails' },
      update: {},
      create: {
        id: 'svc-nails', name: 'Когти и уши', description: 'Стрижка когтей, чистка ушей',
        basePrice: 400, durationMin: 30, coefSmall: 1.0, coefMedium: 1.0, coefLarge: 1.5,
      },
    }),
    prisma.service.upsert({
      where:  { id: 'svc-spa' },
      update: {},
      create: {
        id: 'svc-spa', name: 'SPA-пакет', description: 'Маска, массаж, ароматизация',
        basePrice: 1500, durationMin: 90, coefSmall: 0.8, coefMedium: 1.0, coefLarge: 1.5,
      },
    }),
    prisma.service.upsert({
      where:  { id: 'svc-puppy' },
      update: {},
      create: {
        id: 'svc-puppy', name: 'Первый груминг', description: 'Мягкое знакомство для щенков',
        basePrice: 600, durationMin: 60, coefSmall: 1.0, coefMedium: 1.0, coefLarge: 1.0, isActive: false,
      },
    }),
 prisma.service.upsert({
  where: { id: 'svc-deshed' },
  update: {},
  create: {
    id: 'svc-deshed',
    name: 'Экспресс-линька',
    description: 'Интенсивный вычёс подшёрстка и уход в период линьки',
    basePrice: 2200,
    durationMin: 45,
    coefSmall: 0.8,
    coefMedium: 1.0,
    coefLarge: 1.4,
  },
}),
  ]);
  console.log(`  ✓ ${services.length} services`);

  // ── Staff ─────────────────────────────────────────────────────────
  const maria = await prisma.staff.upsert({
    where:  { id: 'staff-maria' },
    update: {},
    create: {
      id: 'staff-maria', name: 'Мария Соколова',
      specialty: 'Декоративные породы, кошки', bio: '7 лет опыта, IPG сертификат',
      rating: 4.9, reviewsCount: 142,
      workSchedules: {
        create: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '19:00' }, // Пн
          { dayOfWeek: 2, startTime: '09:00', endTime: '19:00' }, // Вт
          { dayOfWeek: 3, startTime: '09:00', endTime: '19:00' }, // Ср
          { dayOfWeek: 4, startTime: '09:00', endTime: '19:00' }, // Чт
          { dayOfWeek: 5, startTime: '09:00', endTime: '19:00' }, // Пт
          { dayOfWeek: 6, isWorking: false, startTime: '00:00', endTime: '00:00' },
          { dayOfWeek: 7, isWorking: false, startTime: '00:00', endTime: '00:00' },
        ],
      },
    },
  });

  const alexey = await prisma.staff.upsert({
    where:  { id: 'staff-alexey' },
    update: {},
    create: {
      id: 'staff-alexey', name: 'Алексей Морозов',
      specialty: 'Крупные и средние породы', bio: '5 лет опыта',
      rating: 4.7, reviewsCount: 98,
      workSchedules: {
        create: [
          { dayOfWeek: 1, isWorking: false, startTime: '00:00', endTime: '00:00' },
          { dayOfWeek: 2, startTime: '10:00', endTime: '20:00' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '20:00' },
          { dayOfWeek: 4, startTime: '10:00', endTime: '20:00' },
          { dayOfWeek: 5, startTime: '10:00', endTime: '20:00' },
          { dayOfWeek: 6, startTime: '10:00', endTime: '20:00' },
          { dayOfWeek: 7, isWorking: false, startTime: '00:00', endTime: '00:00' },
        ],
      },
    },
  });

  const elena = await prisma.staff.upsert({
    where:  { id: 'staff-elena' },
    update: {},
    create: {
      id: 'staff-elena', name: 'Елена Васильева',
      specialty: 'SPA-уход, первый груминг', bio: '6 лет опыта',
      rating: 4.8, reviewsCount: 115,
      workSchedules: {
        create: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' },
          { dayOfWeek: 6, isWorking: false, startTime: '00:00', endTime: '00:00' },
          { dayOfWeek: 7, isWorking: false, startTime: '00:00', endTime: '00:00' },
        ],
      },
    },
  });
  console.log('  ✓ 3 staff members');

  // ── StaffService links ────────────────────────────────────────────
  const links = [
    { staffId: maria.id,  serviceId: 'svc-bath'  },
    { staffId: maria.id,  serviceId: 'svc-full'  },
    { staffId: maria.id,  serviceId: 'svc-trim'  },
    { staffId: maria.id,  serviceId: 'svc-spa'   },
    { staffId: maria.id,  serviceId: 'svc-puppy' },
    { staffId: alexey.id, serviceId: 'svc-bath'  },
    { staffId: alexey.id, serviceId: 'svc-full'  },
    { staffId: alexey.id, serviceId: 'svc-trim'  },
    { staffId: elena.id,  serviceId: 'svc-bath'  },
    { staffId: elena.id,  serviceId: 'svc-full'  },
    { staffId: elena.id,  serviceId: 'svc-spa'   },
    { staffId: elena.id,  serviceId: 'svc-puppy' },
    { staffId: elena.id,  serviceId: 'svc-nails' },
    { staffId: maria.id, serviceId: 'svc-deshed' },
    { staffId: alexey.id, serviceId: 'svc-deshed' },
    { staffId: elena.id, serviceId: 'svc-deshed' },
  ];
  for (const link of links) {
    await prisma.staffService.upsert({
      where:  { staffId_serviceId: link },
      update: {},
      create: link,
    });
  }
  console.log(`  ✓ ${links.length} staff↔service links`);

  // ── Demo client + pet ─────────────────────────────────────────────
  const client = await prisma.client.upsert({
    where:  { phone: '+79161234567' },
    update: {},
    create: {
      name: 'Анна Смирнова', phone: '+79161234567', email: 'anna@example.com',
      preferences: {
        create: { smsEnabled: true, emailEnabled: true },
      },
      pets: {
        create: [
          { name: 'Бублик', type: PetType.DOG, breed: 'Пудель', size: PetSize.SMALL, age: 3 },
        ],
      },
    },
  });
  console.log('  ✓ Demo client: Анна Смирнова');

  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where:  { email: 'admin@lyubi-grooming.ru' },
    update: {},
    create: { email: 'admin@lyubi-grooming.ru', password: adminHash, role: 'ADMIN' },
  });
  console.log('  ✓ Admin user created: admin@lyubi-grooming.ru / admin123');

  console.log('\n🎉 Seed complete!');
  console.log(`  ✓ ${services.length} services`);
  console.log(`  ✓ ${links.length} staff↔service links`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
