const bcrypt = require("bcryptjs");
const db = require("../src/config/database");

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // 1. Create admin
    console.log("Creating admin...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    await db.query(
      `INSERT INTO users (email, password, name, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [
        "admin@apartment.com",
        adminPassword,
        "System Admin",
        "SUPER_ADMIN",
        "+1234567890",
      ],
    );

    // 2. Create manager
    console.log("Creating manager...");
    const managerPassword = await bcrypt.hash("manager123", 10);
    await db.query(
      `INSERT INTO users (email, password, name, role, phone)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [
        "manager@apartment.com",
        managerPassword,
        "Property Manager",
        "MANAGER",
        "+1234567891",
      ],
    );

    // 3. Create apartments
    console.log("Creating apartments...");
    const apartments = [
      {
        unitNumber: "101",
        floor: 1,
        rentAmount: 1200,
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        unitNumber: "102",
        floor: 1,
        rentAmount: 1200,
        bedrooms: 2,
        bathrooms: 1,
      },
      {
        unitNumber: "201",
        floor: 2,
        rentAmount: 1500,
        bedrooms: 3,
        bathrooms: 2,
      },
      {
        unitNumber: "202",
        floor: 2,
        rentAmount: 1500,
        bedrooms: 3,
        bathrooms: 2,
      },
      {
        unitNumber: "301",
        floor: 3,
        rentAmount: 1800,
        bedrooms: 3,
        bathrooms: 2,
      },
      {
        unitNumber: "302",
        floor: 3,
        rentAmount: 1800,
        bedrooms: 3,
        bathrooms: 2,
      },
      {
        unitNumber: "401",
        floor: 4,
        rentAmount: 2000,
        bedrooms: 4,
        bathrooms: 3,
      },
    ];

    for (const apt of apartments) {
      await db.query(
        `INSERT INTO apartments (unit_number, floor, rent_amount, bedrooms, bathrooms)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (unit_number) DO NOTHING`,
        [
          apt.unitNumber,
          apt.floor,
          apt.rentAmount,
          apt.bedrooms,
          apt.bathrooms,
        ],
      );
    }

    // 4. Create tenants
    console.log("Creating tenants...");
    const tenants = [
      {
        email: "john.doe@email.com",
        name: "John Doe",
        unit: "101",
        phone: "+1234567892",
      },
      {
        email: "jane.smith@email.com",
        name: "Jane Smith",
        unit: "102",
        phone: "+1234567893",
      },
      {
        email: "bob.johnson@email.com",
        name: "Bob Johnson",
        unit: "201",
        phone: "+1234567894",
      },
    ];

    for (const tenant of tenants) {
      // Get apartment ID
      const aptResult = await db.query(
        "SELECT id FROM apartments WHERE unit_number = $1",
        [tenant.unit],
      );

      if (aptResult.rows.length > 0) {
        const hashedPassword = await bcrypt.hash("tenant123", 10);
        await db.query(
          `INSERT INTO users (email, password, name, phone, role, apartment_id)
           VALUES ($1, $2, $3, $4, 'TENANT', $5)
           ON CONFLICT (email) DO NOTHING`,
          [
            tenant.email,
            hashedPassword,
            tenant.name,
            tenant.phone,
            aptResult.rows[0].id,
          ],
        );

        // Mark apartment as occupied
        await db.query(
          "UPDATE apartments SET is_occupied = true WHERE unit_number = $1",
          [tenant.unit],
        );
      }
    }

    // 5. Create sample maintenance requests
    console.log("Creating maintenance requests...");
    const tenantResult = await db.query(
      "SELECT id, apartment_id FROM users WHERE role = $1 LIMIT 1",
      ["TENANT"],
    );

    if (tenantResult.rows.length > 0) {
      const tenant = tenantResult.rows[0];
      const requests = [
        {
          title: "Leaking Faucet",
          description: "Kitchen faucet is dripping",
          priority: "MEDIUM",
        },
        {
          title: "AC Not Working",
          description: "Air conditioning not cooling",
          priority: "URGENT",
        },
        {
          title: "Broken Window",
          description: "Living room window is cracked",
          priority: "HIGH",
        },
      ];

      for (const req of requests) {
        await db.query(
          `INSERT INTO maintenance_requests (title, description, priority, tenant_id, apartment_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            req.title,
            req.description,
            req.priority,
            tenant.id,
            tenant.apartment_id,
          ],
        );
      }
    }

    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
