-- La tabla "deals" no tiene filas (0 registros en todos los negocios), asi que
-- se reemplaza el enum completo en vez de mapear valores uno a uno.
ALTER TABLE "deals" ALTER COLUMN "service" TYPE TEXT;
DROP TYPE "ServiceType";
CREATE TYPE "ServiceType" AS ENUM ('VentaAutos', 'SeguimientoClientes', 'Negociacion', 'CierreVentas', 'Postventa');
ALTER TABLE "deals" ALTER COLUMN "service" TYPE "ServiceType" USING ("service"::"ServiceType");
