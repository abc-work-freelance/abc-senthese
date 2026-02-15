# Fix migration drift (no data loss)

Your database was created without Prisma Migrate, so Prisma detected "drift". Follow these steps **in order** to fix it without resetting the DB.

## Step 1: Baseline the current database

Tell Prisma that the current DB state matches the baseline migration (so it stops asking for a reset):

```bash
npx prisma migrate resolve --applied 0_init
```

This only updates the migration history table; it does **not** run the baseline SQL or change your data.

## Step 2: Add the new columns (address, clinique, doctorName)

Create and apply the migration that adds the three new columns:

```bash
npx prisma migrate dev --name add_address_clinique_doctor_optional
```

Prisma will generate the migration and apply it to your database. No reset, no data loss.

## Step 3: Regenerate the client (if needed)

```bash
npx prisma generate
```

After this, `npx prisma migrate status` should report no drift.
