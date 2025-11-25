# FracturasCadera

Manual breve — desde clonar hasta ejecutar frontend y backend

Este manual explica cómo clonar, preparar y ejecutar este proyecto (Backend + Front) en un entorno de desarrollo Linux (incluye instrucciones para usar el script `setup.sh` que gestiona Node/Bun, PostgreSQL, y la instalación de dependencias). El script requiere `sudo` si no se ejecuta como root.

Requisitos básicos
- Git (para clonar el repositorio)
- Un sistema compatible con apt/dnf/yum/pacman/zypper/apk/brew
- `bash` y `sudo` (si no se ejecuta como root)
- Un navegador para abrir la aplicación frontend

Contenido del repositorio
- `Backend/` — Código del servidor (Express, Node/Bun). Por defecto escucha en `PORT=3001`.
- `Front/` — Aplicación Next.js. Por defecto escucha en `3000`.
- `setup.sh` — Script de aprovisionamiento para instalar Node, PostgreSQL, Bun, crear la base de datos, generar `.env` y ejecutar `bun install` en ambos proyectos.

1) Clonar el repositorio
```bash
git clone https://github.com/SofiaLopezO/FracturasCaderaSeminario
cd FracturasCaderaSeminario
```

2) Revisar/ajustar variables de entorno antes de ejecutar el setup (opcional)
El script `setup.sh` usa variables por defecto si no las exportas. Un ejemplo de variables que puedes personalizar:
```bash
export PGUSER=fracturas
export PGPASSWORD=mi_pwd_segura
export PGDATABASE=fracturas
export NODE_TARGET_MAJOR=20
# O ejecutarlo inline:
# PGUSER=fracturas PGPASSWORD=mi_pwd_segura PGDATABASE=fracturas NODE_TARGET_MAJOR=20 ./setup.sh
```

3) Ejecutar el script de aprovisionamiento (`setup.sh`)
El script hace lo siguiente:
- Instala Node.js si falta o la versión es menor al mínimo definido
- Instala Postgres si falta
- Instala Bun si falta
- Crea el rol/usuario en Postgres y la base de datos
- Genera `Backend/.env` y `Front/.env.local` si no existen
- Ejecuta `bun install` en Backend y Front

Ejecuta el script (de preferencia como usuario con `sudo` habilitado):
```bash
chmod +x setup.sh
./setup.sh
```

4) Comprobar instalaciones
```bash
node -v    # debe ser >= 18 (el script intenta instalar 20 por defecto)
bun -v
psql --version
```

5) Levantar backend y frontend (modo desarrollo)
Para correr ambos servicios en paralelo necesitas dos terminales separadas —cada una ejecutando un proceso distinto. Sin eso, uno de los entornos se quedará sin aire y no levantará.
- Backend (por defecto escucha en `PORT=3001`):
```bash
cd Backend
bun run dev
```
- Frontend (por defecto en `3000`):
```bash
cd Front
bun run dev
```

6) Verificar que las aplicaciones estén accesibles
- Abre en el navegador: `http://localhost:3000` (frontend)


7) Rutas y variables importantes (defaults que genera `setup.sh`)
- Backend `.env` (ejemplo generado):
	- `PORT=3001`
	- `API_BASE=/api/v1`
	- `PGHOST=localhost`, `PGPORT=5432`, `PGDATABASE=fracturas`, `PGUSER=postgres`, `PGPASSWORD=123` (cambia el password)
	- `JWT_SECRET` y otros valores de seguridad deben actualizarse para producción
- Front `.env.local` (ejemplo):
	- `NEXT_PUBLIC_API_BASE=http://localhost:3001/api/v1`
	- `NEXT_PUBLIC_APP_URL=http://localhost:3000`



